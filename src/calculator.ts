import { trueSolarTime, tzOffsetMinutes } from "ziwei-time";

export const ENGINE_VERSION = "true-solar-time-mcp/0.1.0";

export interface TrueSolarTimeInput {
  date: string;
  time: string;
  timezone: string;
  longitude: number;
  latitude?: number;
}

export interface TrueSolarTimeResult {
  engineVersion: string;
  input: TrueSolarTimeInput;
  civil: { date: string; time: string };
  trueSolar: { date: string; time: string };
  utcIso: string;
  correction: {
    totalMinutes: number;
    longitudeMinutes: number;
    equationOfTimeMinutes: number;
    dstMinutes: number;
    dayShift: number;
  };
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2})$/;

function parseDateTime(date: string, time: string) {
  const dateMatch = DATE_RE.exec(date);
  const timeMatch = TIME_RE.exec(time);
  if (!dateMatch || !timeMatch)
    throw new Error("date must use YYYY-MM-DD and time must use HH:mm");

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    throw new Error("date or time is invalid");
  }
  return { year, month, day, hour, minute };
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function partsFromUtcOffset(utcMs: number, offsetMinutes: number) {
  const value = new Date(utcMs + offsetMinutes * 60_000);
  return {
    date: `${value.getUTCFullYear()}-${pad2(value.getUTCMonth() + 1)}-${pad2(value.getUTCDate())}`,
    time: `${pad2(value.getUTCHours())}:${pad2(value.getUTCMinutes())}`,
  };
}

function calendarDayShift(fromDate: string, toDate: string) {
  const from = parseDateTime(fromDate, "00:00");
  const to = parseDateTime(toDate, "00:00");
  return Math.round(
    (Date.UTC(to.year, to.month - 1, to.day) -
      Date.UTC(from.year, from.month - 1, from.day)) /
      86_400_000,
  );
}

function standardOffsetMinutes(utcMs: number, timezone: string) {
  const year = new Date(utcMs).getUTCFullYear();
  const candidates = [
    tzOffsetMinutes(Date.UTC(year, 0, 1), timezone),
    tzOffsetMinutes(Date.UTC(year, 6, 1), timezone),
  ].filter((value): value is number => value !== null);
  return candidates.length > 0 ? Math.min(...candidates) : null;
}

function nearestHourBoundaryMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute;
  const boundaries = Array.from({ length: 12 }, (_, index) => 60 + index * 120);
  return Math.min(
    ...boundaries.map((value) => Math.abs(total - value)),
    total,
    Math.abs(1440 - total),
  );
}

function confidenceFor(boundaryMinutes: number, crossedDate: boolean) {
  if (boundaryMinutes <= 10) return "low" as const;
  if (boundaryMinutes <= 30 || crossedDate) return "medium" as const;
  return "high" as const;
}

export function calculateTrueSolarTime(
  input: TrueSolarTimeInput,
): TrueSolarTimeResult {
  parseDateTime(input.date, input.time);
  if (
    !Number.isFinite(input.longitude) ||
    input.longitude < -180 ||
    input.longitude > 180
  )
    throw new Error("longitude must be between -180 and 180");
  if (
    input.latitude !== undefined &&
    (!Number.isFinite(input.latitude) ||
      input.latitude < -90 ||
      input.latitude > 90)
  ) {
    throw new Error("latitude must be between -90 and 90");
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: input.timezone }).format();
  } catch {
    throw new Error("timezone must be a valid IANA time zone");
  }

  const wallClockAsUtc = Date.UTC(
    parseDateTime(input.date, input.time).year,
    parseDateTime(input.date, input.time).month - 1,
    parseDateTime(input.date, input.time).day,
    parseDateTime(input.date, input.time).hour,
    parseDateTime(input.date, input.time).minute,
  );
  const localOffset = tzOffsetMinutes(wallClockAsUtc, input.timezone);
  if (localOffset === null)
    throw new Error("timezone offset could not be resolved");
  const utcMs = wallClockAsUtc - localOffset * 60_000;
  const refinedOffset = tzOffsetMinutes(utcMs, input.timezone);
  if (refinedOffset === null)
    throw new Error("historical timezone could not be resolved");

  const solar = trueSolarTime({
    date: input.date,
    time: input.time,
    timezone: input.timezone,
    longitude: input.longitude,
    latitude: input.latitude,
    equationOfTime: true,
  });
  const totalMinutes = input.longitude * 4 - refinedOffset + solar.eotMinutes;
  const corrected = new Date(
    wallClockAsUtc + Math.round(totalMinutes) * 60_000,
  );
  const trueSolar = partsFromUtcOffset(corrected.getTime(), 0);
  const standardOffset = standardOffsetMinutes(utcMs, input.timezone);
  const dayShift = calendarDayShift(input.date, trueSolar.date);
  const boundaryMinutes = nearestHourBoundaryMinutes(trueSolar.time);
  const warnings: string[] = [];
  if (dayShift !== 0) warnings.push("true_solar_date_shift");
  if (boundaryMinutes <= 30) warnings.push("near_hour_boundary");

  return {
    engineVersion: ENGINE_VERSION,
    input,
    civil: { date: input.date, time: input.time },
    trueSolar,
    utcIso: new Date(utcMs).toISOString(),
    correction: {
      totalMinutes: Math.round(totalMinutes),
      longitudeMinutes: Math.round(input.longitude * 4 - refinedOffset),
      equationOfTimeMinutes: solar.eotMinutes,
      dstMinutes: standardOffset === null ? 0 : refinedOffset - standardOffset,
      dayShift,
    },
    confidence: confidenceFor(boundaryMinutes, dayShift !== 0),
    warnings,
  };
}

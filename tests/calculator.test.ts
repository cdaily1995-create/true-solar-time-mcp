import assert from "node:assert/strict";
import test from "node:test";

import { calculateTrueSolarTime } from "../src/calculator.js";

test("returns a deterministic solar correction from timezone and longitude", () => {
  const result = calculateTrueSolarTime({
    date: "1990-05-20",
    time: "14:30",
    timezone: "Asia/Shanghai",
    longitude: 104.0668,
    latitude: 30.5728,
  });

  assert.equal(result.civil.time, "14:30");
  assert.equal(result.input.timezone, "Asia/Shanghai");
  assert.equal(result.input.longitude, 104.0668);
  assert.match(result.utcIso, /^1990-05-20T/);
  assert.ok(Number.isFinite(result.correction.totalMinutes));
  assert.ok(["high", "medium", "low"].includes(result.confidence));
});

test("rejects an invalid timezone and longitude", () => {
  assert.throws(
    () =>
      calculateTrueSolarTime({
        date: "1990-05-20",
        time: "14:30",
        timezone: "Not/AZone",
        longitude: 0,
      }),
    /IANA time zone/,
  );
  assert.throws(
    () =>
      calculateTrueSolarTime({
        date: "1990-05-20",
        time: "14:30",
        timezone: "UTC",
        longitude: 181,
      }),
    /longitude/,
  );
});

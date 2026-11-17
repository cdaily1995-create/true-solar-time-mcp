declare module 'ziwei-time' {
  export function tzOffsetMinutes(utcMs: number, timeZone: string): number | null;
  export function trueSolarTime(options: {
    date: string;
    time: string;
    timezone?: string;
    longitude: number;
    latitude?: number;
    equationOfTime?: boolean;
  }): {
    eotMinutes: number;
  };
}

# True Solar Time MCP

`true-solar-time-mcp` is a small, read-only Model Context Protocol server for converting local civil time into local apparent true solar time.

It is designed for assistants and applications that already have a date, local time, IANA time zone, and geographic longitude. It does **not** geocode addresses, call a language model, persist birth data, or provide fortune-telling text.

## Tool

### `calculate_true_solar_time`

Input:

```json
{
  "date": "1990-05-20",
  "time": "14:30",
  "timezone": "Asia/Shanghai",
  "longitude": 104.0668,
  "latitude": 30.5728
}
```

`longitude` is required and uses decimal degrees with east positive. `latitude` is optional and is retained for traceability; the correction is driven by longitude, the time-zone offset, and the equation of time.

The result includes the civil time, UTC instant, corrected true solar time, longitude correction, equation-of-time correction, DST correction, date shifts, warnings, and a confidence label.

## Run locally

```bash
pnpm install
pnpm build
pnpm start
```

MCP client configuration:

```json
{
  "mcpServers": {
    "true-solar-time": {
      "command": "node",
      "args": ["/absolute/path/to/true-solar-time-mcp/dist/server.js"]
    }
  }
}
```

## Search-friendly description

This project is a true solar time calculator for birth-time normalization. It explains how civil time, longitude, historical time zones, daylight-saving offsets, and the equation of time affect local apparent solar time. It is useful for BaZi, Four Pillars, traditional calendar, astronomy, and time-normalization workflows where reproducible numeric output is more important than interpretation.

## Privacy and scope

The server accepts coordinates and time-zone identifiers only. It has no address search, analytics, database, account, payment, or external API requirement. Results are calculated locally by the process running the MCP server.

This is a time conversion utility, not scientific proof of any astrological interpretation and not a prediction service.

## License

MIT

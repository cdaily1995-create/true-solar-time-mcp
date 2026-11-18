# True Solar Time MCP Server

[![MCP server](https://img.shields.io/badge/MCP-server-5f5bd6)](https://modelcontextprotocol.io/)
[![npm package](https://img.shields.io/npm/v/bazi-true-solar-time-mcp.svg)](https://www.npmjs.com/package/bazi-true-solar-time-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![AllMCPs Verified](https://allmcps.com/api/badge/bazi-true-solar-time-mcp)](https://allmcps.com/mcp/bazi-true-solar-time-mcp?verify=4823551c-f607-4d63-a67f-ce4a81a7476b)

An [MCP](https://modelcontextprotocol.io/) server for deterministic **true solar time** conversion from a local civil time, IANA timezone, and longitude.

Built for reproducible calendrical, astronomy, BaZi, and Four Pillars workflows. The server is intentionally narrow: it does not geocode an address, call a language model, persist birth data, or generate fortune-telling text.

## Why this is useful

- **No address lookup.** Pass the timezone and coordinates you already trust; there is no hidden geocoding request.
- **Transparent correction.** The result separates longitude correction, equation of time, DST correction, UTC, and date rollover.
- **MCP-native.** One read-only tool works with Claude Desktop, Cursor, Codex, and other MCP clients.
- **Privacy-friendly.** Calculation is local to the process running the server.

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

## Quick start

Run directly from npm:

```bash
npx -y bazi-true-solar-time-mcp
```

Or inspect and build from source:

```bash
git clone https://github.com/cdaily1995-create/true-solar-time-mcp.git
cd true-solar-time-mcp
pnpm install
pnpm build
node dist/server.js
```

MCP client configuration:

```json
{
  "mcpServers": {
    "true-solar-time": {
      "command": "npx",
      "args": ["-y", "bazi-true-solar-time-mcp"]
    }
  }
}
```

## Example

```text
calculate_true_solar_time {
  "date": "2002-07-07",
  "time": "05:05",
  "timezone": "America/Los_Angeles",
  "longitude": -118.2437,
  "latitude": 34.0522
}
```

The response includes a versioned `engineVersion`, the UTC instant, the corrected local apparent solar time, each correction component, warnings, and confidence.

## Input contract

| Field       | Required | Description                                                       |
| ----------- | -------- | ----------------------------------------------------------------- |
| `date`      | yes      | Local civil date in `YYYY-MM-DD`.                                 |
| `time`      | yes      | Local civil time in `HH:mm`.                                      |
| `timezone`  | yes      | IANA identifier such as `Asia/Shanghai` or `America/Los_Angeles`. |
| `longitude` | yes      | Decimal degrees, east positive, from `-180` to `180`.             |
| `latitude`  | no       | Decimal degrees, from `-90` to `90`; retained for traceability.   |

## Links

- [BaZi Calculator](https://bazi-calculator.co/) — the public calculator project using this kind of time normalization.
- [Four Pillars of Destiny guide](https://bazi-calculator.co/four-pillars-of-destiny) — background on the chart context.
- [What is a BaZi chart?](https://bazi-calculator.co/what-is-a-bazi-chart) — plain-language chart explanation.
- [Four Pillars MCP Server](https://github.com/cdaily1995-create/four-pillars-mcp) — the companion deterministic chart calculator.
- [npm package](https://www.npmjs.com/package/bazi-true-solar-time-mcp) — installable stdio MCP server.
- [MCP specification](https://modelcontextprotocol.io/) — protocol documentation.
- [MCP TypeScript server SDK](https://www.npmjs.com/package/@modelcontextprotocol/server) — server SDK used by this project.
- [npm installation guide](https://docs.npmjs.com/downloading-and-installing-packages-globally) — package-manager reference.
- [Full link inventory](LINKS.md) and [method references](REFERENCES.md).

## Search-friendly description

This project is a true solar time calculator for birth-time normalization. It explains how civil time, longitude, historical time zones, daylight-saving offsets, and the equation of time affect local apparent solar time. It is useful for BaZi, Four Pillars, traditional calendar, astronomy, and time-normalization workflows where reproducible numeric output is more important than interpretation.

## Privacy and scope

The server accepts coordinates and time-zone identifiers only. It has no address search, analytics, database, account, payment, or external API requirement. Results are calculated locally by the process running the MCP server.

This is a time conversion utility, not scientific proof of any astrological interpretation and not a prediction service.

## License

MIT

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';

import { calculateTrueSolarTime } from './calculator.js';

const inputSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe('Local civil date in YYYY-MM-DD format.'),
    time: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
      .describe('Local civil time in HH:mm format.'),
    timezone: z
      .string()
      .min(1)
      .max(80)
      .describe(
        'IANA time zone, for example Asia/Shanghai or America/Los_Angeles.'
      ),
    longitude: z
      .number()
      .finite()
      .min(-180)
      .max(180)
      .describe('Birth longitude in decimal degrees, east positive.'),
    latitude: z
      .number()
      .finite()
      .min(-90)
      .max(90)
      .optional()
      .describe('Optional birth latitude in decimal degrees.'),
  })
  .strict();

const server = new McpServer(
  {
    name: 'true-solar-time-mcp',
    title: 'True Solar Time Calculator',
    version: '0.1.0',
  },
  {
    instructions:
      'This server performs deterministic true solar time conversion. It does not geocode addresses, store personal data, or provide astrological interpretation. Pass an IANA timezone and decimal longitude directly.',
  }
);

server.registerTool(
  'calculate_true_solar_time',
  {
    description:
      'Convert a local civil birth time to local apparent true solar time using the supplied IANA timezone and longitude. Returns UTC, longitude correction, equation of time, DST correction, date-shift warnings, and confidence. No address lookup is performed.',
    inputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      const result = calculateTrueSolarTime(input);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
        structuredContent: result,
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text:
              error instanceof Error ? error.message : 'Calculation failed.',
          },
        ],
      };
    }
  }
);

serveStdio(() => server, {
  onerror: (error) => console.error('true-solar-time-mcp error:', error),
});

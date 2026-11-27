import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { atlas as defaultAtlas, type Atlas, type Month } from 'harvest-atlas';
import * as z from 'zod';
import {
  findProducers,
  inSeason,
  listRegions,
  produceSeason,
  searchProduce,
  ToolError,
} from './tools.js';

const region = z
  .string()
  .describe(
    'ISO 3166 code: a country (GB, IE, FR, US, AU) or a subdivision (US-CA, AU-VIC, GB-SCT).',
  );
const locale = z
  .enum(['en-GB', 'en-US', 'en-AU', 'fr-FR'])
  .optional()
  .describe("Language for produce names. Defaults to the region's own.");
const readOnly = { readOnlyHint: true, openWorldHint: false } as const;

function respond(run: () => unknown) {
  try {
    return { content: [{ type: 'text' as const, text: JSON.stringify(run(), null, 2) }] };
  } catch (error) {
    if (error instanceof ToolError || error instanceof RangeError) {
      return { isError: true, content: [{ type: 'text' as const, text: error.message }] };
    }
    throw error;
  }
}

export function createServer(atlas: Atlas = defaultAtlas, version = '0.1.0') {
  const server = new McpServer(
    { name: 'harvest-atlas', version },
    {
      instructions:
        "Harvest Atlas says when fruit and vegetables are grown locally, by country and region, with a source for every season. Use it to plan meals around what's in season. Regions without their own data fall back to their country's. Months are 1-12; the southern hemisphere's seasons are reversed. Give the user the sources when they ask how you know.",
    },
  );

  server.registerTool(
    'in_season',
    {
      title: "What's in season",
      description:
        'Fruit and vegetables grown locally in a region in a given month, peak first. Use for "what\'s in season now" or meal planning.',
      inputSchema: {
        region,
        month: z
          .number()
          .int()
          .min(1)
          .max(12)
          .optional()
          .describe('1-12. Defaults to the current month.'),
        include_storage: z
          .boolean()
          .optional()
          .describe(
            'Also include local crops sold from storage, such as winter apples and potatoes.',
          ),
        category: z.enum(['vegetable', 'fruit', 'herb', 'nut', 'mushroom']).optional(),
        locale,
      },
      annotations: readOnly,
    },
    async (args) =>
      respond(() => inSeason(atlas, { ...args, month: args.month as Month | undefined })),
  );

  server.registerTool(
    'produce_season',
    {
      title: 'Season of one fruit or vegetable',
      description:
        'When one fruit or vegetable is in season in a region: peak, available and storage months, confidence and sources.',
      inputSchema: {
        produce: z
          .string()
          .describe('An id such as "courgette" or any name, such as "zucchini" or "fraises".'),
        region,
        locale,
      },
      annotations: readOnly,
    },
    async (args) => respond(() => produceSeason(atlas, args)),
  );

  server.registerTool(
    'search_produce',
    {
      title: 'Find produce',
      description:
        'Find produce ids by name in any supported language ("eggplant", "aubergine", "capsicum").',
      inputSchema: { query: z.string().min(1) },
      annotations: readOnly,
    },
    async (args) => respond(() => searchProduce(atlas, args)),
  );

  server.registerTool(
    'list_regions',
    {
      title: 'List regions',
      description: 'Region codes the atlas knows, and which have their own season data.',
      inputSchema: {
        country: z
          .string()
          .optional()
          .describe('Only this country and its subdivisions, e.g. "US".'),
      },
      annotations: readOnly,
    },
    async (args) => respond(() => listRegions(atlas, args)),
  );

  server.registerTool(
    'find_producers',
    {
      title: 'Find local producers',
      description:
        'Farms, markets and farm shops in a region, optionally only those growing one produce.',
      inputSchema: { region, produce: z.string().optional() },
      annotations: readOnly,
    },
    async (args) => respond(() => findProducers(atlas, args)),
  );

  return server;
}

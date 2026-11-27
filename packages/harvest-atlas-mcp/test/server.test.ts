import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createAtlas, type Dataset } from 'harvest-atlas';
import { describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';
import { inSeason, produceSeason } from '../src/tools.js';

const data: Dataset = {
  produce: [
    {
      id: 'courgette',
      category: 'vegetable',
      names: {
        'en-GB': { one: 'courgette', other: 'courgettes' },
        'en-US': { one: 'zucchini', other: 'zucchini' },
      },
    },
    { id: 'apple', category: 'fruit', names: { 'en-GB': { one: 'apple', other: 'apples' } } },
  ],
  regions: [
    { code: 'US', name: 'United States', hemisphere: 'north', locale: 'en-US' },
    { code: 'US-CA', name: 'California', parent: 'US', hemisphere: 'north', locale: 'en-US' },
  ],
  sources: [
    {
      id: 'us-snap',
      title: 'Seasonal Produce Guide',
      publisher: 'USDA',
      url: 'https://example.gov/guide',
      kind: 'government',
      licence: 'public-domain-us-gov',
      accessed: '2026-11-27',
    },
  ],
  seasons: {
    US: [
      { produce: 'apple', peak: [9, 10], storage: [1], sources: ['us-snap'], confidence: 'medium' },
      { produce: 'courgette', available: [6, 7, 8], sources: ['us-snap'], confidence: 'medium' },
    ],
  },
  producers: {},
};
const atlas = createAtlas(data);

describe('tools', () => {
  it('names produce in the region’s language and says whose data answered', () => {
    const result = inSeason(atlas, { region: 'us-ca', month: 7 });
    expect(result.items).toEqual([
      {
        id: 'courgette',
        name: 'zucchini',
        category: 'vegetable',
        level: 'available',
        confidence: 'medium',
        data_from: 'US',
      },
    ]);
  });

  it('defaults to the current month and says so', () => {
    const result = inSeason(atlas, { region: 'US' }, new Date(2026, 9, 3));
    expect(result.month).toBe(10);
    expect(result.month_was_given).toBe(false);
    expect(result.items.map((i) => i.id)).toEqual(['apple']);
  });

  it('includes storage only when asked', () => {
    expect(inSeason(atlas, { region: 'US', month: 1 }).count).toBe(0);
    expect(inSeason(atlas, { region: 'US', month: 1, include_storage: true }).count).toBe(1);
  });

  it('resolves produce by any name and returns its sources', () => {
    const result = produceSeason(atlas, { produce: 'Zucchini', region: 'US' });
    expect(result).toMatchObject({ found: true, available: [6, 7, 8], peak: [] });
    if (!result.found) throw new Error('expected a season');
    expect(result.sources[0]).toMatchObject({ publisher: 'USDA', licence: 'public-domain-us-gov' });
  });
});

describe('server over MCP', () => {
  async function connect() {
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await createServer(atlas).connect(serverSide);
    const client = new Client({ name: 'test', version: '0' });
    await client.connect(clientSide);
    return client;
  }

  it('lists five read-only tools', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'find_producers',
      'in_season',
      'list_regions',
      'produce_season',
      'search_produce',
    ]);
    for (const t of tools) expect(t.annotations?.readOnlyHint).toBe(true);
  });

  it('answers in_season', async () => {
    const client = await connect();
    const result = await client.callTool({
      name: 'in_season',
      arguments: { region: 'US', month: 9 },
    });
    const body = JSON.parse((result.content as Array<{ text: string }>)[0]!.text);
    expect(body.items.map((i: { id: string }) => i.id)).toEqual(['apple']);
  });

  it('returns a tool error, not a crash, for an unknown region or produce', async () => {
    const client = await connect();
    const badRegion = await client.callTool({ name: 'in_season', arguments: { region: 'XX' } });
    expect(badRegion.isError).toBe(true);
    const badProduce = await client.callTool({
      name: 'produce_season',
      arguments: { produce: 'durian', region: 'US' },
    });
    expect(badProduce.isError).toBe(true);
  });

  it('rejects an out-of-range month', async () => {
    const client = await connect();
    const result = await client.callTool({
      name: 'in_season',
      arguments: { region: 'US', month: 13 },
    });
    expect(result.isError).toBe(true);
  });
});

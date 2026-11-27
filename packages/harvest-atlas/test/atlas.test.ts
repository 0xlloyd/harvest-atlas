import { describe, expect, it } from 'vitest';
import { createAtlas, levelIn } from '../src/atlas.js';
import type { Dataset } from '../src/types.js';

const fixture: Dataset = {
  produce: [
    {
      id: 'courgette',
      category: 'vegetable',
      names: {
        'en-GB': { one: 'courgette', other: 'courgettes' },
        'en-US': { one: 'zucchini', other: 'zucchini' },
        'fr-FR': { one: 'courgette', other: 'courgettes' },
      },
    },
    { id: 'apple', category: 'fruit', names: { 'en-GB': { one: 'apple', other: 'apples' } } },
    { id: 'kale', category: 'vegetable', names: { 'en-GB': { one: 'kale', other: 'kale' } } },
    {
      id: 'pea',
      category: 'vegetable',
      names: {
        'en-GB': { one: 'pea', other: 'peas' },
        'fr-FR': { one: 'petit pois', other: 'petits pois' },
      },
    },
  ],
  regions: [
    { code: 'US', name: 'United States', hemisphere: 'north', locale: 'en-US' },
    { code: 'US-CA', name: 'California', parent: 'US', hemisphere: 'north', locale: 'en-US' },
    { code: 'US-NY', name: 'New York', parent: 'US', hemisphere: 'north', locale: 'en-US' },
    { code: 'AU', name: 'Australia', hemisphere: 'south', locale: 'en-AU' },
  ],
  sources: [],
  seasons: {
    US: [
      {
        produce: 'apple',
        peak: [9, 10],
        available: [8, 11],
        storage: [12, 1, 2],
        sources: ['us-a'],
        confidence: 'medium',
      },
      { produce: 'courgette', available: [6, 7, 8], sources: ['us-a'], confidence: 'medium' },
      { produce: 'kale', available: [10, 11], sources: ['us-a'], confidence: 'low' },
    ],
    'US-CA': [
      {
        produce: 'courgette',
        peak: [5, 6],
        available: [4, 7, 8, 9],
        sources: ['us-ca'],
        confidence: 'high',
      },
    ],
  },
  producers: {
    'US-CA': [
      {
        id: 'sunny-farm',
        name: 'Sunny Farm',
        kind: 'farm',
        locality: 'Davis',
        produce: ['courgette'],
        basis: { type: 'self-submitted', submitted: '2026-11-01' },
        updated: '2026-11-01',
      },
    ],
    'US-NY': [
      {
        id: 'union-square',
        name: 'Union Square Greenmarket',
        kind: 'market',
        locality: 'New York',
        basis: { type: 'self-submitted', submitted: '2026-11-01' },
        updated: '2026-11-01',
      },
    ],
  },
};

const atlas = createAtlas(fixture);

describe('levelIn', () => {
  it('gives the level a month is in, or nothing out of season', () => {
    const apple = fixture.seasons.US![0]!;
    expect(levelIn(apple, 9)).toBe('peak');
    expect(levelIn(apple, 8)).toBe('available');
    expect(levelIn(apple, 1)).toBe('storage');
    expect(levelIn(apple, 5)).toBeUndefined();
  });
});

describe('seasonOf', () => {
  it('uses the region’s own data when it has an entry', () => {
    expect(atlas.seasonOf('courgette', 'US-CA')).toMatchObject({ region: 'US-CA', peak: [5, 6] });
  });

  it('falls back to the country for produce the region has no entry for', () => {
    expect(atlas.seasonOf('apple', 'US-CA')).toMatchObject({ region: 'US', peak: [9, 10] });
  });

  it('accepts lower-case codes', () => {
    expect(atlas.seasonOf('apple', 'us-ny')?.region).toBe('US');
  });

  it('returns nothing where no data covers the produce', () => {
    expect(atlas.seasonOf('apple', 'AU')).toBeUndefined();
  });

  it('rejects an unknown region instead of guessing', () => {
    expect(() => atlas.seasonOf('apple', 'XX')).toThrow(/Unknown region/);
  });
});

describe('inSeason', () => {
  it('lists peak before available, and leaves storage out by default', () => {
    const items = atlas.inSeason('US-CA', 9);
    expect(items.map((i) => [i.produce.id, i.level, i.region])).toEqual([
      ['apple', 'peak', 'US'],
      ['courgette', 'available', 'US-CA'],
    ]);
    expect(atlas.inSeason('US', 1)).toEqual([]);
  });

  it('includes storage when asked', () => {
    expect(atlas.inSeason('US', 1, { levels: ['storage'] }).map((i) => i.produce.id)).toEqual([
      'apple',
    ]);
  });

  it('filters by category', () => {
    expect(atlas.inSeason('US', 10, { category: 'vegetable' }).map((i) => i.produce.id)).toEqual([
      'kale',
    ]);
  });

  it('lets a region override its country: California courgettes start in April', () => {
    expect(atlas.inSeason('US-CA', 4).map((i) => i.produce.id)).toEqual(['courgette']);
    expect(atlas.inSeason('US-NY', 4)).toEqual([]);
  });
});

describe('names', () => {
  it('uses the locale’s name and falls back to British English', () => {
    expect(atlas.nameOf('courgette', 'en-US')).toBe('zucchini');
    expect(atlas.nameOf('courgette', 'en-AU')).toBe('courgettes');
    expect(atlas.nameOf('pea', 'fr-FR', 'one')).toBe('petit pois');
    expect(atlas.nameOf('nope')).toBeUndefined();
  });

  it('finds produce by any name, ignoring case and accents', () => {
    expect(atlas.findProduce('Zucchini').map((p) => p.id)).toEqual(['courgette']);
    expect(atlas.findProduce('PETITS POIS').map((p) => p.id)).toEqual(['pea']);
    expect(atlas.findProduce('app').map((p) => p.id)).toEqual(['apple']);
    expect(atlas.findProduce('  ')).toEqual([]);
  });
});

describe('producersIn', () => {
  it('includes a country’s subregions', () => {
    expect(atlas.producersIn('US').map((p) => p.id)).toEqual(['sunny-farm', 'union-square']);
  });

  it('filters by produce', () => {
    expect(atlas.producersIn('US', 'courgette').map((p) => [p.id, p.region])).toEqual([
      ['sunny-farm', 'US-CA'],
    ]);
  });
});

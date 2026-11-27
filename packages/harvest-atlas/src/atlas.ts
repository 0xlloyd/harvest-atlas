import type {
  Dataset,
  InSeasonItem,
  Level,
  Locale,
  Month,
  Produce,
  Producer,
  Region,
  Season,
  SeasonEntry,
  Source,
} from './types.js';

export const MONTHS: readonly Month[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const LEVELS: readonly Level[] = ['peak', 'available', 'storage'];

export function isMonth(value: unknown): value is Month {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12;
}

/** The level a season entry has in a month, or undefined when it is out of season. */
export function levelIn(entry: SeasonEntry, month: Month): Level | undefined {
  return LEVELS.find((level) => entry[level]?.includes(month));
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export type InSeasonOptions = {
  /** Levels to include. Defaults to peak and available (not storage). */
  levels?: readonly Level[];
  category?: Produce['category'];
};

export function createAtlas(data: Dataset) {
  const produceById = new Map(data.produce.map((p) => [p.id, p]));
  const regionByCode = new Map(data.regions.map((r) => [r.code, r]));
  const sourceById = new Map(data.sources.map((s) => [s.id, s]));

  /** The region and its parents, nearest first: US-CA, US. */
  function lineage(code: string): Region[] {
    const chain: Region[] = [];
    let region = regionByCode.get(code.toUpperCase());
    while (region && !chain.includes(region)) {
      chain.push(region);
      region = region.parent ? regionByCode.get(region.parent) : undefined;
    }
    return chain;
  }

  function requireRegion(code: string): Region {
    const region = regionByCode.get(code.toUpperCase());
    if (!region)
      throw new RangeError(`Unknown region "${code}". Use an ISO 3166 code such as GB or US-CA.`);
    return region;
  }

  /**
   * A produce's season in a region. A region without its own entry falls back to its
   * country's, and `region` on the result says whose data answered.
   */
  function seasonOf(produceId: string, regionCode: string): Season | undefined {
    requireRegion(regionCode);
    for (const region of lineage(regionCode)) {
      const entry = data.seasons[region.code]?.find((e) => e.produce === produceId);
      if (entry) return { ...entry, region: region.code };
    }
    return undefined;
  }

  /** Every produce in season in a region and month, peak first, then by name. */
  function inSeason(
    regionCode: string,
    month: Month,
    options: InSeasonOptions = {},
  ): InSeasonItem[] {
    const region = requireRegion(regionCode);
    const levels = options.levels ?? ['peak', 'available'];
    const items: InSeasonItem[] = [];
    for (const produce of data.produce) {
      if (options.category && produce.category !== options.category) continue;
      const season = seasonOf(produce.id, region.code);
      if (!season) continue;
      const level = levelIn(season, month);
      if (!level || !levels.includes(level)) continue;
      items.push({
        produce,
        level,
        confidence: season.confidence,
        region: season.region,
        sources: season.sources,
      });
    }
    const rank = (l: Level) => LEVELS.indexOf(l);
    return items.sort(
      (a, b) => rank(a.level) - rank(b.level) || a.produce.id.localeCompare(b.produce.id),
    );
  }

  /** The name to show for a produce, in a locale, singular or plural. */
  function nameOf(produceId: string, locale: Locale = 'en-GB', count: 'one' | 'other' = 'other') {
    const produce = produceById.get(produceId);
    if (!produce) return undefined;
    return (produce.names[locale] ?? produce.names['en-GB'])[count];
  }

  /** Find produce by any of its names in any locale ("zucchini", "courgettes", "aubergine"). */
  function findProduce(query: string): Produce[] {
    const q = normalise(query);
    if (!q) return [];
    const exact: Produce[] = [];
    const partial: Produce[] = [];
    for (const produce of data.produce) {
      const names = [
        produce.id.replace(/-/g, ' '),
        ...Object.values(produce.names).flatMap((n) => (n ? [n.one, n.other] : [])),
      ].map(normalise);
      if (names.includes(q)) exact.push(produce);
      else if (names.some((n) => n.includes(q))) partial.push(produce);
    }
    return [...exact, ...partial];
  }

  /** Producers and markets in a region and its subregions, optionally only those selling a produce. */
  function producersIn(
    regionCode: string,
    produceId?: string,
  ): Array<Producer & { region: string }> {
    const region = requireRegion(regionCode);
    return Object.entries(data.producers)
      .filter(([code]) => code === region.code || lineage(code).some((r) => r.code === region.code))
      .flatMap(([code, list]) => list.map((p) => ({ ...p, region: code })))
      .filter((p) => !produceId || p.produce?.includes(produceId));
  }

  return {
    data,
    produce: (): readonly Produce[] => data.produce,
    getProduce: (id: string) => produceById.get(id),
    regions: (): readonly Region[] => data.regions,
    getRegion: (code: string) => regionByCode.get(code.toUpperCase()),
    /** Regions that have their own season data. */
    regionsWithData: (): Region[] => data.regions.filter((r) => data.seasons[r.code]?.length),
    sources: (): readonly Source[] => data.sources,
    getSource: (id: string) => sourceById.get(id),
    lineage,
    seasonOf,
    inSeason,
    nameOf,
    findProduce,
    producersIn,
  };
}

export type Atlas = ReturnType<typeof createAtlas>;

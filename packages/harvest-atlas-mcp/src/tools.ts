import type { Atlas, Level, Locale, Month, Produce } from 'harvest-atlas';

export const ATTRIBUTION =
  'Data: Harvest Atlas (CC BY 4.0), https://github.com/0xlloyd/harvest-atlas. Each season lists its own sources.';

export class ToolError extends Error {}

function resolveProduce(atlas: Atlas, query: string): Produce {
  const byId = atlas.getProduce(query.trim().toLowerCase());
  if (byId) return byId;
  const [first] = atlas.findProduce(query);
  if (!first) throw new ToolError(`No produce matches "${query}". Try search_produce.`);
  return first;
}

function resolveRegion(atlas: Atlas, code: string) {
  const region = atlas.getRegion(code.trim());
  if (!region) {
    throw new ToolError(
      `Unknown region "${code}". Use an ISO 3166 code such as GB, FR, US-CA or AU-VIC; list_regions shows them all.`,
    );
  }
  return region;
}

const localeOf = (atlas: Atlas, regionCode: string, locale?: Locale): Locale =>
  locale ?? atlas.getRegion(regionCode)?.locale ?? 'en-GB';

export function searchProduce(atlas: Atlas, args: { query: string }) {
  return atlas
    .findProduce(args.query)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      category: p.category,
      names: p.names,
    }));
}

export function inSeason(
  atlas: Atlas,
  args: {
    region: string;
    month?: Month | undefined;
    include_storage?: boolean | undefined;
    category?: Produce['category'] | undefined;
    locale?: Locale | undefined;
  },
  now: Date = new Date(),
) {
  const region = resolveRegion(atlas, args.region);
  const month = args.month ?? ((now.getMonth() + 1) as Month);
  const levels: Level[] = args.include_storage
    ? ['peak', 'available', 'storage']
    : ['peak', 'available'];
  const locale = localeOf(atlas, region.code, args.locale);
  const items = atlas.inSeason(region.code, month, {
    levels,
    ...(args.category && { category: args.category }),
  });
  return {
    region: { code: region.code, name: region.name, hemisphere: region.hemisphere },
    month,
    month_was_given: args.month !== undefined,
    count: items.length,
    items: items.map((i) => ({
      id: i.produce.id,
      name: atlas.nameOf(i.produce.id, locale),
      category: i.produce.category,
      level: i.level,
      confidence: i.confidence,
      ...(i.region !== region.code && { data_from: i.region }),
    })),
    ...(items.length === 0 && {
      note:
        atlas.data.seasons[region.code] || region.parent
          ? 'Nothing in the dataset is in season here this month, or the region has little data yet.'
          : 'This region has no season data yet.',
    }),
    attribution: ATTRIBUTION,
  };
}

export function produceSeason(
  atlas: Atlas,
  args: { produce: string; region: string; locale?: Locale | undefined },
) {
  const region = resolveRegion(atlas, args.region);
  const produce = resolveProduce(atlas, args.produce);
  const season = atlas.seasonOf(produce.id, region.code);
  const locale = localeOf(atlas, region.code, args.locale);
  const base = {
    produce: { id: produce.id, name: atlas.nameOf(produce.id, locale) },
    region: { code: region.code, name: region.name, hemisphere: region.hemisphere },
  };
  if (!season) {
    return {
      ...base,
      found: false as const,
      note: 'No sourced season for this produce here yet. It may be imported, or the data is missing.',
      attribution: ATTRIBUTION,
    };
  }
  return {
    ...base,
    found: true as const,
    data_from: season.region,
    peak: season.peak ?? [],
    available: season.available ?? [],
    storage: season.storage ?? [],
    confidence: season.confidence,
    ...(season.note && { note: season.note }),
    sources: season.sources.flatMap((id) => {
      const s = atlas.getSource(id);
      return s ? [{ title: s.title, publisher: s.publisher, url: s.url, licence: s.licence }] : [];
    }),
    attribution: ATTRIBUTION,
  };
}

export function listRegions(atlas: Atlas, args: { country?: string | undefined }) {
  const country = args.country?.trim().toUpperCase();
  return atlas
    .regions()
    .filter((r) => !country || r.code === country || r.parent === country)
    .map((r) => ({
      code: r.code,
      name: r.name,
      ...(r.parent && { parent: r.parent }),
      has_own_data: Boolean(atlas.data.seasons[r.code]?.length),
    }));
}

export function findProducers(
  atlas: Atlas,
  args: { region: string; produce?: string | undefined },
) {
  const region = resolveRegion(atlas, args.region);
  const produce = args.produce ? resolveProduce(atlas, args.produce) : undefined;
  const producers = atlas.producersIn(region.code, produce?.id);
  return {
    region: { code: region.code, name: region.name },
    ...(produce && { produce: produce.id }),
    count: producers.length,
    producers: producers.map((p) => ({
      name: p.name,
      kind: p.kind,
      locality: p.locality,
      region: p.region,
      ...(p.website && { website: p.website }),
      ...(p.produce && { produce: p.produce }),
      ...(p.openMonths && { open_months: p.openMonths }),
    })),
    ...(producers.length === 0 && {
      note: 'No producers listed here yet. Farms and markets can add themselves: https://github.com/0xlloyd/harvest-atlas/blob/main/docs/producers.md',
    }),
    attribution: ATTRIBUTION,
  };
}

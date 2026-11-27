export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type Locale = 'en-GB' | 'en-US' | 'en-AU' | 'fr-FR';
export type Level = 'peak' | 'available' | 'storage';
export type Confidence = 'high' | 'medium' | 'low';
export type Category = 'vegetable' | 'fruit' | 'herb' | 'nut' | 'mushroom';

export type Name = { one: string; other: string };

export type Produce = {
  id: string;
  category: Category;
  names: Partial<Record<Locale, Name>> & { 'en-GB': Name };
};

export type Region = {
  /** ISO 3166-1 alpha-2 for a country, ISO 3166-2 for a subdivision. */
  code: string;
  name: string;
  parent?: string;
  hemisphere: 'north' | 'south';
  locale: Locale;
};

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  kind: 'government' | 'extension' | 'industry' | 'nonprofit' | 'media' | 'other';
  licence: string;
  accessed: string;
  note?: string;
};

export type SeasonEntry = {
  produce: string;
  peak?: Month[];
  available?: Month[];
  storage?: Month[];
  sources: string[];
  confidence: Confidence;
  note?: string;
};

export type Producer = {
  id: string;
  name: string;
  kind: 'farm' | 'market' | 'csa' | 'farm-shop' | 'cooperative' | 'pick-your-own';
  locality: string;
  website?: string;
  produce?: string[];
  openMonths?: Month[];
  location?: { lat: number; lon: number };
  basis:
    { type: 'self-submitted'; submitted: string } | { type: 'public-directory'; source: string };
  updated: string;
};

export type Dataset = {
  produce: Produce[];
  regions: Region[];
  sources: Source[];
  /** Entries by region code. */
  seasons: Record<string, SeasonEntry[]>;
  /** Producers by region code. */
  producers: Record<string, Producer[]>;
};

/** One produce's season where you asked, and which region's data answered. */
export type Season = SeasonEntry & {
  /** The region whose data this is: the one asked for, or the nearest parent with data. */
  region: string;
};

export type InSeasonItem = {
  produce: Produce;
  level: Level;
  confidence: Confidence;
  /** The region whose data this is. */
  region: string;
  sources: string[];
};

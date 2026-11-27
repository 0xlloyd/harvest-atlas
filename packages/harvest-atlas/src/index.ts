import { createAtlas } from './atlas.js';
import { DATA } from './generated/data.js';

export { createAtlas, isMonth, levelIn, LEVELS, MONTHS } from './atlas.js';
export type { Atlas, InSeasonOptions } from './atlas.js';
export type * from './types.js';

/** The atlas over the bundled dataset. */
export const atlas = createAtlas(DATA);

export const {
  produce,
  getProduce,
  regions,
  getRegion,
  regionsWithData,
  sources,
  getSource,
  seasonOf,
  inSeason,
  nameOf,
  findProduce,
  producersIn,
} = atlas;

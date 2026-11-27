import { describe, expect, it } from 'vitest';
import { atlas, MONTHS } from '../src/index.js';

describe('the bundled dataset', () => {
  it('has a name for every produce in every locale it lists', () => {
    for (const p of atlas.produce()) {
      for (const name of Object.values(p.names)) {
        expect(name?.one).toBeTruthy();
        expect(name?.other).toBeTruthy();
      }
    }
  });

  it('answers every region with data for every month without throwing', () => {
    for (const region of atlas.regionsWithData()) {
      for (const month of MONTHS)
        expect(Array.isArray(atlas.inSeason(region.code, month))).toBe(true);
    }
  });

  it('cites only sources it ships', () => {
    for (const region of atlas.regionsWithData()) {
      for (const entry of atlas.data.seasons[region.code] ?? []) {
        for (const id of entry.sources)
          expect(atlas.getSource(id), `${region.code} ${id}`).toBeDefined();
      }
    }
  });
});

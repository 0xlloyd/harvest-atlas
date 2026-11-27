// Bundles the repo's data/ folder into one JSON file the package ships and imports.
import { mkdirSync, readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const data = new URL('../../../data/', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .sort()
        .flatMap((f) => {
          const p = join(dir, f);
          return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [];
        })
    : [];

const seasons = {};
for (const p of walk(join(data, 'seasons'))) {
  const { region, entries } = read(p);
  seasons[region] = entries;
}
const producers = {};
for (const p of walk(join(data, 'producers'))) {
  const { region, producers: list } = read(p);
  producers[region] = list;
}
const sources = walk(join(data, 'sources')).flatMap(read);

const bundle = {
  produce: read(join(data, 'produce.json')),
  regions: read(join(data, 'regions.json')),
  sources,
  seasons,
  producers,
};
const out = new URL('../src/generated/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'data.json'), JSON.stringify(bundle));
writeFileSync(
  join(out, 'data.ts'),
  "import type { Dataset } from '../types.js';\nimport raw from './data.json' with { type: 'json' };\n\nexport const DATA = raw as Dataset;\n",
);

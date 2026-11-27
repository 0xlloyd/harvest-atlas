// Validates every data file against its schema, then checks what a schema cannot:
// ids resolve, a month sits in one level only, files are where their region says,
// entries are sorted, and every source is cited.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, multipleOfPrecision: 6 });
addFormats(ajv);
for (const f of readdirSync(join(root, 'schema'))) ajv.addSchema(read(`schema/${f}`));
const validator = (name) =>
  ajv.getSchema(
    `https://raw.githubusercontent.com/0xlloyd/harvest-atlas/main/schema/${name}.schema.json`,
  );

const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const check = (name, file, data) => {
  const v = validator(name);
  if (!v(data)) for (const e of v.errors) fail(file, `${e.instancePath || '/'} ${e.message}`);
};
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [];
      })
    : [];
const dupes = (ids) => ids.filter((id, i) => ids.indexOf(id) !== i);

const produce = read('data/produce.json');
check('produce', 'data/produce.json', produce);
const produceIds = new Set(produce.map((p) => p.id));
for (const d of dupes(produce.map((p) => p.id))) fail('data/produce.json', `duplicate id ${d}`);

const regions = read('data/regions.json');
check('regions', 'data/regions.json', regions);
const regionByCode = new Map(regions.map((r) => [r.code, r]));
for (const d of dupes(regions.map((r) => r.code))) fail('data/regions.json', `duplicate code ${d}`);
for (const r of regions) {
  if (r.parent && !regionByCode.has(r.parent))
    fail('data/regions.json', `${r.code}: unknown parent ${r.parent}`);
  if (r.parent && !r.code.startsWith(`${r.parent}-`))
    fail('data/regions.json', `${r.code}: code does not start with ${r.parent}-`);
}

const sources = new Map();
for (const path of walk(join(root, 'data/sources'))) {
  const file = relative(root, path);
  const list = JSON.parse(readFileSync(path, 'utf8'));
  check('sources', file, list);
  const cc = file.match(/([A-Z]{2})\.json$/)?.[1];
  for (const s of Array.isArray(list) ? list : []) {
    if (sources.has(s.id)) fail(file, `duplicate source id ${s.id}`);
    if (cc && !s.id.startsWith(`${cc.toLowerCase()}-`))
      fail(file, `${s.id} should start with ${cc.toLowerCase()}-`);
    sources.set(s.id, file);
  }
}

const cited = new Set();
const checkRegionFile = (file, data, kind) => {
  const expected = file.match(/([A-Z]{2}(-[A-Z0-9]{1,3})?)\.json$/)?.[1];
  if (data.region !== expected)
    fail(file, `region is ${data.region} but the file name says ${expected}`);
  const region = regionByCode.get(data.region);
  if (!region) return fail(file, `unknown region ${data.region}`);
  const folder = file.split('/').slice(-2, -1)[0];
  if (region.parent && folder !== region.parent)
    fail(file, `should be in data/${kind}/${region.parent}/`);
  if (!region.parent && folder !== kind) fail(file, `should be in data/${kind}/`);
};

for (const path of walk(join(root, 'data/seasons'))) {
  const file = relative(root, path);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  check('seasons', file, data);
  if (!data || !Array.isArray(data.entries)) continue;
  checkRegionFile(file, data, 'seasons');
  const ids = data.entries.map((e) => e.produce);
  for (const d of dupes(ids)) fail(file, `${d} appears twice`);
  const sorted = [...ids].sort();
  if (ids.join() !== sorted.join()) fail(file, 'entries are not sorted by produce id');
  for (const e of data.entries) {
    if (!produceIds.has(e.produce)) fail(file, `unknown produce ${e.produce}`);
    const months = [...(e.peak ?? []), ...(e.available ?? []), ...(e.storage ?? [])];
    for (const m of dupes(months)) fail(file, `${e.produce}: month ${m} is in more than one level`);
    for (const s of e.sources ?? []) {
      if (!sources.has(s)) fail(file, `${e.produce}: unknown source ${s}`);
      cited.add(s);
    }
  }
}

for (const path of walk(join(root, 'data/producers'))) {
  const file = relative(root, path);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  check('producers', file, data);
  if (!data || !Array.isArray(data.producers)) continue;
  checkRegionFile(file, data, 'producers');
  for (const d of dupes(data.producers.map((p) => p.id))) fail(file, `duplicate producer ${d}`);
  for (const p of data.producers) {
    for (const id of p.produce ?? [])
      if (!produceIds.has(id)) fail(file, `${p.id}: unknown produce ${id}`);
    if (p.basis?.type === 'public-directory') {
      if (!sources.has(p.basis.source)) fail(file, `${p.id}: unknown source ${p.basis.source}`);
      cited.add(p.basis.source);
    }
  }
}

for (const [id, file] of sources) if (!cited.has(id)) fail(file, `source ${id} is never cited`);

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s).`);
  process.exit(1);
}
console.log(
  `Valid: ${produceIds.size} produce, ${regions.length} regions, ${sources.size} sources.`,
);

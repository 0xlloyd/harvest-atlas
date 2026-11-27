# Contributing

The dataset is only as good as its sources. Corrections, new regions, new produce and new countries are all welcome.

## The rules

1. **Cite a source you have read.** Every entry names at least one source in `data/sources/<CC>.json`. No months from memory.
2. **Prefer open sources:** government agencies, extension services and growers' bodies first. A proprietary calendar can back up an open one but should not be copied wholesale.
3. **Local growing only.** Imports don't count. Greenhouse crops need a `note`.
4. **Levels:** `peak` (the source calls it the main or best season), `available` (in season, not peak), `storage` (local stored crop still sold). A month sits in one level only.
5. **Confidence:** `high` when two or more independent sources agree within a month, `medium` for one good source, `low` otherwise.
6. **A region file only when its sources differ** from the country's. Don't copy the country file into regions.
7. **Producers** are opt-in. See [docs/producers.md](docs/producers.md).

## Making a change

```sh
pnpm install
pnpm validate   # schemas plus cross-checks
pnpm check      # everything CI runs
```

`pnpm validate` explains anything wrong: an unknown produce or source, a month in two levels, unsorted entries, a file in the wrong folder, a source nobody cites.

- **Fix a season:** edit the entry, add or update the source, and say in the PR what changed and why.
- **New produce:** add it to `data/produce.json` with names in every locale you know, then add seasons.
- **New region or country:** add it to `data/regions.json` (ISO 3166 codes), its sources, and `data/seasons/<CC>.json` or `data/seasons/<CC>/<code>.json`. A new locale needs a schema change too, so open an issue first.

## Disagreements

Where sources disagree, take the range most of them support, and record the disagreement in `note`. If you know the land, say how you know in the PR.

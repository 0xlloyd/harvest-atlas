# Harvest Atlas

When fruit and vegetables are grown locally, by country and region, with a source for every season.

- **78 kinds of produce**, named in British, American and Australian English and in French.
- **Peak, available and storage months.** "Apples: peak September–October, from storage until March."
- **Regions, not just countries.** Florida isn't Maine. A region's own calendar overrides its country's; anything it doesn't cover falls back to the country.
- **Every entry is sourced**, with a confidence level: `high` when independent sources agree, `medium` for one good source, `low` otherwise.
- **Open:** data under CC BY 4.0, code under MIT.

Countries so far: United Kingdom, Ireland, France, United States, Australia. More countries are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Use the data

```sh
npm install harvest-atlas
```

```ts
import { inSeason, seasonOf, nameOf, findProduce } from 'harvest-atlas';

inSeason('GB', 6); // [{ produce: { id: 'asparagus', … }, level: 'peak', confidence: 'high', region: 'GB', … }, …]
seasonOf('courgette', 'US-CA'); // { peak: [...], available: [...], sources: [...], region: 'US-CA' }
nameOf('courgette', 'en-US'); // 'zucchini'
findProduce('capsicum'); // [{ id: 'pepper', … }]
```

The raw bundle is at `harvest-atlas/data.json`, and the source files are plain JSON in [`data/`](data), described by the JSON Schemas in [`schema/`](schema).

## Ask an agent

`harvest-atlas-mcp` is a [Model Context Protocol](https://modelcontextprotocol.io) server, so Claude, ChatGPT and other agents can answer "what's in season here?" from this data. It runs on your machine, stores nothing, and makes no network calls.

```json
{
  "mcpServers": {
    "harvest-atlas": { "command": "npx", "args": ["-y", "harvest-atlas-mcp"] }
  }
}
```

| Tool             | What it does                                                             |
| ---------------- | ------------------------------------------------------------------------ |
| `in_season`      | What's in season in a region this month (or any month), peak first       |
| `produce_season` | One fruit or vegetable's months in a region, with confidence and sources |
| `search_produce` | Find produce by any name: "eggplant", "aubergine", "fraises"             |
| `list_regions`   | Region codes, and which have their own data                              |
| `find_producers` | Farms, markets and farm shops in a region                                |

## The data

```
data/
  produce.json            ids, categories and names by locale
  regions.json            ISO 3166 countries and subdivisions
  sources/<CC>.json       every source we cite, with its licence
  seasons/<CC>.json       a country's calendar
  seasons/<CC>/<code>.json  a region's own calendar, where its sources differ
  producers/…             local producers and markets (opt-in, see docs/producers.md)
```

A season entry:

```json
{
  "produce": "apple",
  "peak": [9, 10],
  "available": [8, 11],
  "storage": [12, 1, 2, 3],
  "sources": ["ie-bordbia-best-in-season", "ie-epa-stopfoodwaste-calendar"],
  "confidence": "high"
}
```

Seasons describe local growing only. Imports don't count, and greenhouse crops are noted where a source says so. Seasons vary with the weather and the farm; treat months as a guide.

## Licence

Code: MIT. Data: CC BY 4.0, and producer listings ODbL. Details in [DATA-LICENSE.md](DATA-LICENSE.md).

Harvest Atlas started as the season data behind [Chocolate](https://chocol.app), a recipe app for couples.

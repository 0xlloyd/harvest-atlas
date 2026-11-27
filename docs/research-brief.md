# Research brief: season data for one country

You are filling Harvest Atlas, an open dataset of when fruit and vegetables are grown and harvested locally, for one country (and its regions where the sources differ). Accuracy and sourcing matter more than coverage: a missing entry is fine, an invented one is not.

## Rules

1. **Every value comes from a source you actually opened and read in this session.** Never fill months from memory or general knowledge. If you cannot find a source for an item, leave it out.
2. **Prefer open sources.** In order: government and public agencies (national or state agriculture departments, food agencies, open-data portals), university extension services and growers' bodies, then media and private sites. Record each source's licence honestly as far as you can tell. A month range is a fact, but do not copy one proprietary calendar wholesale: a proprietary source may only corroborate a value that an open or government source also gives, or support an entry you mark `"confidence": "low"`.
3. **Local production only.** Months when the produce is grown and harvested in that country or region, plus `storage` months when local stored crop is still sold (apples, potatoes, onions, squash). Imports do not count. Greenhouse/polytunnel crops count only if the source says so and you add a `note`.
4. **Levels.** Each month (1 = January) goes in at most one list:
   - `peak`: the source calls it peak, best or main season. If a source gives only one undifferentiated range, put it all in `available` and none in `peak`.
   - `available`: in season locally but not peak.
   - `storage`: local stored crop.
5. **Confidence** per entry: `high` when two or more independent sources agree (within a month), `medium` for one good open or government source, `low` otherwise. Where sources disagree, take the range most sources support and say so in `note`.
6. **IDs.** Use only the produce IDs in `data/produce.json` (read it first). If something important for this country is missing (for example feijoa in Australia, ramps in the US), list it in your final report with a suggested ID and its sourced months, but do not add it to the files.
7. **Regions** use ISO 3166-2 codes. Create a region file only when a source gives that region its own calendar that differs from the national one. Do not copy the national file into regions.
8. Do not edit any file other than the ones listed for your country below.

## Files you write

`data/sources/<CC>.json`, an array:

```json
[
  {
    "id": "gb-example-calendar",
    "title": "Seasonal fruit and vegetable calendar",
    "publisher": "Example Agency",
    "url": "https://…",
    "kind": "government",
    "licence": "OGL-3.0",
    "accessed": "2026-11-27"
  }
]
```

`kind` is one of `government`, `extension`, `industry`, `nonprofit`, `media`, `other`. `licence` is an SPDX-style id where one fits (`OGL-UK-3.0`, `CC-BY-4.0`, `etalab-2.0`, `public-domain-us-gov`, `CC-BY-NC-4.0`) or `unknown` or `all-rights-reserved`. Source ids start with the lowercase country code.

`data/seasons/<CC>.json` (national) and, only where justified, `data/seasons/<CC>/<ISO 3166-2 code>.json`:

```json
{
  "region": "GB",
  "entries": [
    {
      "produce": "asparagus",
      "peak": [5],
      "available": [4, 6],
      "sources": ["gb-example-calendar"],
      "confidence": "high"
    },
    {
      "produce": "apple",
      "peak": [9, 10],
      "available": [8, 11],
      "storage": [12, 1, 2, 3],
      "sources": ["gb-example-calendar", "gb-other"],
      "confidence": "high",
      "note": "Stored English apples are sold into spring."
    }
  ]
}
```

Omit empty lists. Sort entries by produce id. Every entry needs at least one source id that exists in your sources file.

## Your report

When done, reply with: files written, entries per file, the sources you used with their licences, items you could not source, suggested new produce IDs, and anything you were unsure of. Keep it under 300 words.

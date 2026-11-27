# Known gaps and judgement calls (v0.1)

What the first research pass was unsure of. Each item is a good first issue.

## Licences to confirm before wide reuse

Most sources state no licence (`unknown`). The data takes only month ranges (facts), cross-checked across sources, but these are worth confirming or replacing with openly licensed sources:

- **FR:** ADEME Impact CO2. The month data lives in the MIT-licensed `incubateur-ademe/impactco2` repo, but the impactco2.fr legal notice allows only non-commercial reuse with credit. Ask ADEME, or rely on the MIT repo.
- **GB:** New Covent Garden Market calendar (the main UK source).
- **IE:** Bord Bia and the EPA Stop Food Waste calendar.
- **US:** the state agriculture department charts. USDA SNAP-Ed is public domain.
- **AU:** every source except the Tasmanian calendar, which is all-rights-reserved and used only for low-confidence entries.

## Precision

- **AU national** comes from season-level guides (summer = Dec–Feb, and so on), so it is accurate only to the season even where marked `high`. AU-WA lists many vegetables as peak all year.
- **US national** is a broad average from USDA SNAP-Ed and is all `low`. Prefer the state files.
- **GB-SCT, AU-VIC and AU-TAS** rest on one proprietary or old source each, so they are all `low`.
- **Peak months** exist only where a source marks them: GB, IE (Bord Bia's "in season" read as peak), FR-974, US-CA, US-WA and AU-WA.

## Mapping decisions

- `cabbage` merges savoy, spring green and winter white. `potato` merges new and maincrop. `apple` merges all varieties.
- FR: ADEME's "Céleri" is mapped to celeriac and "Courge" to butternut squash.
- US: muscadine is filed under `grape`, with a note.
- Storage months were inferred from "available after harvest" for some US states (VA, CA and NC apples; MI potatoes and onions). Each has a note.
- Greenhouse and polytunnel crops (tomato, pepper, aubergine, cucumber, some strawberries) are noted where the source implies them.

## Produce to add next

Suggested by the sources, with months found: mushroom, purple-sprouting-broccoli, marrow, pak-choi, mangetout, spring-greens, samphire, damson, cobnut, horseradish, salsify, lambs-lettuce, persimmon, chestnut, walnut, hazelnut, mirabelle, lychee, pineapple, papaya, collard-greens, muscadine, pecan, cranberry, honeydew, peanut, nashi, custard-apple, tangelo, choko, feijoa.

## Regions with no calendar yet

US: 39 states. AU: NSW, QLD, SA, NT, ACT. FR: every mainland region (no regional calendars found). GB: England, Wales and Northern Ireland (the national file covers them).

# Local producers

Harvest Atlas can list farms, markets, farm shops, CSAs, cooperatives and pick-your-own farms, so "what's in season" can lead to "where to buy it nearby".

## Who gets listed

- **Businesses that add themselves.** A farm or market opens a [producer listing issue](../../issues/new?template=producer.yml) or a pull request. `basis` is `self-submitted`, with the date.
- **Public directories with an open licence.** Bulk imports come from directories whose licence allows reuse, recorded as a source. `basis` is `public-directory`, with the source id.

We never scrape listings from sites that don't allow it, and never list a business that asks to be removed.

## What a listing holds

Business details only, and the schema rejects anything else:

- name, kind, town or village (never a street address)
- website (https)
- produce grown or sold, and the months it is open
- location rounded to about 1 km, if the business wants to appear on maps

No person's name, email, phone number or home address. Many farms are sole traders, so a farm's details can identify its owner; that is why listings are opt-in and stay minimal.

## Removal

Any business can be removed on request: open an issue or email the maintainers. Removals are made within 7 days, and we don't ask for a reason.

## Files and licence

`data/producers/<CC>/<region code>.json`, validated by `schema/producers.schema.json`. Producer data is licensed under ODbL 1.0 (see `DATA-LICENSE.md`).

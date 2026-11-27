// One-off: writes data/regions.json (ISO 3166-1 countries and their ISO 3166-2 subdivisions).
import { writeFileSync } from 'node:fs';
const countries = [
  [
    'GB',
    'United Kingdom',
    'north',
    'en-GB',
    { 'GB-ENG': 'England', 'GB-SCT': 'Scotland', 'GB-WLS': 'Wales', 'GB-NIR': 'Northern Ireland' },
  ],
  ['IE', 'Ireland', 'north', 'en-GB', {}],
  [
    'FR',
    'France',
    'north',
    'fr-FR',
    {
      'FR-ARA': 'Auvergne-Rhône-Alpes',
      'FR-BFC': 'Bourgogne-Franche-Comté',
      'FR-BRE': 'Bretagne',
      'FR-CVL': 'Centre-Val de Loire',
      'FR-20R': 'Corse',
      'FR-GES': 'Grand Est',
      'FR-HDF': 'Hauts-de-France',
      'FR-IDF': 'Île-de-France',
      'FR-NOR': 'Normandie',
      'FR-NAQ': 'Nouvelle-Aquitaine',
      'FR-OCC': 'Occitanie',
      'FR-PDL': 'Pays de la Loire',
      'FR-PAC': "Provence-Alpes-Côte d'Azur",
    },
  ],
  [
    'US',
    'United States',
    'north',
    'en-US',
    Object.fromEntries(
      `AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|DE Delaware|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|IN Indiana|IA Iowa|KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|MA Massachusetts|MI Michigan|MN Minnesota|MS Mississippi|MO Missouri|MT Montana|NE Nebraska|NV Nevada|NH New Hampshire|NJ New Jersey|NM New Mexico|NY New York|NC North Carolina|ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|PA Pennsylvania|RI Rhode Island|SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|VT Vermont|VA Virginia|WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming|DC District of Columbia`
        .split('|')
        .map((s) => [`US-${s.slice(0, 2)}`, s.slice(3)]),
    ),
  ],
  [
    'AU',
    'Australia',
    'south',
    'en-AU',
    {
      'AU-ACT': 'Australian Capital Territory',
      'AU-NSW': 'New South Wales',
      'AU-NT': 'Northern Territory',
      'AU-QLD': 'Queensland',
      'AU-SA': 'South Australia',
      'AU-TAS': 'Tasmania',
      'AU-VIC': 'Victoria',
      'AU-WA': 'Western Australia',
    },
  ],
];
const out = [];
for (const [code, name, hemisphere, locale, subs] of countries) {
  out.push({ code, name, hemisphere, locale });
  for (const [sub, subName] of Object.entries(subs))
    out.push({ code: sub, name: subName, parent: code, hemisphere, locale });
}
writeFileSync(
  new URL('../data/regions.json', import.meta.url),
  JSON.stringify(out, null, 2) + '\n',
);
console.log(out.length, 'regions');

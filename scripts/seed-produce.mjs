// One-off: writes data/produce.json from a compact table. Kept for reference.
// Columns: id | category | en-GB one/other | en-US (blank = en-GB) | en-AU (blank = en-GB) | fr-FR
import { writeFileSync } from 'node:fs';
const rows = `
artichoke|vegetable|globe artichoke/globe artichokes|artichoke/artichokes|globe artichoke/globe artichokes|artichaut/artichauts
asparagus|vegetable|asparagus/asparagus|||asperge/asperges
aubergine|vegetable|aubergine/aubergines|eggplant/eggplants|eggplant/eggplants|aubergine/aubergines
beetroot|vegetable|beetroot/beetroot|beet/beets||betterave/betteraves
broad-bean|vegetable|broad bean/broad beans|fava bean/fava beans||fève/fèves
broccoli|vegetable|broccoli/broccoli|||brocoli/brocolis
brussels-sprout|vegetable|Brussels sprout/Brussels sprouts|||chou de Bruxelles/choux de Bruxelles
butternut-squash|vegetable|butternut squash/butternut squash||butternut pumpkin/butternut pumpkins|courge butternut/courges butternut
cabbage|vegetable|cabbage/cabbages|||chou/choux
red-cabbage|vegetable|red cabbage/red cabbages|||chou rouge/choux rouges
carrot|vegetable|carrot/carrots|||carotte/carottes
cauliflower|vegetable|cauliflower/cauliflowers|||chou-fleur/choux-fleurs
celeriac|vegetable|celeriac/celeriac|celery root/celery root||céleri-rave/céleris-raves
celery|vegetable|celery/celery|||céleri branche/céleris branches
chard|vegetable|chard/chard|Swiss chard/Swiss chard|silverbeet/silverbeet|blette/blettes
chicory|vegetable|chicory/chicory|Belgian endive/Belgian endives|witlof/witlof|endive/endives
chilli|vegetable|chilli/chillies|chile pepper/chile peppers|chilli/chillies|piment/piments
courgette|vegetable|courgette/courgettes|zucchini/zucchini|zucchini/zucchini|courgette/courgettes
cucumber|vegetable|cucumber/cucumbers|||concombre/concombres
fennel|vegetable|fennel/fennel|||fenouil/fenouils
garlic|vegetable|garlic/garlic|||ail/ail
green-bean|vegetable|green bean/green beans|||haricot vert/haricots verts
jerusalem-artichoke|vegetable|Jerusalem artichoke/Jerusalem artichokes|sunchoke/sunchokes||topinambour/topinambours
kale|vegetable|kale/kale|||chou kale/choux kale
kohlrabi|vegetable|kohlrabi/kohlrabi|||chou-rave/choux-raves
leek|vegetable|leek/leeks|||poireau/poireaux
lettuce|vegetable|lettuce/lettuces|||laitue/laitues
okra|vegetable|okra/okra|||gombo/gombos
onion|vegetable|onion/onions|||oignon/oignons
parsnip|vegetable|parsnip/parsnips|||panais/panais
pea|vegetable|pea/peas|||petit pois/petits pois
pepper|vegetable|pepper/peppers|bell pepper/bell peppers|capsicum/capsicums|poivron/poivrons
potato|vegetable|potato/potatoes|||pomme de terre/pommes de terre
pumpkin|vegetable|pumpkin/pumpkins|||potiron/potirons
radish|vegetable|radish/radishes|||radis/radis
rocket|vegetable|rocket/rocket|arugula/arugula||roquette/roquette
runner-bean|vegetable|runner bean/runner beans|||haricot d'Espagne/haricots d'Espagne
shallot|vegetable|shallot/shallots||eschalot/eschalots|échalote/échalotes
spinach|vegetable|spinach/spinach|||épinard/épinards
spring-onion|vegetable|spring onion/spring onions|scallion/scallions||oignon nouveau/oignons nouveaux
swede|vegetable|swede/swedes|rutabaga/rutabagas||rutabaga/rutabagas
sweet-potato|vegetable|sweet potato/sweet potatoes|||patate douce/patates douces
sweetcorn|vegetable|sweetcorn/sweetcorn|corn/corn|sweet corn/sweet corn|maïs doux/maïs doux
tomato|vegetable|tomato/tomatoes|||tomate/tomates
turnip|vegetable|turnip/turnips|||navet/navets
watercress|vegetable|watercress/watercress|||cresson/cresson
wild-garlic|vegetable|wild garlic/wild garlic|||ail des ours/ail des ours
apple|fruit|apple/apples|||pomme/pommes
apricot|fruit|apricot/apricots|||abricot/abricots
avocado|fruit|avocado/avocados|||avocat/avocats
blackberry|fruit|blackberry/blackberries|||mûre/mûres
blackcurrant|fruit|blackcurrant/blackcurrants|||cassis/cassis
blueberry|fruit|blueberry/blueberries|||myrtille/myrtilles
cherry|fruit|cherry/cherries|||cerise/cerises
clementine|fruit|clementine/clementines|||clémentine/clémentines
fig|fruit|fig/figs|||figue/figues
gooseberry|fruit|gooseberry/gooseberries|||groseille à maquereau/groseilles à maquereau
grape|fruit|grape/grapes|||raisin/raisins
grapefruit|fruit|grapefruit/grapefruit|||pamplemousse/pamplemousses
kiwi|fruit|kiwi/kiwis|kiwifruit/kiwifruit|kiwifruit/kiwifruit|kiwi/kiwis
lemon|fruit|lemon/lemons|||citron/citrons
lime|fruit|lime/limes|||citron vert/citrons verts
mandarin|fruit|mandarin/mandarins|||mandarine/mandarines
mango|fruit|mango/mangoes|||mangue/mangues
melon|fruit|melon/melons|cantaloupe/cantaloupes|rockmelon/rockmelons|melon/melons
nectarine|fruit|nectarine/nectarines|||nectarine/nectarines
orange|fruit|orange/oranges|||orange/oranges
passionfruit|fruit|passion fruit/passion fruit|passion fruit/passion fruit|passionfruit/passionfruit|fruit de la passion/fruits de la passion
peach|fruit|peach/peaches|||pêche/pêches
pear|fruit|pear/pears|||poire/poires
plum|fruit|plum/plums|||prune/prunes
pomegranate|fruit|pomegranate/pomegranates|||grenade/grenades
quince|fruit|quince/quinces|||coing/coings
raspberry|fruit|raspberry/raspberries|||framboise/framboises
redcurrant|fruit|redcurrant/redcurrants|red currant/red currants||groseille/groseilles
rhubarb|fruit|rhubarb/rhubarb|||rhubarbe/rhubarbe
strawberry|fruit|strawberry/strawberries|||fraise/fraises
watermelon|fruit|watermelon/watermelons|||pastèque/pastèques
`
  .trim()
  .split('\n');
const name = (s) => {
  const [one, other] = s.split('/');
  return { one, other };
};
const out = rows.map((r) => {
  const [id, category, gb, us, au, fr] = r.split('|');
  return {
    id,
    category,
    names: {
      'en-GB': name(gb),
      'en-US': name(us || gb),
      'en-AU': name(au || gb),
      'fr-FR': name(fr),
    },
  };
});
writeFileSync(
  new URL('../data/produce.json', import.meta.url),
  JSON.stringify(out, null, 2) + '\n',
);
console.log(out.length, 'produce');

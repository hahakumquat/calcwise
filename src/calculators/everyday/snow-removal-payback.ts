import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'snow-removal-payback',
  title: 'Snow Blower vs Plow Service Payback',
  category: 'everyday',
  description: 'Compare buying a snow blower with paying a plow service. See the yearly saving, how many winters until the blower pays for itself, and the net over its life.',
  keywords: ['snow blower vs plow service', 'is a snow blower worth it', 'snow blower payback', 'plow service cost per winter', 'snow removal cost comparison', 'buy snow blower or hire'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'price', label: 'Snow blower price', type: 'number', prefix: '$', default: 900, min: 0, step: 50, info: 'The one-time purchase price, after tax and any discount.' },
    { id: 'upkeep', label: 'Fuel and upkeep per winter', type: 'number', prefix: '$', default: 40, min: 0, step: 5, info: 'Gas or electricity, oil, shear pins and servicing for one winter.' },
    { id: 'visit', label: 'Plow service price per visit', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'What the service charges each time it clears your driveway.' },
    { id: 'visits', label: 'Plow visits per winter', type: 'number', default: 14, min: 0, step: 1, info: 'How many times you would pay for a visit in a typical winter.' },
    { id: 'years', label: 'Years the blower lasts', type: 'number', default: 10, min: 1, max: 30, step: 1, suffix: 'years', info: 'Your own estimate of its working life.' },
  ],
  outputs: [
    { id: 'payback', label: 'Payback time', format: 'number', precision: 2, suffix: 'winters', primary: true, info: 'Blower price ÷ yearly saving. Blank when the service is cheaper.' },
    { id: 'saving', label: 'Saved per winter', format: 'currency', precision: 2, info: 'Plow service cost per winter minus fuel and upkeep. Negative means the service is cheaper.' },
    { id: 'service', label: 'Plow service per winter', format: 'currency', precision: 2, info: 'Price per visit × visits per winter.' },
    { id: 'net', label: 'Net over the blower\'s life', format: 'currency', precision: 2, info: 'Yearly saving × years − blower price. Negative means the service costs less overall.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const upkeep = num(v.upkeep);
    const visit = num(v.visit);
    const visits = num(v.visits);
    const years = num(v.years);
    if (price === null || upkeep === null || visit === null || visits === null || years === null) return { payback: null };
    if (price < 0 || upkeep < 0 || visit < 0 || visits < 0 || years < 1) return { payback: null };
    const n = Math.round(years);
    const service = visit * visits;
    const saving = service - upkeep;
    const net = saving * n - price;
    const xs = Array.from({ length: n + 1 }, (_, i) => i);
    const chart = {
      type: 'line' as const,
      title: 'Total spent so far',
      x: xs,
      xLabel: 'Winters',
      yFormat: { format: 'currency' as const },
      series: [
        { name: 'Snow blower', values: xs.map((y) => price + upkeep * y) },
        { name: 'Plow service', values: xs.map((y) => service * y) },
      ],
    };
    const steps = [
      `Service per winter = ${money(visit)} × ${fmt(visits, 0)} = ${money(service)}`,
      `Saving = ${money(service)} − ${money(upkeep)} = ${money(saving)} per winter`,
    ];
    if (saving <= 0) {
      return {
        payback: null,
        saving,
        service,
        net,
        tone: 'bad',
        badge: 'Service is cheaper, no payback',
        note: `The service costs ${money(service)} a winter against ${money(upkeep)} to run a blower, so buying one never pays back. Over ${n} years the blower would cost ${money(-net)} more than the service. Your own time and storage are not counted.`,
        chart,
        steps,
      };
    }
    const payback = price / saving;
    steps.push(`Payback = ${money(price)} ÷ ${money(saving)} = ${fmt(payback)} winters`, `Net over ${n} years = ${money(saving)} × ${n} − ${money(price)} = ${money(net)}`);
    const pays = payback <= n;
    return {
      payback,
      saving,
      service,
      net,
      tone: pays ? 'good' : 'warn',
      badge: pays ? `Pays back in ${fmt(payback)} winters` : `Takes ${fmt(payback)} winters, longer than its life`,
      note: pays
        ? `A ${money(price)} blower saves ${money(saving)} a winter against the service and pays for itself in ${fmt(payback)} winters. Over ${n} years you come out ${money(net)} ahead. Your own time and storage are not counted.`
        : `A ${money(price)} blower saves ${money(saving)} a winter, but that takes ${fmt(payback)} winters, longer than the ${n} years you expect it to last. Over ${n} years you end up ${money(-net)} behind. Your own time and storage are not counted.`,
      chart,
      steps,
    };
  },
  content: {
    formula: [
      'Service per winter = price per visit × visits per winter',
      'Saving per winter = service per winter − fuel and upkeep',
      'Payback winters = blower price ÷ saving per winter',
      'Net over its life = saving per winter × years − blower price',
    ],
    body: [
      'A snow blower costs money up front and a little every winter. A plow service costs nothing up front but charges for each visit. This calculator sets the two side by side and shows when buying starts to win, if it does.',
      'Example: a $900 blower with $40 of fuel and upkeep a winter, against a service at $60 a visit for 14 visits. The service costs 60 × 14 = $840 a winter, so the blower saves 840 − 40 = $800. It pays back in 900 ÷ 800 = 1.13 winters (1.125 exactly). Over 10 years the net is 800 × 10 − 900 = $7,100.',
      'If the service costs no more than your fuel and upkeep, the blower never pays back and the calculator says so. Only money is counted. Your own time, effort and storage space are excluded, as are repairs beyond the yearly upkeep figure, resale value and changes in service prices. Visits per winter is your own guess, and it is the number that moves the result most. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I know if a snow blower is worth it?', a: 'Compare what a plow service would cost each winter with the blower\'s yearly fuel and upkeep. If the service costs more, the difference pays back the purchase price. With the example numbers, $800 saved a winter repays a $900 blower in 1.125 winters.' },
      { q: 'How is payback calculated?', a: 'Payback winters = blower price ÷ (price per visit × visits − fuel and upkeep). For $900, $60 a visit, 14 visits and $40 upkeep, that is 900 ÷ 800 = 1.125 winters.' },
      { q: 'What if the plow service is cheaper?', a: 'If the service costs per winter are equal to or lower than your fuel and upkeep, there is no saving, so there is no payback. The calculator shows that the service is cheaper and the net over the blower\'s life as a loss.' },
      { q: 'What is the net over the blower\'s life?', a: 'Yearly saving × years of life − blower price. In the example, 800 × 10 − 900 = $7,100 ahead after 10 years.' },
      { q: 'Does this count my time?', a: 'No. Your own time, effort and storage space are excluded, and so are resale value and repairs beyond the yearly upkeep you enter.' },
    ],
    sources: [],
  },
  related: ['ice-melt-coverage', 'energy-upgrade-payback', 'heating-cost', 'gas-cost'],
  examples: [
    // service 60*14 = 840; saving 840-40 = 800; payback 900/800 = 1.125; net 800*10-900 = 7100
    { values: { price: 900, upkeep: 40, visit: 60, visits: 14, years: 10 }, expect: { service: 840, saving: 800, payback: 1.125, net: 7100 } },
    // service 30*10 = 300; saving 300-500 = -200 (service cheaper, no payback); net -200*10-900 = -2900
    { values: { price: 900, upkeep: 500, visit: 30, visits: 10, years: 10 }, expect: { service: 300, saving: -200, net: -2900 } },
  ],
});

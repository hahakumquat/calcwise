import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const money4 = (n: number) => '$' + fmt(n, 4);

export default defineCalculator({
  slug: '3d-print-cost',
  title: '3D Print Cost Calculator',
  category: 'everyday',
  description: 'Work out what a 3D print really costs: filament by weight, printer electricity, extra costs and a failure rate, to get the cost per good part.',
  keywords: ['3d print cost calculator', 'how much does it cost to 3d print', 'filament cost per gram', '3d printing electricity cost', 'cost per print'],
  updated: '2026-11-26',
  inputs: [
    { id: 'price', label: 'Filament price per kg', type: 'number', prefix: '$', default: 20, min: 0, step: 0.5, info: 'What one 1 kg spool costs you.' },
    { id: 'grams', label: 'Part weight', type: 'number', suffix: 'g', default: 50, min: 0, step: 1, info: 'Filament used including supports, from your slicer.' },
    { id: 'watts', label: 'Printer power draw', type: 'number', suffix: 'W', default: 150, min: 0, step: 10, info: 'Average watts while printing. A plug-in power meter gives the best number; 150 W is only a rough guess.' },
    { id: 'hours', label: 'Print time', type: 'number', suffix: 'h', default: 4, min: 0, step: 0.25, info: 'Hours for one print, from your slicer.' },
    { id: 'rate', label: 'Electricity price', type: 'number', prefix: '$', suffix: '/kWh', default: 0.16, min: 0, step: 0.01, info: 'Your rate per kilowatt-hour, shown on your power bill.' },
    { id: 'fail', label: 'Failure rate', type: 'number', suffix: '%', default: 10, min: 0, max: 99, step: 1, info: 'Share of prints that fail and get thrown away. 10% is an estimate; use your own history.' },
    { id: 'extra', label: 'Other costs per part', type: 'number', prefix: '$', default: 0, min: 0, step: 0.25, info: 'Optional: hardware, glue, nozzle wear, packaging.' },
  ],
  outputs: [
    { id: 'perPart', label: 'Cost per good part', format: 'currency', primary: true, info: 'Cost of one attempt ÷ (1 − failure rate).' },
    { id: 'filament', label: 'Filament per print', format: 'currency', info: 'Part weight in g ÷ 1000 × price per kg.' },
    { id: 'power', label: 'Electricity per print', format: 'currency', info: 'Watts × hours ÷ 1000 × price per kWh.' },
    { id: 'kwh', label: 'Energy per print', format: 'number', precision: 3, suffix: 'kWh', info: 'Watts × hours ÷ 1000.' },
    { id: 'subtotal', label: 'Cost of one attempt', format: 'currency', info: 'Filament + electricity + other costs.' },
  ],
  compute: (v) => {
    const price = num(v.price), grams = num(v.grams), watts = num(v.watts), hours = num(v.hours), rate = num(v.rate), fail = num(v.fail), extra = num(v.extra);
    if ([price, grams, watts, hours, rate, fail, extra].some((x) => x === null)) return { perPart: null };
    const [p, g, w, h, r, f, e] = [price, grams, watts, hours, rate, fail, extra] as number[];
    if (p < 0 || g < 0 || w < 0 || h < 0 || r < 0 || e < 0 || f < 0 || f >= 100) return { perPart: null };
    const filament = (g / 1000) * p;
    const kwh = (w * h) / 1000;
    const power = kwh * r;
    const subtotal = filament + power + e;
    const perPart = subtotal / (1 - f / 100);
    const wasted = perPart - subtotal;
    const slices = [
      { label: 'Filament', value: filament },
      { label: 'Electricity', value: power },
      { label: 'Other costs', value: e },
      { label: 'Failed prints', value: wasted },
    ].filter((s) => s.value > 0);
    return {
      perPart,
      filament,
      power,
      kwh,
      subtotal,
      tone: 'ok',
      badge: 'Estimate',
      note: `One attempt costs ${money(subtotal)}. With ${fmt(f, 1)}% of prints failing, each good part costs ${money(perPart)}, including ${money(wasted)} to cover failures. The failure rate and power draw are estimates, so use your own numbers where you can.`,
      chart: slices.length
        ? {
            type: 'donut' as const,
            title: 'Where the cost per good part goes',
            slices,
            format: { format: 'currency', precision: 2 },
            centerLabel: 'per good part',
            centerValue: money(perPart),
          }
        : undefined,
      steps: [
        `Filament: ${fmt(g)} g ÷ 1000 × ${money(p)} = ${money4(filament)}`,
        `Energy: ${fmt(w, 0)} W × ${fmt(h)} h ÷ 1000 = ${fmt(kwh, 3)} kWh`,
        `Electricity: ${fmt(kwh, 3)} kWh × ${money(r)} = ${money4(power)}`,
        `One attempt: ${money4(filament)} + ${money4(power)} + ${money(e)} = ${money4(subtotal)}`,
        `Per good part: ${money4(subtotal)} ÷ (1 − ${fmt(f, 1)}%) = ${money4(perPart)}`,
      ],
    };
  },
  content: {
    formula: [
      'Filament cost = part weight (g) ÷ 1000 × price per kg',
      'Electricity cost = watts × hours ÷ 1000 × price per kWh',
      'Cost of one attempt = filament + electricity + other costs',
      'Cost per good part = cost of one attempt ÷ (1 − failure rate)',
    ],
    body: [
      'Most people price a 3D print by filament alone, but power and failed prints add up. Enter your spool price, the part weight and print time from your slicer, your printer power draw and electricity rate, and a failure rate to get the cost of each part that actually comes out right.',
      'The failure rate is spread across every good part. If 1 in 10 prints fails, you pay for 10 attempts to get 9 parts, so the cost is divided by 0.9. The failure rate cannot reach 100%, because then no part would ever succeed.',
      'This does not include the printer purchase, maintenance, your time or a profit margin if you sell prints. Printer wattage varies a lot with the heated bed and enclosure, so a plug-in power meter gives a better figure than a guess. Everything runs in your browser and nothing is stored. To check what a device costs to run, see the electricity cost calculator.',
    ],
    faq: [
      { q: 'How much does it cost to 3D print a 50 g part?', a: 'With the defaults of $20 per kg filament, a 150 W printer running 4 hours at $0.16 per kWh, the filament is $1.00 and the electricity is $0.096. One attempt costs $1.096.' },
      { q: 'What does the failure rate do to the cost?', a: 'It raises the cost of each good part. At the default 10% failure rate, $1.096 divided by 0.9 is about $1.22 per good part, so failures add roughly 12 cents.' },
      { q: 'How much electricity does a print use?', a: 'Watts times hours divided by 1000. The default 150 W for 4 hours is 0.6 kWh, which is $0.096 at $0.16 per kWh. Your printer may draw more or less, so measure it if you can.' },
      { q: 'What failure rate should I use?', a: 'Use your own record of failed or scrapped prints. The default of 10% is only an estimate. A well tuned printer may fail far less, and tricky materials may fail more.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'standby-power-cost'],
  examples: [
    // filament = 50/1000*20 = 1.00; kwh = 150*4/1000 = 0.6; power = 0.6*0.16 = 0.096; subtotal = 1.096; /0.9 = 1.217777...
    { values: { price: 20, grams: 50, watts: 150, hours: 4, rate: 0.16, fail: 10, extra: 0 }, expect: { filament: 1, kwh: 0.6, power: 0.096, subtotal: 1.096, perPart: 1.096 / 0.9 }, tolerance: 1e-9 },
    // filament = 200/1000*25 = 5.00; kwh = 200*10/1000 = 2; power = 2*0.20 = 0.40; subtotal = 5 + 0.4 + 0.5 = 5.9; /0.8 = 7.375
    { values: { price: 25, grams: 200, watts: 200, hours: 10, rate: 0.2, fail: 20, extra: 0.5 }, expect: { filament: 5, kwh: 2, power: 0.4, subtotal: 5.9, perPart: 7.375 }, tolerance: 1e-9 },
    // no failures: 0 filament weight, only power 0.096 -> perPart = 0.096
    { values: { price: 20, grams: 0, watts: 150, hours: 4, rate: 0.16, fail: 0, extra: 0 }, expect: { subtotal: 0.096, perPart: 0.096 }, tolerance: 1e-9 },
  ],
});

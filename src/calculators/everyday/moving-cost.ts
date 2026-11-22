import { defineCalculator, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const LINES: { id: string; label: string }[] = [
  { id: 'movers', label: 'Movers or helpers' },
  { id: 'truck', label: 'Truck rental' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'boxes', label: 'Boxes and supplies' },
  { id: 'cleaning', label: 'Cleaning or deposit loss' },
  { id: 'utilities', label: 'Utility setup and transfer fees' },
];

export default defineCalculator({
  slug: 'moving-cost',
  title: 'Moving Cost Calculator',
  category: 'everyday',
  description: 'Add up what a move really costs: movers, truck, fuel, boxes, cleaning, fees and the rent you pay for two homes at once, shown as months of rent.',
  keywords: ['moving cost calculator', 'how much does moving cost', 'moving budget calculator', 'cost of moving house', 'overlap rent calculator', 'moving expenses estimate'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'movers', label: 'Movers or helpers', type: 'number', prefix: '$', default: 480, min: 0, step: 10, info: 'What you expect to pay movers, or to thank friends who help (pizza counts). Use a quote if you have one.' },
    { id: 'truck', label: 'Truck rental', type: 'number', prefix: '$', default: 120, min: 0, step: 10, info: 'Rental price of a truck or van, including any mileage or insurance fees. Leave 0 if you are not renting one.' },
    { id: 'fuel', label: 'Fuel', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'Fuel for the truck and your own vehicles on moving day.' },
    { id: 'boxes', label: 'Boxes and supplies', type: 'number', prefix: '$', default: 75, min: 0, step: 5, info: 'Boxes, tape, padding and anything else you buy to pack.' },
    { id: 'cleaning', label: 'Cleaning or deposit loss', type: 'number', prefix: '$', default: 150, min: 0, step: 10, info: 'Cleaning the old place, or the part of the deposit you expect not to get back.' },
    { id: 'utilities', label: 'Utility setup and transfer fees', type: 'number', prefix: '$', default: 0, min: 0, step: 5, info: 'Connection or transfer fees for internet, power, gas and similar. Leave 0 if none.' },
    { id: 'days', label: 'Overlap days (both homes)', type: 'number', suffix: 'days', default: 10, min: 0, step: 1, info: 'Days you pay for the old and new home at the same time.' },
    { id: 'rent', label: 'Monthly rent during overlap', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'Monthly rent (or housing cost) of the home you are paying for twice. Overlap cost = days × rent ÷ 30.' },
  ],
  outputs: [
    { id: 'total', label: 'Total moving cost', format: 'currency', precision: 0, primary: true, info: 'All the cost lines you entered, plus the overlap rent.' },
    { id: 'overlap', label: 'Overlap rent cost', format: 'currency', precision: 0, info: 'Overlap days × monthly rent ÷ 30.' },
    { id: 'months', label: 'Total as months of rent', format: 'number', precision: 2, suffix: 'months', info: 'Total moving cost divided by monthly rent. Blank if rent is 0.' },
    { id: 'largest', label: 'Largest line item', format: 'text', info: 'The single cost line with the highest amount. If two tie, the first in the list is shown.' },
  ],
  compute: (v) => {
    const vals = LINES.map((l) => num(v[l.id]));
    const days = num(v.days);
    const rent = num(v.rent);
    if (vals.some((x) => x === null) || days === null || rent === null) return { total: null };
    const base = vals as number[];
    if (base.some((x) => x < 0) || days < 0 || rent < 0) return { total: null };

    const overlap = (days * rent) / 30;
    const lines = [...LINES.map((l, i) => ({ label: l.label, value: base[i] })), { label: 'Overlap rent', value: overlap }];
    const total = lines.reduce((s, l) => s + l.value, 0);
    const months = rent > 0 ? total / rent : null;
    let top = lines[0];
    for (const l of lines) if (l.value > top.value) top = l;
    const largest = total > 0 ? top.label : 'None';

    const result: ComputeResult = {
      total,
      overlap,
      months,
      largest,
      tone: 'ok',
      badge: months === null ? `${money(total)} total` : `${months.toFixed(2)} months of rent`,
      steps: [
        ...lines.filter((l) => l.label !== 'Overlap rent').map((l) => `${l.label}: ${money(l.value)}`),
        `Overlap rent: ${days} days × ${money(rent)} ÷ 30 = ${money(overlap)}`,
        `Total: ${money(total)}`,
        months === null ? 'Months of rent is blank because monthly rent is 0.' : `Months of rent: ${money(total)} ÷ ${money(rent)} = ${months.toFixed(2)}`,
      ],
      note: total > 0
        ? `Your largest line is ${largest.toLowerCase()} at ${money(top.value)}. These are estimates you entered, so swap in real quotes as you get them.`
        : 'Enter your expected costs to see the total.',
    };
    const slices = lines.filter((l) => l.value > 0).map((l) => ({ label: l.label, value: l.value }));
    if (slices.length > 0) {
      result.chart = {
        type: 'donut',
        title: 'Share of each cost line',
        slices,
        format: { format: 'currency' },
        centerLabel: 'Total',
        centerValue: money(total),
      };
    }
    return result;
  },
  content: {
    formula: [
      'Overlap rent cost = overlap days × monthly rent ÷ 30',
      'Total moving cost = movers + truck + fuel + boxes and supplies + cleaning or deposit loss + utility fees + overlap rent',
      'Months of rent = total moving cost ÷ monthly rent',
    ],
    body: [
      'A move costs more than the truck. Boxes, fuel, cleaning, utility fees and a few days of paying for two homes all add up, and they are easy to forget when you set a budget. This calculator puts every line in one place and shows how much of the total each one makes up.',
      'Every number here is an estimate that you type in. Nothing is looked up or assumed, so the answer is only as good as your quotes. Replace guesses with real prices as you collect them.',
      'The overlap line works on a 30-day month. With 10 overlap days and 1,800 dollars of rent, the overlap costs 10 × 1,800 ÷ 30 = 600 dollars. Add 480 for movers, 120 for the truck, 60 for fuel, 75 for supplies and 150 for cleaning, and the total is 1,485 dollars. Divided by the 1,800 dollar rent, that is 0.825 months of rent.',
      'Shortening the overlap is often the easiest saving, since each extra day costs a thirtieth of a month of rent. If your overlap is covered by one lease ending as the other begins, set the days to 0.',
    ],
    faq: [
      { q: 'How is the overlap rent calculated?', a: 'Overlap days × monthly rent ÷ 30. With the default 10 days and 1,800 dollars of rent, that is 600 dollars.' },
      { q: 'What is the total with the default numbers?', a: 'The defaults give 480 + 120 + 60 + 75 + 150 + 0 + 600 = 1,485 dollars, which is 0.825 months of rent at 1,800 dollars a month.' },
      { q: 'Why is "months of rent" blank?', a: 'It divides the total by monthly rent, so it is left blank when rent is 0. The total and the chart still work.' },
      { q: 'Are these costs typical for a move?', a: 'This calculator does not know typical costs. The defaults are only placeholders, so replace each one with your own quote or estimate.' },
      { q: 'What if I only pay for one home at a time?', a: 'Set overlap days to 0. The overlap rent becomes 0 and the total is just your other cost lines.' },
    ],
    sources: [],
  },
  related: ['prorated-rent', 'lease-break-cost', 'rent-affordability', 'rent-split'],
  examples: [
    {
      // 480 + 120 + 60 + 75 + 150 + 0 + (10 x 1800 / 30 = 600) = 1485; 1485 / 1800 = 0.825; largest is overlap rent (600 > 480)
      values: { movers: 480, truck: 120, fuel: 60, boxes: 75, cleaning: 150, utilities: 0, days: 10, rent: 1800 },
      expect: { total: 1485, overlap: 600, months: 0.825, largest: 'Overlap rent' },
      tolerance: 1e-6,
    },
    {
      // Zero rent: overlap 0; total 480 + 120 + 60 + 75 + 150 = 885; months of rent is blank (examples cannot assert null)
      values: { movers: 480, truck: 120, fuel: 60, boxes: 75, cleaning: 150, utilities: 0, days: 10, rent: 0 },
      expect: { total: 885, overlap: 0, largest: 'Movers or helpers' },
      tolerance: 1e-6,
    },
    {
      // Zero overlap: 500 + 100 + 40 + 60 + 0 + 100 = 800; 800 / 2000 = 0.4; largest movers (500)
      values: { movers: 500, truck: 100, fuel: 40, boxes: 60, cleaning: 0, utilities: 100, days: 0, rent: 2000 },
      expect: { total: 800, overlap: 0, months: 0.4, largest: 'Movers or helpers' },
      tolerance: 1e-6,
    },
  ],
});

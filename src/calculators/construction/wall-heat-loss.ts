import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const W_PER_BTUH = 0.29307;
const BTU_PER_KWH = 3412.14;

export default defineCalculator({
  slug: 'wall-heat-loss',
  title: 'Wall Heat Loss Calculator (R-Value)',
  category: 'construction',
  description: 'Work out how much heat a wall loses in BTU/h and watts from its area, R-value and temperature gap, and how much a better R-value would save.',
  keywords: ['wall heat loss calculator', 'r-value heat loss', 'btu per hour heat loss wall', 'insulation upgrade savings', 'heat loss through wall formula'],
  updated: '2026-11-26',
  inputs: [
    { id: 'area', label: 'Wall area', type: 'number', suffix: 'ft²', default: 100, min: 0, step: 10, info: 'Net area of the wall, without windows and doors.' },
    { id: 'rNow', label: 'R-value now', type: 'number', default: 13, min: 0, step: 1, info: 'US R-value in ft²·°F·h/BTU. A 2x4 wall with fiberglass batts is often about R-13.' },
    { id: 'rNew', label: 'R-value after upgrade', type: 'number', default: 21, min: 0, step: 1, info: 'The R-value you are considering for the same wall.' },
    { id: 'gap', label: 'Indoor minus outdoor temperature', type: 'number', suffix: '°F', default: 40, min: 0, step: 1, info: 'For example 68°F inside and 28°F outside is a 40°F gap.' },
    { id: 'hours', label: 'Heating hours per day', type: 'number', suffix: 'h', default: 24, min: 0, max: 24, step: 1, optional: true, info: 'Used only for the season energy and cost.' },
    { id: 'days', label: 'Days in the heating season', type: 'number', suffix: 'days', default: 120, min: 0, max: 366, step: 5, optional: true, info: 'Used only for the season energy and cost. It assumes the same gap on every day, which is a simplification.' },
    { id: 'price', label: 'Cost per kWh of heat', type: 'number', prefix: '$', default: 0.12, min: 0, step: 0.01, optional: true, info: 'Electric resistance heat costs the electricity price. For gas or oil, divide the fuel cost per kWh by your furnace efficiency.' },
  ],
  outputs: [
    { id: 'btuNow', label: 'Heat loss now', format: 'number', precision: 1, suffix: 'BTU/h', primary: true, info: 'Area × temperature gap ÷ R-value.' },
    { id: 'wattsNow', label: 'Heat loss now in watts', format: 'number', precision: 1, suffix: 'W', info: 'BTU/h × 0.29307.' },
    { id: 'btuNew', label: 'Heat loss after upgrade', format: 'number', precision: 1, suffix: 'BTU/h', info: 'Same formula with the new R-value.' },
    { id: 'btuSaved', label: 'Heat loss saved', format: 'number', precision: 1, suffix: 'BTU/h', info: 'Heat loss now minus heat loss after the upgrade.' },
    { id: 'wattsSaved', label: 'Heat saved in watts', format: 'number', precision: 1, suffix: 'W', info: 'BTU/h saved × 0.29307.' },
    { id: 'kwhSaved', label: 'Energy saved per season', format: 'number', precision: 1, suffix: 'kWh', info: 'BTU/h saved × hours × days ÷ 3,412.14.' },
    { id: 'costSaved', label: 'Heating cost saved per season', format: 'currency', info: 'kWh saved × cost per kWh of heat.' },
  ],
  compute: (v) => {
    const area = num(v.area), rNow = num(v.rNow), rNew = num(v.rNew), gap = num(v.gap);
    const hours = num(v.hours) ?? 24, days = num(v.days) ?? 120, price = num(v.price) ?? 0.12;
    if ([area, rNow, rNew, gap].some((x) => x === null)) return { btuNow: null };
    const A = area as number, R1 = rNow as number, R2 = rNew as number, G = gap as number;
    if (A < 0 || G < 0 || R1 <= 0 || R2 <= 0 || hours < 0 || hours > 24 || days < 0 || price < 0) return { btuNow: null };
    const btuNow = (A * G) / R1;
    const btuNew = (A * G) / R2;
    const btuSaved = btuNow - btuNew;
    const kwhSaved = (btuSaved * hours * days) / BTU_PER_KWH;
    const costSaved = kwhSaved * price;
    const better = btuSaved > 0;
    return {
      btuNow,
      wattsNow: btuNow * W_PER_BTUH,
      btuNew,
      btuSaved,
      wattsSaved: btuSaved * W_PER_BTUH,
      kwhSaved,
      costSaved,
      tone: better ? 'good' : 'ok',
      badge: better ? 'Upgrade cuts loss' : btuSaved < 0 ? 'New R-value is lower' : 'No change',
      note: 'Steady-state estimate through the wall only. It ignores air leaks, studs and other thermal bridges, windows and changing weather, so real savings are usually smaller.',
      chart: {
        type: 'bar' as const,
        title: 'Heat loss through the wall (BTU/h)',
        categories: ['Now', 'After upgrade'],
        series: [{ name: 'BTU/h', values: [btuNow, btuNew] }],
        format: { format: 'number' as const },
        highlight: 0,
      },
      steps: [
        `Now = ${fmt(A, 0)} ft² × ${fmt(G)} °F ÷ R-${fmt(R1)} = ${fmt(btuNow)} BTU/h = ${fmt(btuNow * W_PER_BTUH)} W`,
        `After = ${fmt(A, 0)} ft² × ${fmt(G)} °F ÷ R-${fmt(R2)} = ${fmt(btuNew)} BTU/h`,
        `Saved = ${fmt(btuSaved)} BTU/h = ${fmt(btuSaved * W_PER_BTUH)} W`,
        `Season = ${fmt(btuSaved)} × ${fmt(hours)} h × ${fmt(days, 0)} days ÷ 3,412.14 = ${fmt(kwhSaved)} kWh, or ${money(costSaved)} at ${money(price)} per kWh`,
      ],
    };
  },
  content: {
    formula: [
      'Heat loss (BTU/h) = area (ft²) × temperature gap (°F) ÷ R-value',
      'Watts = BTU/h × 0.29307',
      'kWh = BTU/h × hours ÷ 3,412.14',
      'Cost = kWh × cost per kWh of heat',
    ],
    body: [
      'R-value measures how well a layer resists heat flow, so the bigger the number, the less heat escapes. In US units it is ft²·°F·h per BTU. Dividing the wall area times the temperature difference by R gives the heat flow in BTU per hour.',
      'Enter the wall area, the R-value now and the R-value you are considering, and the calculator shows both heat losses, the difference in BTU/h and watts, and an optional season energy and cost figure. Going from R-13 to R-21 cuts the loss by about 38%, because loss is proportional to 1 ÷ R.',
      'This is a steady-state estimate for the wall alone. It ignores air leaks, wood studs that conduct more than the insulation, windows and varying weather, so treat the savings as an upper bound. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much heat does a 100 ft² R-13 wall lose?', a: 'At a 40°F gap, 100 × 40 ÷ 13 = 307.7 BTU/h, which is about 90.2 watts.' },
      { q: 'How much does upgrading from R-13 to R-21 save?', a: 'On the same 100 ft² at 40°F the loss falls from 307.7 to 190.5 BTU/h, a saving of 117.2 BTU/h (about 34.4 W).' },
      { q: 'What does that save over a season?', a: 'With the defaults (24 h a day for 120 days) 117.2 BTU/h is about 98.9 kWh, or $11.87 at $0.12 per kWh of heat. It is a simplification because the gap changes through the season.' },
      { q: 'Does this include windows or air leaks?', a: 'No. It covers conduction through the wall only. Air leaks, studs and windows add to real heat loss, so real savings are usually smaller.' },
    ],
  },
  related: ['heating-cost', 'home-energy-credit-payback', 'thermostat-setback', 'energy-upgrade-payback'],
  examples: [
    // 100*40/13 = 307.6923; 100*40/21 = 190.4762; saved 117.2161; W 307.6923*0.29307 = 90.1754
    // kWh = 117.2161*24*120/3412.14 = 98.9357; cost = 98.9357*0.12 = 11.8723
    { values: { area: 100, rNow: 13, rNew: 21, gap: 40, hours: 24, days: 120, price: 0.12 }, expect: { btuNow: 307.6923, wattsNow: 90.1754, btuNew: 190.4762, btuSaved: 117.2161, wattsSaved: 34.3525, kwhSaved: 98.9357, costSaved: 11.8723 }, tolerance: 1e-3 },
    // 200*30/19 = 315.7895; 200*30/38 = 157.8947; saved 157.8947; 10 h x 100 d: 157.8947*1000/3412.14 = 46.2744 kWh; x0.20 = 9.2549
    { values: { area: 200, rNow: 19, rNew: 38, gap: 30, hours: 10, days: 100, price: 0.2 }, expect: { btuNow: 315.7895, btuNew: 157.8947, btuSaved: 157.8947, kwhSaved: 46.2744, costSaved: 9.2549 }, tolerance: 1e-3 },
  ],
});

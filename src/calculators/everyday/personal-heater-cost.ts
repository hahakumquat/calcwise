import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'personal-heater-cost',
  title: 'Electric Blanket vs Space Heater Cost',
  category: 'everyday',
  description: 'Compare what an electric blanket and a space heater cost per day and per season from watts, hours, thermostat duty cycle and your price per kWh.',
  keywords: ['electric blanket vs space heater cost', 'space heater cost per hour', 'electric blanket cost per night', 'is an electric blanket cheaper than a space heater', 'personal heater running cost'],
  updated: '2026-11-25',
  inputs: [
    { id: 'nameA', label: 'Option A name', type: 'text', default: 'Electric blanket', optional: true, info: 'A label for the first heater, shown in the results.' },
    { id: 'wattsA', label: 'Option A power', type: 'number', suffix: 'W', default: 100, min: 0, step: 10, info: 'Watts from the label on the heater or its plug.' },
    { id: 'hoursA', label: 'Option A hours per day', type: 'number', suffix: 'h', default: 8, min: 0, max: 24, step: 0.5, info: 'Hours the heater is switched on each day.' },
    { id: 'dutyA', label: 'Option A duty cycle', type: 'number', suffix: '%', default: 100, min: 0, max: 100, step: 5, info: 'Share of the on-time it actually draws full power. Thermostats cycle on and off, so a heater on high for 4 hours may only draw power for part of that time. Use 100 if unsure.' },
    { id: 'nameB', label: 'Option B name', type: 'text', default: 'Space heater', optional: true, info: 'A label for the second heater, shown in the results.' },
    { id: 'wattsB', label: 'Option B power', type: 'number', suffix: 'W', default: 1500, min: 0, step: 50, info: 'Watts from the label. Many small space heaters are rated 1,500 W on high.' },
    { id: 'hoursB', label: 'Option B hours per day', type: 'number', suffix: 'h', default: 4, min: 0, max: 24, step: 0.5, info: 'Hours the heater is switched on each day.' },
    { id: 'dutyB', label: 'Option B duty cycle', type: 'number', suffix: '%', default: 60, min: 0, max: 100, step: 5, info: 'Share of the on-time it draws full power, as the thermostat cycles. Use 100 if unsure.' },
    { id: 'price', label: 'Electricity price', type: 'number', prefix: '$', suffix: '/kWh', default: 0.16, min: 0, step: 0.01, info: 'Your rate from the electric bill, in dollars per kWh.' },
    { id: 'days', label: 'Days of use', type: 'number', default: 90, min: 1, max: 366, step: 1, info: 'How many days this winter you will use each option.' },
  ],
  outputs: [
    { id: 'diff', label: 'Season cost difference (B − A)', format: 'currency', primary: true, info: 'Option B season cost minus option A season cost. Positive means A is cheaper.' },
    { id: 'seasonA', label: 'Option A cost for the season', format: 'currency', info: 'Cost per day × days.' },
    { id: 'seasonB', label: 'Option B cost for the season', format: 'currency', info: 'Cost per day × days.' },
    { id: 'dayA', label: 'Option A cost per day', format: 'currency', precision: 3, info: 'Watts × hours × duty cycle ÷ 1,000 × price per kWh.' },
    { id: 'dayB', label: 'Option B cost per day', format: 'currency', precision: 3, info: 'Watts × hours × duty cycle ÷ 1,000 × price per kWh.' },
    { id: 'kwhA', label: 'Option A energy per day', format: 'number', precision: 2, suffix: 'kWh', info: 'Watts × hours × duty cycle ÷ 1,000.' },
    { id: 'kwhB', label: 'Option B energy per day', format: 'number', precision: 2, suffix: 'kWh', info: 'Watts × hours × duty cycle ÷ 1,000.' },
  ],
  compute: (v) => {
    const wA = num(v.wattsA), hA = num(v.hoursA), dA = num(v.dutyA);
    const wB = num(v.wattsB), hB = num(v.hoursB), dB = num(v.dutyB);
    const price = num(v.price);
    const days = num(v.days);
    if ([wA, hA, dA, wB, hB, dB, price, days].some((x) => x === null)) return { diff: null };
    if ((wA as number) < 0 || (wB as number) < 0 || (price as number) < 0 || (days as number) < 1) return { diff: null };
    if ((hA as number) < 0 || (hA as number) > 24 || (hB as number) < 0 || (hB as number) > 24) return { diff: null };
    if ((dA as number) < 0 || (dA as number) > 100 || (dB as number) < 0 || (dB as number) > 100) return { diff: null };
    const nameA = (typeof v.nameA === 'string' && v.nameA.trim()) || 'Option A';
    const nameB = (typeof v.nameB === 'string' && v.nameB.trim()) || 'Option B';
    const kwhA = ((wA as number) * (hA as number) * ((dA as number) / 100)) / 1000;
    const kwhB = ((wB as number) * (hB as number) * ((dB as number) / 100)) / 1000;
    const dayA = kwhA * (price as number);
    const dayB = kwhB * (price as number);
    const seasonA = dayA * (days as number);
    const seasonB = dayB * (days as number);
    const diff = seasonB - seasonA;
    const aCheaper = diff >= 0;
    const cheaper = aCheaper ? nameA : nameB;
    const dearer = aCheaper ? nameB : nameA;
    return {
      diff,
      seasonA,
      seasonB,
      dayA,
      dayB,
      kwhA,
      kwhB,
      tone: diff === 0 ? 'ok' : 'good',
      badge: diff === 0 ? 'Same cost' : `${cheaper} cheaper`,
      note: diff === 0
        ? 'Both options cost the same over the season.'
        : `${cheaper} costs ${money(Math.abs(diff))} less than ${dearer} over ${fmt(days as number, 0)} days. Watts come from the label and real thermostat cycling varies. This does not count whole-house savings from a lower thermostat setting.`,
      chart: {
        type: 'bar' as const,
        title: 'Cost for the season',
        categories: [nameA, nameB],
        series: [{ name: 'Season cost', values: [seasonA, seasonB] }],
        format: CURRENCY,
        highlight: aCheaper ? 0 : 1,
      },
      steps: [
        `${nameA}: ${fmt(wA as number, 0)} W × ${fmt(hA as number)} h × ${fmt(dA as number)}% ÷ 1,000 = ${fmt(kwhA, 3)} kWh a day`,
        `${nameB}: ${fmt(wB as number, 0)} W × ${fmt(hB as number)} h × ${fmt(dB as number)}% ÷ 1,000 = ${fmt(kwhB, 3)} kWh a day`,
        `Cost a day: ${fmt(kwhA, 3)} × ${money(price as number)} = ${money(dayA)}; ${fmt(kwhB, 3)} × ${money(price as number)} = ${money(dayB)}`,
        `Season: ${money(dayA)} × ${fmt(days as number, 0)} = ${money(seasonA)}; ${money(dayB)} × ${fmt(days as number, 0)} = ${money(seasonB)}`,
        `Difference = ${money(seasonB)} − ${money(seasonA)} = ${money(diff)}`,
      ],
    };
  },
  content: {
    formula: [
      'kWh per day = watts × hours per day × duty cycle ÷ 1,000',
      'Cost per day = kWh per day × price per kWh',
      'Season cost = cost per day × days',
      'Difference = option B season cost − option A season cost',
    ],
    body: [
      'An electric blanket warms you, not the room, so it draws far fewer watts than a space heater. Enter the wattage from each label, the hours you run it and a duty cycle for thermostat cycling to see what each costs for the season.',
      'The duty cycle is the share of the on-time the heater actually draws full power. A heater with a thermostat switches off once it reaches its setting, so 60% is a reasonable guess for a heater that runs on high. Use 100% for something that is always drawing power.',
      'The two options do not have to be a blanket and a heater: rename them and compare any two. Running costs only, with no purchase price. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'Is an electric blanket cheaper than a space heater?', a: 'Usually, because it uses far fewer watts. With the defaults, a 100 W blanket for 8 hours uses 0.8 kWh a day against 3.6 kWh for a 1,500 W heater for 4 hours at a 60% duty cycle.' },
      { q: 'How is the cost per day worked out?', a: 'Watts × hours × duty cycle ÷ 1,000 gives kWh, and kWh × price gives dollars. At $0.16 per kWh, 0.8 kWh costs $0.128 and 3.6 kWh costs $0.576.' },
      { q: 'What does 90 days cost?', a: 'At $0.16 per kWh, the blanket costs $0.128 × 90 = $11.52 and the heater $0.576 × 90 = $51.84, so the blanket saves $40.32.' },
      { q: 'Does this include savings from turning down the thermostat?', a: 'No. It compares only the running cost of the two devices. Whole-house savings from a lower thermostat setting are in the thermostat setback calculator.' },
    ],
    sources: [],
  },
  related: ['thermostat-setback', 'heating-cost', 'electricity-cost', 'water-heater-cost'],
  examples: [
    // A: 100*8*1/1000 = 0.8 kWh; B: 1500*4*0.6/1000 = 3.6; $0.128 vs $0.576 a day; 90 d: 11.52 vs 51.84; diff 40.32
    { values: { nameA: 'Electric blanket', wattsA: 100, hoursA: 8, dutyA: 100, nameB: 'Space heater', wattsB: 1500, hoursB: 4, dutyB: 60, price: 0.16, days: 90 }, expect: { kwhA: 0.8, kwhB: 3.6, dayA: 0.128, dayB: 0.576, seasonA: 11.52, seasonB: 51.84, diff: 40.32 }, tolerance: 1e-9 },
    // A: 60*10*0.5/1000 = 0.3; B: 750*6*1/1000 = 4.5; $0.06 vs $0.90 a day; 60 d: 3.60 vs 54.00; diff 50.40
    { values: { nameA: 'Electric blanket', wattsA: 60, hoursA: 10, dutyA: 50, nameB: 'Space heater', wattsB: 750, hoursB: 6, dutyB: 100, price: 0.2, days: 60 }, expect: { kwhA: 0.3, kwhB: 4.5, dayA: 0.06, dayB: 0.9, seasonA: 3.6, seasonB: 54, diff: 50.4 }, tolerance: 1e-9 },
  ],
});

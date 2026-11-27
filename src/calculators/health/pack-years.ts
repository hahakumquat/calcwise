import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'pack-years',
  title: 'Pack-Years Calculator',
  category: 'health',
  description: 'Work out your pack-years from cigarettes per day and years smoked, plus total cigarettes and money spent. Simple arithmetic, not medical advice.',
  keywords: ['pack years calculator', 'how to calculate pack years', 'pack year smoking history', 'packs per day times years', 'lifetime cigarettes smoked'],
  updated: '2026-11-27',
  inputs: [
    { id: 'cigs', label: 'Cigarettes per day', type: 'number', default: 10, min: 0, step: 1, info: 'Your typical daily amount over the years you smoked. If it changed a lot, run it once per period and add the results.' },
    { id: 'perPack', label: 'Cigarettes per pack', type: 'number', default: 20, min: 1, step: 1, info: 'Packs usually hold 20.' },
    { id: 'years', label: 'Years smoked', type: 'number', default: 15, min: 0, max: 80, step: 0.5, info: 'Total years you smoked at that rate.' },
    { id: 'price', label: 'Average price per pack (optional)', type: 'number', prefix: '$', default: 6, min: 0, step: 0.25, info: 'An average over the years, only used for the spending estimate. Use 0 to ignore it.' },
  ],
  outputs: [
    { id: 'packYears', label: 'Pack-years', format: 'number', primary: true, info: 'Packs smoked per day × years smoked.' },
    { id: 'packsPerDay', label: 'Packs per day', format: 'number', info: 'Cigarettes per day ÷ cigarettes per pack.' },
    { id: 'cigarettes', label: 'Cigarettes smoked in total', format: 'number', info: 'Cigarettes per day × 365 × years.' },
    { id: 'packs', label: 'Packs bought in total', format: 'number', info: 'Pack-years × 365.' },
    { id: 'spent', label: 'Estimated money spent', format: 'currency', info: 'Packs bought × average price per pack.' },
  ],
  compute: (v) => {
    const cigs = num(v.cigs);
    const perPack = num(v.perPack);
    const years = num(v.years);
    const price = num(v.price);
    if (cigs === null || perPack === null || years === null || price === null || cigs < 0 || perPack < 1 || years < 0 || price < 0) return { packYears: null };
    const packsPerDay = cigs / perPack;
    const packYears = packsPerDay * years;
    const cigarettes = cigs * 365 * years;
    const packs = packYears * 365;
    const spent = packs * price;
    const whole = Math.max(1, Math.ceil(years));
    const xs: number[] = [];
    const ys: number[] = [];
    for (let y = 0; y <= whole; y++) {
      xs.push(y);
      ys.push(packsPerDay * Math.min(y, years));
    }
    return {
      packYears,
      packsPerDay,
      cigarettes,
      packs,
      spent,
      tone: 'ok' as const,
      badge: `${fmt(packYears, 1)} pack-years`,
      note: `${fmt(cigs, cigs % 1 ? 1 : 0)} cigarettes a day is ${fmt(packsPerDay, 2)} packs a day. Over ${fmt(years, years % 1 ? 1 : 0)} years that is ${fmt(packYears, 1)} pack-years. This is a simple count, not a medical assessment: a clinician decides what it means for you.`,
      chart: {
        type: 'line',
        title: 'Pack-years built up over time',
        x: xs,
        xLabel: 'Years smoked',
        yFormat: { format: 'number' },
        series: [{ name: 'Pack-years', values: ys }],
      },
      steps: [
        `Packs per day = ${fmt(cigs, 1)} ÷ ${fmt(perPack, 0)} = ${fmt(packsPerDay, 3)}`,
        `Pack-years = ${fmt(packsPerDay, 3)} × ${fmt(years, 1)} = ${fmt(packYears, 2)}`,
        `Packs bought = ${fmt(packYears, 2)} × 365 = ${fmt(packs, 0)}; at $${fmt(price, 2)} a pack that is $${fmt(spent, 0)}`,
      ],
    };
  },
  content: {
    formula: [
      'Packs per day = cigarettes per day ÷ cigarettes per pack',
      'Pack-years = packs per day × years smoked',
      'Cigarettes smoked = cigarettes per day × 365 × years; packs bought = pack-years × 365',
    ],
    body: [
      'A pack-year is a way to put smoking history into one number: smoking one pack a day for one year is one pack-year. Two packs a day for five years is ten pack-years, and so is half a pack a day for twenty years.',
      'Enter how many cigarettes you smoked a day, how many come in a pack and for how many years. The calculator gives your pack-years and also the total cigarettes and packs, plus a rough spending figure if you add an average pack price.',
      'If your habit changed over time, work out each period separately and add the pack-years together. This tool only does the arithmetic. It does not diagnose anything or say whether you need any test, so talk to a doctor or nurse about what your history means for you. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How many pack-years is a pack a day for 20 years?', a: '20 pack-years: 1 pack a day × 20 years. At 20 cigarettes a pack that is 20 × 365 × 20 = 146,000 cigarettes.' },
      { q: 'How do I calculate pack-years if I smoked 10 cigarettes a day?', a: 'Divide by the pack size. 10 ÷ 20 = 0.5 packs a day, so 30 years of that is 15 pack-years.' },
      { q: 'What if my smoking changed over the years?', a: 'Calculate each stretch on its own and add them. For example 5 years at 1 pack a day (5) plus 10 years at half a pack (5) is 10 pack-years.' },
      { q: 'Does this tell me if I need screening?', a: 'No. It is only a count. Ask a doctor, who will consider your age, history and local guidance.' },
      { q: 'How is the money figure worked out?', a: 'Packs bought (pack-years × 365) multiplied by the average price you enter. Prices changed over the years, so treat it as a rough estimate.' },
    ],
    sources: [],
  },
  related: ['quit-smoking-savings', 'alcohol-units', 'bmi', 'sleep-debt'],
  examples: [
    // 20/20 = 1 pack a day x 20 years = 20 pack-years; cigarettes 20 x 365 x 20 = 146,000; packs 7,300; $6 => 43,800
    { values: { cigs: 20, perPack: 20, years: 20, price: 6 }, expect: { packYears: 20, packsPerDay: 1, cigarettes: 146000, packs: 7300, spent: 43800 }, tolerance: 1e-9 },
    // 10/20 = 0.5 x 30 = 15 pack-years; packs 5,475; $10 => 54,750
    { values: { cigs: 10, perPack: 20, years: 30, price: 10 }, expect: { packYears: 15, packsPerDay: 0.5, packs: 5475, spent: 54750 }, tolerance: 1e-9 },
    // 40 a day in packs of 20 = 2 packs x 2.5 years = 5 pack-years; 40 x 365 x 2.5 = 36,500 cigarettes
    { values: { cigs: 40, perPack: 20, years: 2.5, price: 0 }, expect: { packYears: 5, cigarettes: 36500, spent: 0 }, tolerance: 1e-9 },
  ],
});

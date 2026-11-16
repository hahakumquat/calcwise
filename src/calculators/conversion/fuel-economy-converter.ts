import { defineCalculator } from '../../lib/types';
import type { ComputeResult, Values } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

// Fuel economy is the one conversion where two units are reciprocals of each other
// (miles per gallon vs litres per 100 km), so the shared "fuel" unit group (base: km/L) does the work.
const conv = makeConverter(
  'fuel',
  [
    { id: 'l100', name: 'Litres per 100 km', precision: 2, info: 'Litres of fuel burned per 100 km. Lower is better. Used across Europe, Canada, Australia and China.' },
    { id: 'mpg', name: 'Miles per US gallon', precision: 1, info: 'Miles per US gallon (3.785 L). Higher is better. The standard figure on US window stickers.' },
    { id: 'mpguk', name: 'Miles per UK gallon', precision: 1, info: 'Miles per imperial gallon (4.546 L). Higher is better. Used in UK fuel-economy figures; about 20% larger than US mpg for the same car.' },
    { id: 'kmpl', name: 'Kilometres per litre', precision: 2, info: 'Kilometres travelled per litre of fuel. Higher is better. Common in India, Japan and parts of Latin America.' },
  ],
  'l100',
);

export default defineCalculator({
  slug: 'fuel-economy-converter',
  title: 'Fuel Economy Converter',
  category: 'conversion',
  description: 'Convert fuel economy between US mpg, UK mpg, L/100 km and km/L, and see how efficient your car is.',
  keywords: ['mpg to l/100km', 'l/100km to mpg', 'mpg to km/l', 'uk mpg to us mpg', 'fuel consumption converter', 'fuel efficiency converter'],
  inputs: [
    {
      id: 'value',
      label: 'Fuel economy',
      type: 'number',
      unit: 'fuel',
      defaultUnit: 'mpg',
      default: 30,
      info: 'Enter your fuel economy and pick its unit; the other three update instantly. Note that L/100 km works the opposite way: a lower number means a thriftier car.',
    },
  ],
  outputs: conv.outputs.map((o) => ({ ...o, ...(o.id === 'l100' ? { primary: true } : {}) })),
  compute: (v: Values): ComputeResult => {
    const base = typeof v.value === 'number' ? v.value : null; // km per litre
    // Zero or negative economy is meaningless, and L/100 km = 0 would mean infinite km/L.
    if (base === null || !Number.isFinite(base)) return { l100: null };
    if (base <= 0) return { l100: null, error: 'Enter a fuel economy greater than zero.' };
    const r = conv.compute(v);
    delete r.chart; // the generic bar chart compares different units, which is misleading here
    const l100 = 100 / base;
    const tone = l100 <= 6 ? 'good' : l100 <= 8.5 ? 'ok' : l100 <= 12 ? 'warn' : 'bad';
    const badge = l100 <= 6 ? 'Very efficient' : l100 <= 8.5 ? 'Average' : l100 <= 12 ? 'Thirsty' : 'Very thirsty';
    const max = Math.max(20, Math.ceil(l100 / 5) * 5);
    return {
      ...r,
      tone,
      badge,
      note: `${badge}: about ${l100.toFixed(1)} L per 100 km.`,
      chart: {
        type: 'scale',
        title: 'How thirsty is that? (L/100 km, lower is better)',
        min: 0,
        max,
        value: Math.min(l100, max),
        valueLabel: `${l100.toFixed(1)} L/100 km`,
        bands: [
          { from: 0, to: 6, label: 'Very efficient', tone: 'good' },
          { from: 6, to: 8.5, label: 'Average', tone: 'ok' },
          { from: 8.5, to: 12, label: 'Thirsty', tone: 'warn' },
          { from: 12, to: max, label: 'Very thirsty', tone: 'bad' },
        ],
      },
      steps: [
        `L/100 km = 235.215 ÷ US mpg = 282.481 ÷ UK mpg`,
        `${(r.mpg as number).toFixed(1)} US mpg → ${l100.toFixed(2)} L/100 km → ${(base).toFixed(2)} km/L → ${(r.mpguk as number).toFixed(1)} UK mpg`,
      ],
    };
  },
  content: {
    formula: [
      'L/100 km = 235.215 ÷ mpg (US)',
      'L/100 km = 282.481 ÷ mpg (UK)',
      'km/L = 100 ÷ (L/100 km)',
      'UK mpg = US mpg × 1.20095',
    ],
    body: [
      'Fuel economy is quoted two opposite ways. Miles per gallon and kilometres per litre measure distance per unit of fuel, so bigger is better. Litres per 100 km measures fuel per unit of distance, so smaller is better. That is why converting between them means dividing into a constant rather than multiplying: 235.215 ÷ 30 mpg gives 7.84 L/100 km.',
      'The constants come from two exact definitions. A mile is 1.609344 km and a US gallon is 3.785411784 L, so 100 km per mile-per-gallon works out to 235.215 L. An imperial (UK) gallon is 4.54609 L, which makes the constant 282.481 and every UK mpg figure about 20% higher than the US figure for the same car.',
      'The reciprocal also explains why upgrades from poor economy matter more than they look. Going from 15 to 20 mpg saves about 3.9 L per 100 km, while going from 35 to 40 mpg saves only about 0.8 L per 100 km, even though both are 5 mpg gains.',
      'The efficiency label is a rough guide on the L/100 km scale: up to 6 is very efficient (small hybrids and compact cars), 6 to 8.5 is average, 8.5 to 12 is thirsty (many SUVs and trucks) and above 12 is very thirsty.',
    ],
    faq: [
      { q: 'What is 30 US mpg in L/100 km?', a: '30 US mpg is 7.84 L/100 km, which is 12.75 km/L or 36.0 UK mpg.' },
      { q: 'How do I convert mpg to L/100 km?', a: 'Divide 235.215 by the US mpg figure (or 282.481 by the UK mpg figure). The same formula works backwards: 235.215 ÷ 8 L/100 km = 29.4 US mpg.' },
      { q: 'Why is UK mpg higher than US mpg?', a: 'The imperial gallon (4.546 L) is about 20% bigger than the US gallon (3.785 L), so the same car travels more miles per gallon on the UK scale. 30 US mpg equals 36.0 UK mpg.' },
      { q: 'How do I convert L/100 km to km/L?', a: 'Divide 100 by the L/100 km figure. 8 L/100 km is 12.5 km/L, and 10 L/100 km is exactly 10 km/L.' },
      { q: 'Why does the converter ask for a number above zero?', a: 'Zero or negative fuel economy has no physical meaning, and 0 L/100 km would imply infinite distance per litre, so the converter asks for a positive value instead.' },
    ],
    sources: [
      { label: 'NIST Special Publication 811: Guide for the Use of the International System of Units (unit definitions)', url: 'https://www.nist.gov/pml/special-publication-811' },
      { label: 'U.S. EPA and DOE: fueleconomy.gov, fuel economy information for US vehicles', url: 'https://www.fueleconomy.gov/' },
      { label: 'Exact definitions used: 1 mile = 1.609344 km; 1 US gallon = 3.785411784 L; 1 imperial gallon = 4.54609 L' },
    ],
  },
  related: ['gas-cost', 'speed-converter', 'volume-converter', 'length-converter'],
  examples: [
    // Inputs reach compute() in the base unit, km/L.
    // 30 US mpg = 30 × 0.425143707 = 12.75431121 km/L; L/100 km = 100 / 12.75431121 = 7.8405 (235.215 / 30);
    // UK mpg = 12.75431121 / 0.354006189 = 36.0285 (30 × 1.20095)
    { values: { value: 12.75431121 }, expect: { l100: 7.840486, mpg: 30, kmpl: 12.75431121, mpguk: 36.028498 }, tolerance: 1e-6 },
    // 8 L/100 km = 12.5 km/L; US mpg = 235.215 / 8 = 29.40 (12.5 / 0.425143707 = 29.4018); UK mpg = 282.481 / 8 = 35.31
    { values: { value: 12.5 }, expect: { l100: 8, mpg: 29.401823, mpguk: 35.310117 }, tolerance: 1e-6 },
    // 10 km/L = 10 L/100 km; US mpg = 235.215 / 10 = 23.52; UK mpg = 282.481 / 10 = 28.25
    { values: { value: 10 }, expect: { l100: 10, mpg: 23.521458, mpguk: 28.248094, badge: 'Thirsty', tone: 'warn' }, tolerance: 1e-6 },
    // 60 mpg-class hybrid: 4 L/100 km = 25 km/L
    { values: { value: 25 }, expect: { l100: 4, badge: 'Very efficient', tone: 'good' } },
  ],
});

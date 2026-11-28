import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd0 = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');

export default defineCalculator({
  slug: 'home-maintenance-budget',
  title: 'Home Maintenance Budget Calculator',
  category: 'finance',
  description: 'Estimate how much to set aside each year for home repairs with the 1 percent and 2 percent of value rules and the $1 per square foot rule, and see your gap.',
  keywords: ['home maintenance budget', '1 percent rule home maintenance', 'how much to save for house repairs', 'home repair fund calculator', 'annual home maintenance cost'],
  updated: '2026-11-28',
  inputs: [
    { id: 'value', label: 'Home value', type: 'number', prefix: '$', default: 400000, min: 0, step: 5000, info: 'Current market value of the home.' },
    { id: 'sqft', label: 'Home size', type: 'number', suffix: 'sq ft', default: 2000, min: 0, step: 50, info: 'Finished living area in square feet.' },
    { id: 'age', label: 'Home age', type: 'number', suffix: 'years', default: 12, min: 0, step: 1, info: 'Years since the home was built. Homes 30 years or older often need more.' },
    { id: 'saved', label: 'Amount set aside per year', type: 'number', prefix: '$', default: 2500, min: 0, step: 100, info: 'What you actually put aside for maintenance each year.' },
  ],
  outputs: [
    { id: 'mid', label: 'Typical budget (1% of value)', format: 'currency', primary: true, precision: 0, info: 'One percent of home value per year.' },
    { id: 'midMo', label: 'Typical, per month', format: 'currency', precision: 0, info: 'Yearly typical budget divided by 12.' },
    { id: 'low', label: 'Low budget ($1 per sq ft)', format: 'currency', precision: 0, info: 'One dollar per square foot per year.' },
    { id: 'lowMo', label: 'Low, per month', format: 'currency', precision: 0, info: 'Yearly low budget divided by 12.' },
    { id: 'high', label: 'High budget (2% of value)', format: 'currency', precision: 0, info: 'Two percent of home value per year. Suggested for homes 30 or more years old.' },
    { id: 'highMo', label: 'High, per month', format: 'currency', precision: 0, info: 'Yearly high budget divided by 12.' },
    { id: 'gap', label: 'Gap vs typical budget', format: 'currency', precision: 0, info: 'Typical budget minus what you set aside. Negative means you are ahead.' },
    { id: 'gapMo', label: 'Gap per month', format: 'currency', precision: 0, info: 'Yearly gap divided by 12.' },
  ],
  compute: (v) => {
    const val = num(v.value), sq = num(v.sqft), age = num(v.age) ?? 0, saved = num(v.saved) ?? 0;
    if (val === null || sq === null) return { mid: null };
    if (val < 0 || sq < 0 || age < 0 || saved < 0) return { mid: null, error: 'Values cannot be negative.' };
    const low = sq;
    const mid = val * 0.01;
    const high = val * 0.02;
    const gap = mid - saved;
    const old = age >= 30;
    return {
      mid, midMo: mid / 12, low, lowMo: low / 12, high, highMo: high / 12, gap, gapMo: gap / 12,
      chart: {
        type: 'bar',
        title: 'Yearly maintenance budget',
        categories: ['Low ($1/sq ft)', 'Typical (1%)', 'High (2%)', 'You set aside'],
        series: [{ name: 'Per year', values: [low, mid, high, saved] }],
        format: { format: 'currency' },
        highlight: 3,
      },
      tone: gap <= 0 ? 'good' : saved >= low ? 'ok' : 'warn',
      badge: gap > 0 ? `${usd0(gap)} a year short of typical` : 'At or above typical',
      note: `These are rules of thumb, not standards. A big roof or HVAC year can exceed them, and new builds often need less early on.${old ? ' At 30 or more years old, plan toward the high figure.' : ''}`,
      steps: [
        `Low = ${sq.toLocaleString('en-US')} sq ft × $1 = ${usd0(low)} a year (${usd0(low / 12)} a month)`,
        `Typical = 1% × ${usd0(val)} = ${usd0(mid)} (${usd0(mid / 12)} a month)`,
        `High = 2% × ${usd0(val)} = ${usd0(high)} (${usd0(high / 12)} a month)`,
        `Gap = ${usd0(mid)} − ${usd0(saved)} = ${usd0(gap)} a year (${usd0(gap / 12)} a month)`,
      ],
    };
  },
  content: {
    formula: [
      'Low = square feet × $1 per year',
      'Typical = 1% of home value per year',
      'High = 2% of home value per year (suggested at 30+ years old)',
      'Monthly = yearly ÷ 12',
      'Gap = typical − amount set aside',
    ],
    body: [
      'Owning a home means repairs: water heaters, roofs, HVAC, paint, appliances. Because costs arrive unevenly, many owners set money aside each month. Two popular rules of thumb give a range: about 1 percent of the home value a year, or about $1 per square foot a year as a lower figure. Older homes often need up to 2 percent.',
      'This calculator shows all three, converts them to monthly amounts, and compares the typical figure with what you actually put aside so you can see the gap.',
      'These are rules of thumb, not standards. One roof or HVAC replacement can exceed a year of budget, and a new build often needs less in its early years. Treat the result as a starting point and adjust for your home.',
    ],
    faq: [
      { q: 'What is the result for a $400,000, 2,000 sq ft home?', a: 'The low figure is $2,000 a year ($167 a month), typical is $4,000 ($333 a month) and high is $8,000 ($667 a month).' },
      { q: 'What if I save $2,500 a year?', a: 'Against the typical $4,000 you are $1,500 a year short, which is $125 a month.' },
      { q: 'When should I use the high figure?', a: 'The 2 percent figure is suggested for homes 30 or more years old, or any home with big systems nearing the end of their life.' },
      { q: 'Is the 1 percent rule an official standard?', a: 'No. It is a common rule of thumb. Your own costs can be lower or much higher.' },
      { q: 'Does a new home need this much?', a: 'Often less in the first years, since systems are new and under warranty.' },
    ],
    sources: [],
  },
  related: ['emergency-fund', 'sinking-fund', 'home-affordability'],
  examples: [
    // low 2000 (/12=166.67); mid 4000 (333.33); high 8000 (666.67); gap 4000-2500 = 1500 (125/mo)
    { values: { value: 400000, sqft: 2000, age: 12, saved: 2500 }, expect: { low: 2000, lowMo: 166.6667, mid: 4000, midMo: 333.3333, high: 8000, highMo: 666.6667, gap: 1500, gapMo: 125 }, tolerance: 1e-3 },
    // $300,000, 1,500 sq ft, saved 4,000: mid 3000; gap -1000 (ahead)
    { values: { value: 300000, sqft: 1500, age: 35, saved: 4000 }, expect: { low: 1500, mid: 3000, high: 6000, gap: -1000 }, tolerance: 1e-3 },
  ],
});

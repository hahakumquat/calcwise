import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'rule-of-72',
  title: 'Rule of 72 Calculator',
  category: 'finance',
  description: 'Use the Rule of 72 to estimate how many years it takes money to double, or what rate you need, and compare it with the exact compound growth answer.',
  keywords: ['rule of 72 calculator', 'rule of 72', 'how long to double my money', 'doubling time calculator', 'years to double investment', 'rate needed to double money'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    {
      id: 'mode',
      label: 'What do you want to find?',
      type: 'select',
      default: 'years',
      options: [
        { value: 'years', label: 'Find years to double' },
        { value: 'rate', label: 'Find rate needed to double' },
      ],
      info: 'Choose years to see how long doubling takes at a given rate, or rate to see what annual return doubles your money in a set time.',
    },
    { id: 'rate', label: 'Annual rate of return', type: 'number', suffix: '%', default: 8, min: 0.01, max: 100, step: 0.1, showWhen: { input: 'mode', is: 'years' }, info: 'The yearly growth rate, compounded once a year. A savings account might pay 4%, a stock index has averaged around 7 to 10% before inflation.' },
    { id: 'years', label: 'Years to double', type: 'number', default: 9, min: 0.1, max: 500, step: 0.5, showWhen: { input: 'mode', is: 'rate' }, info: 'How many years you want your money to take to double.' },
  ],
  outputs: [
    { id: 'yearsRule', label: 'Years to double (Rule of 72)', format: 'number', precision: 2, suffix: 'years', primary: true, showWhen: { input: 'mode', is: 'years' }, info: '72 divided by the annual rate in percent. A quick mental estimate.' },
    { id: 'yearsExact', label: 'Exact years to double', format: 'number', precision: 3, suffix: 'years', showWhen: { input: 'mode', is: 'years' }, info: 'ln(2) ÷ ln(1 + rate), the exact compound-growth answer.' },
    { id: 'yearsDiff', label: 'Rule of 72 minus exact', format: 'number', precision: 3, suffix: 'years', showWhen: { input: 'mode', is: 'years' }, info: 'How far the shortcut is from the exact answer. Negative means the rule is slightly short, positive means slightly long.' },
    { id: 'rateRule', label: 'Rate needed (Rule of 72)', format: 'number', precision: 2, suffix: '% a year', primary: true, showWhen: { input: 'mode', is: 'rate' }, info: '72 divided by the years you want to take. A quick mental estimate.' },
    { id: 'rateExact', label: 'Exact rate needed', format: 'number', precision: 3, suffix: '% a year', showWhen: { input: 'mode', is: 'rate' }, info: '(2^(1 ÷ years) − 1) × 100, the exact compound-growth answer.' },
    { id: 'rateDiff', label: 'Rule of 72 minus exact', format: 'number', precision: 3, suffix: '% points', showWhen: { input: 'mode', is: 'rate' }, info: 'How far the shortcut is from the exact answer, in percentage points.' },
  ],
  compute: (v) => {
    const years = v.mode !== 'rate';
    const refRates = [2, 4, 6, 8, 10, 12];
    const chart = {
      type: 'bar' as const,
      title: 'Rule of 72 vs exact years to double',
      categories: refRates.map((r) => `${r}%`),
      series: [
        { name: 'Rule of 72', values: refRates.map((r) => 72 / r) },
        { name: 'Exact', values: refRates.map((r) => Math.log(2) / Math.log(1 + r / 100)) },
      ],
      format: { format: 'number' as const, suffix: ' yrs' },
    };

    if (years) {
      const r = num(v.rate);
      if (r === null || r < 0.01 || r > 100) return { yearsRule: null };
      const rule = 72 / r;
      const exact = Math.log(2) / Math.log(1 + r / 100);
      const diff = rule - exact;
      const accurate = r >= 6 && r <= 10;
      return {
        yearsRule: rule,
        yearsExact: exact,
        yearsDiff: diff,
        tone: accurate ? 'good' : 'ok',
        badge: accurate ? 'In the sweet spot for the rule' : 'Rough estimate at this rate',
        chart,
        steps: [
          `Rule of 72: 72 ÷ ${fmt(r)} = ${fmt(rule, 3)} years`,
          `Exact: ln(2) ÷ ln(1 + ${fmt(r)}%) = 0.693147 ÷ ${fmt(Math.log(1 + r / 100), 6)} = ${fmt(exact, 3)} years`,
          `Difference = ${fmt(rule, 3)} − ${fmt(exact, 3)} = ${fmt(diff, 3)} years`,
        ],
        note: `At ${fmt(r)}% a year, money doubles in about ${fmt(rule)} years by the Rule of 72. The exact answer is ${fmt(exact)} years. The rule works best for rates of roughly 6 to 10%.`,
      };
    }

    const y = num(v.years);
    if (y === null || y < 0.1 || y > 500) return { rateRule: null };
    const rule = 72 / y;
    const exact = (Math.pow(2, 1 / y) - 1) * 100;
    const diff = rule - exact;
    const accurate = exact >= 6 && exact <= 10;
    return {
      rateRule: rule,
      rateExact: exact,
      rateDiff: diff,
      tone: accurate ? 'good' : 'ok',
      badge: accurate ? 'In the sweet spot for the rule' : 'Rough estimate at this rate',
      chart,
      steps: [
        `Rule of 72: 72 ÷ ${fmt(y)} = ${fmt(rule, 3)}% a year`,
        `Exact: (2^(1 ÷ ${fmt(y)}) − 1) × 100 = ${fmt(exact, 3)}% a year`,
        `Difference = ${fmt(rule, 3)} − ${fmt(exact, 3)} = ${fmt(diff, 3)} percentage points`,
      ],
      note: `To double your money in ${fmt(y)} years you need about ${fmt(rule)}% a year by the Rule of 72. The exact rate is ${fmt(exact)}%. The rule works best for rates of roughly 6 to 10%.`,
    };
  },
  content: {
    formula: [
      'Years to double (Rule of 72) ≈ 72 ÷ annual rate in percent',
      'Rate needed (Rule of 72) ≈ 72 ÷ years to double',
      'Exact years to double = ln(2) ÷ ln(1 + rate)',
      'Exact rate needed = (2^(1 ÷ years) − 1) × 100',
    ],
    body: [
      'The Rule of 72 is a quick way to estimate how long it takes money to double. Divide 72 by the yearly rate of return in percent. At 8% a year, 72 ÷ 8 = 9 years. At 6% it is 12 years, and at 12% it is 6 years. You can do it in your head, which is the whole point.',
      'You can also run it the other way. If you want your money to double in 9 years, divide 72 by 9 and you get 8% a year. The calculator shows this in the second mode, together with the exact rate so you can see how close the shortcut gets.',
      'The rule is an approximation of compound growth. The exact doubling time is ln(2) ÷ ln(1 + rate). It matches the shortcut closely for rates of roughly 6 to 10%. At lower rates the rule runs a little short, and at higher rates it runs a little long. At 2% the rule says 36 years while the exact answer is about 35 years. At 12% it says 6 years against about 6.12 years exact.',
      'The rule assumes a steady rate, compounded once a year, with no extra deposits, fees or taxes. Real returns bounce around, so treat the answer as a rough guide. It also works for anything that grows by a fixed percentage, such as inflation: at 3% a year, prices double in about 24 years.',
    ],
    faq: [
      { q: 'How long does it take to double money at 8%?', a: 'The Rule of 72 gives 72 ÷ 8 = 9 years. The exact answer is about 9.006 years, so the shortcut is off by less than a day.' },
      { q: 'How accurate is the Rule of 72?', a: 'It is most accurate for rates of roughly 6 to 10%. At 6% it says 12 years against an exact 11.896. At 2% it says 36 years against an exact 35.003, and at 12% it says 6 years against 6.116.' },
      { q: 'What rate do I need to double my money in 9 years?', a: 'The rule gives 72 ÷ 9 = 8% a year. The exact rate is (2^(1/9) − 1) × 100, which is about 8.006% a year.' },
      { q: 'Why 72 and not 70 or 69?', a: '72 divides evenly by many numbers (2, 3, 4, 6, 8, 9, 12), so it is easy to use in your head, and it is accurate around the common 6 to 10% range. The most exact constant for very low rates is about 69.3, which is 100 × ln(2).' },
      { q: 'Does the Rule of 72 include extra deposits?', a: 'No. It assumes a single lump sum growing at a steady rate with no added deposits, fees or taxes. For regular contributions, use a compound interest or investment calculator.' },
    ],
    sources: [
      { label: 'Rule of 72 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Rule_of_72' },
      { label: 'Investor.gov: Compound interest calculator (SEC)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
    ],
  },
  related: ['compound-interest', 'investment', 'inflation', 'savings-goal'],
  examples: [
    {
      // 72 ÷ 8 = 9; exact ln2 ÷ ln1.08 = 0.693147 ÷ 0.076961 = 9.00647; difference 9 − 9.00647 = −0.00647.
      values: { mode: 'years', rate: 8 },
      expect: { yearsRule: 9, yearsExact: 9.00647, yearsDiff: -0.00647 },
      tolerance: 1e-4,
    },
    {
      // 72 ÷ 6 = 12; exact 0.693147 ÷ ln1.06 (0.058269) = 11.8957; difference 0.1043.
      values: { mode: 'years', rate: 6 },
      expect: { yearsRule: 12, yearsExact: 11.8957 },
      tolerance: 1e-3,
    },
    {
      // 72 ÷ 9 = 8; exact 2^(1/9) − 1 = 1.0800597 − 1 → 8.00597%; difference −0.00597.
      values: { mode: 'rate', years: 9 },
      expect: { rateRule: 8, rateExact: 8.00597, rateDiff: -0.00597 },
      tolerance: 1e-4,
    },
  ],
});

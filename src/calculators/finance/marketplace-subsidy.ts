import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'marketplace-subsidy',
  title: 'Marketplace Premium After Subsidy Calculator',
  category: 'finance',
  description: 'Estimate your health insurance premium after the marketplace subsidy: your expected contribution, the subsidy and your net monthly cost. Inputs are editable.',
  keywords: ['marketplace subsidy calculator', 'aca premium tax credit calculator', 'health insurance subsidy estimate', 'subsidy cliff 400% fpl', 'net premium after subsidy'],
  updated: '2026-11-24',
  inputs: [
    { id: 'income', label: 'Household income', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'Your expected modified adjusted gross income for the year.' },
    { id: 'fpl', label: 'Federal poverty level for your household size', type: 'number', prefix: '$', default: 15650, min: 1, step: 100, info: 'From the current HHS poverty guidelines table. Used only to show your income as a share of it.' },
    { id: 'percentage', label: 'Applicable percentage', type: 'number', suffix: '%', default: 4, min: 0, max: 100, step: 0.1, info: 'The share of income you are expected to pay. Take it from healthcare.gov or the current IRS table.' },
    { id: 'benchmark', label: 'Benchmark plan, yearly premium', type: 'number', prefix: '$', default: 9000, min: 0, step: 100, info: 'The second-lowest-cost silver plan in your area, for the year.' },
    { id: 'plan', label: 'Plan you would buy, yearly premium', type: 'number', prefix: '$', default: 8400, min: 0, step: 100, info: 'The full yearly premium of the plan you picked.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Your monthly premium', format: 'currency', primary: true, info: 'Net yearly premium ÷ 12.' },
    { id: 'net', label: 'Net yearly premium', format: 'currency', info: 'Chosen plan premium minus the subsidy, never below zero.' },
    { id: 'subsidy', label: 'Yearly subsidy', format: 'currency', info: 'Benchmark premium minus your expected contribution, never below zero.' },
    { id: 'contribution', label: 'Expected contribution', format: 'currency', info: 'Income × applicable percentage.' },
    { id: 'fplpct', label: 'Income as share of poverty level', format: 'percent', info: 'Income ÷ poverty level.' },
  ],
  compute: (v) => {
    const i = num(v.income), f = num(v.fpl), p = num(v.percentage), b = num(v.benchmark), c = num(v.plan);
    if ([i, f, p, b, c].some((x) => x === null)) return { monthly: null };
    if ([i, p, b, c].some((x) => (x as number) < 0) || (f as number) <= 0) return { monthly: null, error: 'Use positive values; income, premiums and the percentage cannot be negative.' };
    if ((p as number) > 100) return { monthly: null, error: 'The applicable percentage must be 100% or less.' };
    const contribution = (i as number) * (p as number) / 100;
    const subsidy = Math.max(0, (b as number) - contribution);
    const net = Math.max(0, (c as number) - subsidy);
    const monthly = net / 12;
    const fplpct = (i as number) / (f as number);
    const over = fplpct > 4;
    return {
      monthly, net, subsidy, contribution, fplpct,
      tone: subsidy > 0 ? 'good' : 'warn',
      badge: subsidy > 0 ? `${usd(monthly)} a month after a ${usd(subsidy)} subsidy` : 'No subsidy at these inputs',
      chart: {
        type: 'bar',
        title: 'Chosen plan: subsidy vs what you pay (yearly)',
        categories: ['Subsidy', 'You pay'],
        series: [{ name: 'Yearly', values: [Math.min(subsidy, c as number), net] }],
        format: { format: 'currency' },
      },
      steps: [
        `Expected contribution: ${usd(i as number)} × ${p}% = ${usd(contribution)}`,
        `Subsidy: ${usd(b as number)} − ${usd(contribution)} = ${usd(subsidy)} (not below zero)`,
        `Net premium: ${usd(c as number)} − ${usd(subsidy)} = ${usd(net)} (not below zero)`,
        `Monthly: ${usd(net)} ÷ 12 = ${usd(monthly)}`,
      ],
      note: (over ? `Your income is ${(fplpct * 100).toFixed(0)}% of the poverty level, above 400%. Whether subsidies reach that high depends on current law, so check healthcare.gov. ` : '') + 'The applicable percentage and poverty level are inputs because current-year figures were not checked here. Estimates only, not tax or insurance advice.',
    };
  },
  content: {
    formula: [
      'Expected contribution = income × applicable percentage',
      'Subsidy = max(0, benchmark premium − expected contribution)',
      'Net premium = max(0, chosen plan premium − subsidy)',
      'Monthly premium = net premium ÷ 12',
    ],
    body: [
      'The marketplace subsidy is built around a benchmark plan, the second-lowest-cost silver plan in your area. You are expected to pay a set share of your income toward it, and the subsidy covers the rest of the benchmark premium.',
      'The same subsidy applies to any plan you pick. Choose a plan cheaper than the benchmark and you keep the difference; choose a pricier one and you pay it on top.',
      'Enter your income, the applicable percentage for your income level, and the two premiums. The percentage and poverty level change every year, so take them from healthcare.gov.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'Income $50,000 at 4% gives a $2,000 contribution. Against a $9,000 benchmark the subsidy is $7,000. An $8,400 plan then costs $1,400 a year, or $116.67 a month.' },
      { q: 'What if I pick a pricier plan?', a: 'With a $9,600 plan and the same inputs, the subsidy is still $7,000, so you pay $2,600 a year, or $216.67 a month.' },
      { q: 'What if the subsidy is zero?', a: 'At $100,000 and 9.5%, the contribution is $9,500, above the $9,000 benchmark. The subsidy is $0 and you pay the full $8,400 for that plan.' },
      { q: 'What is the 400% line?', a: 'It is income at four times the poverty level. Eligibility above that line depends on current law, so the calculator flags it and leaves the answer to healthcare.gov.' },
    ],
    sources: [
      { label: 'HealthCare.gov: Premium tax credit', url: 'https://www.healthcare.gov/glossary/premium-tax-credit/' },
    ],
  },
  related: ['cobra-vs-marketplace', 'health-plan-comparison', 'hsa-fsa-savings'],
  examples: [
    // contribution 2000; subsidy 7000; net 1400; monthly 116.666..; 50000/15650
    { values: { income: 50000, fpl: 15650, percentage: 4, benchmark: 9000, plan: 8400 }, expect: { contribution: 2000, subsidy: 7000, net: 1400, monthly: 116.6667, fplpct: 50000 / 15650 }, tolerance: 0.01 },
    // plan 9600: net 2600; monthly 216.6667
    { values: { income: 50000, fpl: 15650, percentage: 4, benchmark: 9000, plan: 9600 }, expect: { subsidy: 7000, net: 2600, monthly: 216.6667 }, tolerance: 0.01 },
    // contribution 9500 > 9000 benchmark: subsidy 0; net = 8400
    { values: { income: 100000, fpl: 25000, percentage: 9.5, benchmark: 9000, plan: 8400 }, expect: { contribution: 9500, subsidy: 0, net: 8400, monthly: 700, fplpct: 4 }, tolerance: 0.01 },
  ],
});

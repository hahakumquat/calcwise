import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'solo-401k-sep-room',
  title: 'Solo 401(k) vs SEP-IRA Contribution Room',
  category: 'finance',
  description: 'Estimate how much you can put into a Solo 401(k) or a SEP-IRA from self-employed profit, after the self-employment tax deduction. Limits are editable.',
  keywords: ['solo 401k contribution calculator', 'sep ira contribution calculator', 'solo 401k vs sep ira', 'self employed retirement contribution limit', 'sep ira 20 percent self employed'],
  updated: '2026-11-24',
  inputs: [
    { id: 'profit', label: 'Net self-employment profit', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, info: 'Schedule C profit: income minus business expenses, before the SE tax deduction.' },
    { id: 'deferral', label: 'Employee deferral limit', type: 'number', prefix: '$', default: 24500, min: 0, step: 500, info: 'The yearly 401(k) salary-deferral limit for your age. Check the IRS page.' },
    { id: 'overall', label: 'Overall limit (employee + employer)', type: 'number', prefix: '$', default: 72000, min: 0, step: 1000, info: 'The yearly cap on total contributions to one plan. Check the IRS page.' },
    { id: 'wageBase', label: 'Social Security wage base', type: 'number', prefix: '$', default: 184500, min: 0, step: 500, info: 'Social Security tax applies only up to this amount of earnings. Check ssa.gov.' },
  ],
  outputs: [
    { id: 'solo', label: 'Solo 401(k) room', format: 'currency', primary: true, info: 'Employee deferral plus employer 20%, capped at the overall limit.' },
    { id: 'sep', label: 'SEP-IRA room', format: 'currency', info: '20% of net earnings, capped at the overall limit.' },
    { id: 'extra', label: 'Extra room with the Solo 401(k)', format: 'currency', info: 'Solo 401(k) room minus SEP-IRA room.' },
    { id: 'netEarn', label: 'Net earnings for the plan', format: 'currency', info: 'Profit minus half of the self-employment tax.' },
  ],
  compute: (v) => {
    const p = num(v.profit), d = num(v.deferral), o = num(v.overall), w = num(v.wageBase);
    if ([p, d, o, w].some((x) => x === null)) return { solo: null };
    if ([p, d, o, w].some((x) => (x as number) < 0)) return { solo: null, error: 'Values cannot be negative.' };
    const base = (p as number) * 0.9235;
    const ss = 0.124 * Math.min(base, w as number);
    const med = 0.029 * base;
    const se = ss + med;
    const net = (p as number) - se / 2;
    const employer = 0.2 * net;
    const defer = Math.min(d as number, net);
    const solo = Math.min(o as number, defer + employer);
    const sep = Math.min(o as number, employer);
    return {
      solo, sep, extra: solo - sep, netEarn: net,
      tone: 'good',
      badge: `Solo 401(k) ${usd(solo)} vs SEP-IRA ${usd(sep)}`,
      chart: {
        type: 'bar',
        title: 'Contribution room by plan',
        categories: ['SEP-IRA', 'Solo 401(k)'],
        series: [{ name: 'Room', values: [sep, solo] }],
        format: { format: 'currency' },
      },
      steps: [
        `Self-employment tax: ${usd(base)} × 12.4% (up to the wage base) + ${usd(base)} × 2.9% = ${usd(se)}`,
        `Net earnings: ${usd(p as number)} − ${usd(se / 2)} (half of SE tax) = ${usd(net)}`,
        `Employer part: 20% × ${usd(net)} = ${usd(employer)}`,
        `Solo 401(k): ${usd(defer)} deferral + ${usd(employer)} = ${usd(solo)} (cap ${usd(o as number)})`,
        `SEP-IRA: ${usd(sep)}`,
      ],
      note: 'This is a sole proprietor with no employees. It ignores the extra 0.9% Medicare tax, the plan compensation limit, catch-up contributions, Roth options and state rules. Limits change every year, so confirm them on irs.gov. This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'SE tax = 92.35% × profit × 12.4% (up to the wage base) + 92.35% × profit × 2.9%',
      'Net earnings = profit − SE tax ÷ 2',
      'SEP-IRA = min(overall limit, 20% × net earnings)',
      'Solo 401(k) = min(overall limit, min(deferral limit, net earnings) + 20% × net earnings)',
    ],
    body: [
      'If you work for yourself, a Solo 401(k) and a SEP-IRA both let you save for retirement from business profit. The SEP-IRA only has the employer part. The Solo 401(k) adds a salary deferral on top, so at lower profits it usually allows much more.',
      'For a sole proprietor the employer part is not 25% of profit. It is 20% of profit after deducting half the self-employment tax, which is why this calculator works out the SE tax first.',
      'Enter your profit and this year’s limits. The limits are editable because they change yearly.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'On $100,000 of profit, SE tax is $14,129.55 and net earnings are $92,935.23. The SEP-IRA allows 20% of that, $18,587.05. The Solo 401(k) adds the $24,500 deferral for $43,087.05, or $24,500.00 more.' },
      { q: 'Why is the SEP-IRA limit 20% and not 25%?', a: '25% applies to W-2 pay. For the self-employed, the plan uses net earnings after the SE tax deduction, which works out to 20% of that figure.' },
      { q: 'When is the SEP-IRA as good as a Solo 401(k)?', a: 'At high profit, once 20% of net earnings reaches the overall limit, both plans cap out at the same amount.' },
      { q: 'Does this cover employees?', a: 'No. Having employees changes the rules, and a SEP-IRA must cover eligible staff.' },
    ],
    sources: [
      { label: 'IRS: Retirement plans for self-employed people', url: 'https://www.irs.gov/retirement-plans/retirement-plans-for-self-employed-people' },
      { label: 'IRS: Self-employment tax', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
    ],
  },
  related: ['self-employment-tax', 'estimated-tax-safe-harbor', '401k-max-out'],
  examples: [
    // base 92350; SS 11451.40; Med 2678.15; SE 14129.55; net 100000-7064.775=92935.225; employer 18587.045; solo 24500+18587.045=43087.045
    { values: { profit: 100000, deferral: 24500, overall: 72000, wageBase: 184500 }, expect: { solo: 43087.045, sep: 18587.045, extra: 24500, netEarn: 92935.225 }, tolerance: 0.01 },
    // profit 0 -> all zero
    { values: { profit: 0, deferral: 24500, overall: 72000, wageBase: 184500 }, expect: { solo: 0, sep: 0, extra: 0, netEarn: 0 }, tolerance: 0.01 },
  ],
});

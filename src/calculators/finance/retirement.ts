import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, moneyDonut } from '../../lib/helpers/finance';
import { CATCHUP_401K, LIMIT_401K, money, TAX_YEAR } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'retirement',
  title: 'Retirement Calculator',
  category: 'finance',
  description: 'Project your 401(k) balance at retirement from your contributions, employer match, salary growth and investment return.',
  keywords: ['401k calculator', 'retirement savings', 'employer match', 'nest egg', '403b', 'retirement planning', '4% rule'],
  popular: true,
  inputs: [
    { id: 'age', label: 'Current age', type: 'number', suffix: 'years', default: 30, min: 0, max: 100, step: 1, info: 'Your age today, in whole years.' },
    { id: 'retireAge', label: 'Retirement age', type: 'number', suffix: 'years', default: 65, min: 0, max: 100, step: 1, info: 'The age you plan to stop working and start drawing on savings.' },
    { id: 'balance', label: 'Current balance', type: 'number', prefix: '$', default: 25000, min: 0, info: 'What is already in your 401(k) or similar account. Check your plan website or latest statement.' },
    { id: 'salary', label: 'Annual salary', type: 'number', prefix: '$', default: 75000, min: 0, step: 1000, info: 'Your current yearly salary before taxes, used to work out contributions.' },
    { id: 'contribution', label: 'Your contribution', type: 'number', suffix: '% of salary', default: 10, min: 0, max: 100, step: 0.5, info: 'The share of each paycheck you put into the plan. Shown on your payroll or plan enrollment page.' },
    { id: 'match', label: 'Employer match', type: 'number', suffix: '% of your contribution', default: 50, min: 0, step: 5, optional: true, info: 'How much your employer adds per dollar you contribute, e.g. 50 for a 50% match. Your benefits summary lists it.' },
    { id: 'matchLimit', label: 'Match applies up to', type: 'number', suffix: '% of salary', default: 6, min: 0, step: 0.5, optional: true, info: 'The maximum share of salary the employer will match, e.g. 6 for \'up to 6% of pay\'.' },
    { id: 'salaryGrowth', label: 'Annual raise', type: 'number', suffix: '%', default: 2, min: 0, step: 0.5, optional: true, info: 'Average yearly raise you expect. 2–3% roughly tracks inflation.' },
    { id: 'returnRate', label: 'Annual return', type: 'number', suffix: '%', default: 7, step: 0.1, info: 'Average yearly investment return you expect before retirement. 5–7% is a common planning range.' },
    { id: 'withdrawal', label: 'Withdrawal rate in retirement', type: 'number', suffix: '%', default: 4, min: 0, step: 0.1, optional: true, info: 'The share of the balance you plan to withdraw in your first retirement year. 4% is the well-known rule of thumb.' },
  ],
  outputs: [
    { id: 'total', label: 'Balance at retirement', format: 'currency', precision: 0, primary: true, info: 'Projected account balance on your retirement date, in future dollars.' },
    { id: 'yourContributions', label: 'Your contributions', format: 'currency', precision: 0, info: 'The total you put in from your paychecks, after any IRS limit caps.' },
    { id: 'employerContributions', label: 'Employer match', format: 'currency', precision: 0, info: 'The total your employer adds through matching — effectively free money.' },
    { id: 'growth', label: 'Investment growth', format: 'currency', precision: 0, info: 'Investment earnings on top of everything contributed.' },
    { id: 'income', label: 'Estimated annual retirement income', format: 'currency', precision: 0, info: 'A rough first-year income from the balance using your withdrawal rate, before taxes.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const retireAge = num(v.retireAge);
    const balance0 = num(v.balance) ?? 0;
    const salary0 = num(v.salary);
    const c = num(v.contribution);
    const R = num(v.returnRate);
    if (age === null || retireAge === null || salary0 === null || c === null || R === null) return { total: null };
    if (salary0 < 0 || c < 0 || balance0 < 0 || R <= -100) return { total: null };
    const years = Math.round(retireAge - age);
    if (years <= 0) return { total: null, error: 'Retirement age must be greater than your current age.' };
    const matchRate = (num(v.match) ?? 0) / 100;
    const matchCap = (num(v.matchLimit) ?? 0) / 100;
    const g = (num(v.salaryGrowth) ?? 0) / 100;
    const r = R / 100;
    let balance = balance0;
    let salary = salary0;
    let mine = 0;
    let employer = 0;
    let capped = false;
    let firstYou = 0;
    let firstMatch = 0;
    const ages = [age];
    const sYou = [balance0];
    const sEmp = [0];
    const sGrowth = [0];
    for (let i = 0; i < years; i++) {
      const limit = LIMIT_401K + (age + i >= 50 ? CATCHUP_401K : 0);
      let employee = (salary * c) / 100;
      if (employee > limit) {
        employee = limit;
        capped = true;
      }
      const match = matchRate * Math.min(employee, salary * matchCap);
      balance = balance * (1 + r) + employee + match; // contributions credited at year end
      if (i === 0) {
        firstYou = employee;
        firstMatch = match;
      }
      mine += employee;
      employer += match;
      salary *= 1 + g;
      ages.push(age + i + 1);
      sYou.push(balance0 + mine);
      sEmp.push(employer);
      sGrowth.push(Math.max(0, balance - balance0 - mine - employer));
    }
    const income = (balance * (num(v.withdrawal) ?? 0)) / 100;
    return {
      total: balance,
      yourContributions: mine,
      employerContributions: employer,
      growth: balance - balance0 - mine - employer,
      income,
      chart: [{ type: 'area', title: 'Balance by age', x: ages, xLabel: 'Age', yFormat: CURRENCY, stacked: true, series: [{ name: 'Your money', values: sYou }, { name: 'Employer match', values: sEmp }, { name: 'Growth', values: sGrowth }] }, moneyDonut('At retirement', [{ label: 'Your money', value: balance0 + mine }, { label: 'Employer match', value: employer }, { label: 'Growth', value: Math.max(0, balance - balance0 - mine - employer) }])],
      steps: [
        `${years} years of contributions, growing ${R}% a year`,
        `Year 1: you put in ${money(firstYou)}, your employer adds ${money(firstMatch)}`,
        `Each year: balance = balance × (1 + ${R}%) + contributions; salary rises ${g * 100}%`,
        `Retirement income ≈ ${money(balance, 0)} × ${num(v.withdrawal) ?? 0}% = ${money(income, 0)} a year`,
      ],
      note: capped
        ? `Your contribution was capped at the ${TAX_YEAR} IRS limit (${money(LIMIT_401K, 0)}, or ${money(LIMIT_401K + CATCHUP_401K, 0)} from age 50) in some years. Limits usually rise with inflation, so this is conservative.`
        : `Your balance is projected in future dollars. At 2.5% inflation, ${money(balance, 0)} in ${years} years buys about what ${money(balance / 1.025 ** years, 0)} buys today.`,
    };
  },
  content: {
    formula: [
      'Each year: B = B × (1 + r) + your contribution + match',
      'Match = match % × min(your contribution, match limit % × salary)',
      'Income ≈ final balance × withdrawal rate',
    ],
    body: [
      'This calculator projects a 401(k), 403(b) or similar workplace plan year by year. Each year you contribute a percentage of your salary, your employer adds its match, the whole balance earns the assumed return, and your salary rises by the raise you enter. Contributions are credited at the end of each year, which keeps the estimate slightly conservative.',
      `Employee contributions are capped at the ${TAX_YEAR} IRS elective-deferral limit of ${money(LIMIT_401K, 0)}, plus a ${money(CATCHUP_401K, 0)} catch-up from age 50. Workers aged 60–63 may be allowed a larger catch-up, and the limits rise with inflation in most years, so high savers may be able to put in more than shown.`,
      'A typical match is "50% of what you contribute, up to 6% of salary", which is worth 3% of pay. Contributing at least enough to get the full match is one of the highest-return moves available, because the match is an instant return on your money.',
      'The retirement income line uses a withdrawal rate. The well-known "4% rule" comes from research suggesting that withdrawing 4% of a balanced portfolio in the first year, then adjusting for inflation, has historically lasted about 30 years. It is a rule of thumb, not a guarantee.',
    ],
    faq: [
      { q: 'How much do I need to retire?', a: 'A common estimate is 25 times the yearly spending your portfolio must cover (the inverse of the 4% rule). Subtract expected Social Security and pensions from your spending first.' },
      { q: 'Is the result in today\'s dollars?', a: 'No — it is in future dollars. The note under the result shows roughly what it would be worth in today\'s money at 2.5% inflation. To plan in today\'s dollars, you can instead enter a real return (return minus inflation) and set the raise to your expected real raise.' },
      { q: 'What return should I use?', a: 'Many planners use 5–7% for a stock-heavy portfolio and lower for one with more bonds. Small changes compound over decades, so try a few values to see the range.' },
    ],
  },
  related: ['investment', 'compound-interest', 'take-home-pay', 'net-worth', 'inflation'],
  examples: [
    {
      values: { age: 64, retireAge: 65, balance: 100000, salary: 100000, contribution: 10, match: 50, matchLimit: 6, salaryGrowth: 0, returnRate: 5, withdrawal: 4 },
      expect: { total: 118000, employerContributions: 3000, income: 4720, growth: 5000 },
    },
    {
      values: { age: 40, retireAge: 42, balance: 0, salary: 50000, contribution: 10, match: 100, matchLimit: 4, salaryGrowth: 10, returnRate: 10, withdrawal: 4 },
      expect: { total: 15400, yourContributions: 10500, employerContributions: 4200 },
    },
    {
      values: { age: 40, retireAge: 41, balance: 0, salary: 300000, contribution: 20, match: 0, matchLimit: 0, salaryGrowth: 0, returnRate: 7, withdrawal: 4 },
      expect: { total: 24500 },
    },
  ],
});

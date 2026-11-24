import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'state-move-tax-savings',
  title: 'State Move Tax Savings Calculator',
  category: 'finance',
  description: 'Compare state income tax before and after a move, subtract any rent increase, and see what you really keep each year and how fast the move costs pay back.',
  keywords: ['moving to a no income tax state', 'state tax savings calculator', 'is moving to another state worth it', 'relocation tax calculator', 'remote work move savings'],
  updated: '2026-11-24',
  inputs: [
    { id: 'income', label: 'Annual income', type: 'number', prefix: '$', default: 120000, min: 0, step: 1000, info: 'Income taxed by your state each year.' },
    { id: 'oldRate', label: 'Current state and local income tax rate', type: 'number', suffix: '%', default: 6, min: 0, max: 30, step: 0.1, info: 'Effective rate: state tax paid divided by income, from last year\'s state return.' },
    { id: 'newRate', label: 'New state and local income tax rate', type: 'number', suffix: '%', default: 0, min: 0, max: 30, step: 0.1, info: 'Effective rate you expect there. Use 0 for a state with no income tax.' },
    { id: 'rentChange', label: 'Monthly rent or housing change', type: 'number', prefix: '$', default: 300, min: -100000, step: 50, info: 'New monthly housing cost minus the old one. Use a negative number if the new place is cheaper.' },
    { id: 'moveCost', label: 'One-off moving cost', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, optional: true, info: 'Movers, deposits, travel and anything else you pay once.' },
  ],
  outputs: [
    { id: 'net', label: 'Net gain a year', format: 'currency', primary: true, info: 'Tax saved minus the extra housing cost over 12 months. Negative means you lose money.' },
    { id: 'taxSaved', label: 'State tax saved a year', format: 'currency', info: 'Income × (current rate − new rate).' },
    { id: 'housing', label: 'Extra housing cost a year', format: 'currency', info: '12 × the monthly housing change. Negative means you save on housing.' },
    { id: 'perMonth', label: 'Net gain a month', format: 'currency', info: 'Net gain a year ÷ 12.' },
    { id: 'payback', label: 'Months to pay back the move', format: 'number', info: 'Moving cost ÷ net gain a month. Blank if the move never pays back.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const oldRate = num(v.oldRate);
    const newRate = num(v.newRate);
    const rent = num(v.rentChange);
    const move = v.moveCost === undefined || v.moveCost === '' ? 0 : num(v.moveCost);
    if (income === null || oldRate === null || newRate === null || rent === null || move === null) return { net: null };
    if (income < 0 || move < 0) return { net: null, error: 'Income and moving cost cannot be negative.' };
    if (oldRate < 0 || newRate < 0) return { net: null, error: 'Tax rates cannot be negative.' };
    const taxSaved = income * (oldRate - newRate) / 100;
    const housing = rent * 12;
    const net = taxSaved - housing;
    const perMonth = net / 12;
    const payback = move === 0 ? 0 : net > 0 ? move / perMonth : null;
    const good = net > 0;
    return {
      net, taxSaved, housing, perMonth, payback,
      tone: good ? 'good' : 'warn',
      badge: good
        ? (payback === 0 ? `Keep ${usd(net)} more a year` : `Keep ${usd(net)} more a year, paid back in ${payback!.toFixed(1)} months`)
        : `You would be ${usd(-net)} a year worse off`,
      chart: {
        type: 'bar',
        title: 'Per year: tax saved, housing, net',
        categories: ['Tax saved', 'Extra housing', 'Net gain'],
        series: [{ name: 'Per year', values: [taxSaved, housing, net] }],
        format: { format: 'currency' },
      },
      steps: [
        `Tax saved: ${usd(income)} × (${oldRate}% − ${newRate}%) = ${usd(taxSaved)} a year`,
        `Housing change: ${usd(rent)} × 12 = ${usd(housing)} a year`,
        `Net: ${usd(taxSaved)} − ${usd(housing)} = ${usd(net)} a year, ${usd(perMonth)} a month`,
        payback === null ? 'The move never pays back at this net figure.' : `Payback: ${usd(move)} ÷ ${usd(perMonth)} = ${payback.toFixed(1)} months`,
      ],
      note: 'Only state income tax and housing are compared. Sales tax, property tax, insurance, car costs, pay differences and federal tax are not modelled, and many states tax at brackets, so use your effective rate. This is a planning estimate, not tax advice.',
    };
  },
  content: {
    formula: [
      'Tax saved a year = income × (current rate − new rate)',
      'Housing change a year = 12 × monthly housing change',
      'Net gain a year = tax saved − housing change',
      'Payback months = moving cost ÷ (net gain ÷ 12), if the net gain is above 0',
    ],
    body: [
      'A state with no income tax sounds like a raise, but rent is often higher there. This calculator puts the tax saving and the housing change side by side so you see what is left.',
      'Use your effective state rate: the state tax on last year\'s return divided by your income. A top bracket rate overstates the saving. If your work moves with you, income stays the same; if not, change it to the new pay.',
      'The payback figure shows how many months of net gain it takes to cover the cost of moving. If the net gain is zero or negative, the move does not pay back on these numbers.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: '$120,000 at 6% versus 0% saves $7,200 a year in tax. Rent up $300 a month costs $3,600 a year. The net gain is $3,600 a year, or $300 a month, and a $4,000 move pays back in 13.3 months.' },
      { q: 'Which tax rate should I enter?', a: 'The effective rate from last year\'s state return: state income tax paid divided by income. Add local income tax if your city charges one.' },
      { q: 'What is not included?', a: 'Sales tax, property tax, car and insurance costs, pay differences, and federal tax are left out. Add any of them as housing change if they are a monthly cost.' },
      { q: 'What if the new place is cheaper?', a: 'Enter a negative housing change, for example −200. It adds to your net gain.' },
    ],
    sources: [],
  },
  related: ['net-to-gross', 'cost-of-living-salary', 'moving-cost'],
  examples: [
    // 120000*0.06=7200; 300*12=3600; net 3600; /12=300; 4000/300=13.333
    { values: { income: 120000, oldRate: 6, newRate: 0, rentChange: 300, moveCost: 4000 }, expect: { net: 3600, taxSaved: 7200, housing: 3600, perMonth: 300, payback: 13.3333 }, tolerance: 0.01 },
    // 80000*(5-3)%=1600; housing -100*12=-1200; net 2800; /12=233.33
    { values: { income: 80000, oldRate: 5, newRate: 3, rentChange: -100, moveCost: 0 }, expect: { net: 2800, taxSaved: 1600, housing: -1200, perMonth: 233.3333, payback: 0 }, tolerance: 0.01 },
  ],
});

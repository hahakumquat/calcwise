import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'cd-early-break',
  title: 'Break a CD Early or Wait? Penalty vs Higher Rate',
  category: 'finance',
  description: 'Should you pay the early-withdrawal penalty and move your CD money to a higher rate? Compare both paths and find the break-even point.',
  keywords: ['break a CD early', 'CD early withdrawal penalty', 'CD penalty calculator', 'break CD for higher rate', 'is it worth breaking a CD'],
  inputs: [
    { id: 'balance', label: 'Current CD balance', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'What the CD is worth today, including interest earned so far.' },
    { id: 'apy', label: 'Current CD APY', type: 'number', suffix: '%', default: 4, min: 0, max: 20, step: 0.05, info: 'The APY the CD is earning until it matures.' },
    { id: 'months', label: 'Months left on the CD', type: 'number', suffix: 'months', default: 12, min: 1, max: 120, step: 1, info: 'Months until the CD matures. The new account is assumed to be held for the same time.' },
    { id: 'penalty', label: 'Early-withdrawal penalty', type: 'number', suffix: 'months of interest', default: 3, min: 0, max: 60, step: 1, info: 'Check your CD agreement. Many banks charge 3 to 12 months of interest. Here it is charged at your current rate, as simple interest.' },
    { id: 'newApy', label: 'New account APY available now', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.05, info: 'The APY of the account or CD you would move the money to. Assumed fixed for the months left.' },
  ],
  outputs: [
    { id: 'advantage', label: 'Advantage of breaking the CD', format: 'currency', primary: true, info: 'Value if you break minus value if you wait, at the end of the months left. Positive means breaking wins, negative means waiting wins.' },
    { id: 'keep', label: 'Value if you keep the CD', format: 'currency', info: 'Balance grown at the current APY to maturity.' },
    { id: 'breakValue', label: 'Value if you break it', format: 'currency', info: 'Balance minus the penalty, grown at the new APY for the same number of months.' },
    { id: 'breakeven', label: 'Break-even months left', format: 'number', precision: 1, suffix: 'months', info: 'Breaking wins only if more months than this are left. Shown as a blank when breaking can never win.' },
  ],
  compute: (v) => {
    const bal = num(v.balance);
    const apyP = num(v.apy);
    const m = num(v.months);
    const pm = num(v.penalty);
    const newP = num(v.newApy);
    if (bal === null || apyP === null || m === null || pm === null || newP === null) return { advantage: null };
    if (bal <= 0 || apyP < 0 || m <= 0 || pm < 0 || newP < 0) return { advantage: null };
    const a = apyP / 100;
    const n = newP / 100;
    const penalty = bal * a * (pm / 12);
    if (penalty >= bal) return { advantage: null };
    const rest = bal - penalty;
    const keep = bal * (1 + a) ** (m / 12);
    const brk = rest * (1 + n) ** (m / 12);
    const adv = brk - keep;
    // Tie when rest x (1+n)^(t/12) = bal x (1+a)^(t/12)  =>  t = 12 ln(bal/rest) / ln((1+n)/(1+a))
    let be: number | null = null;
    if (n > a) be = penalty === 0 ? 0 : (12 * Math.log(bal / rest)) / Math.log((1 + n) / (1 + a));
    const win = adv > 0.005;
    const lose = adv < -0.005;
    const maxPts = Math.min(Math.ceil(m), 120);
    const xs = Array.from({ length: maxPts + 1 }, (_, i) => i);
    const at = (t: number) => Math.min(t, m);
    return {
      advantage: adv,
      keep,
      breakValue: brk,
      breakeven: be,
      tone: win ? 'good' : lose ? 'warn' : 'ok',
      badge: win ? 'Breaking wins' : lose ? 'Waiting wins' : 'Dead even',
      chart: {
        type: 'line',
        title: 'Value over the months left',
        x: xs,
        xLabel: 'Months from now',
        xFormat: { format: 'integer' },
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Keep the CD', values: xs.map((t) => bal * (1 + a) ** (at(t) / 12)) },
          { name: 'Break it', values: xs.map((t) => rest * (1 + n) ** (at(t) / 12)) },
        ],
      },
      steps: [
        `Penalty = ${money(bal)} × ${pct(a, 3)} × ${pm} ÷ 12 = ${money(penalty)} (simple interest at the current rate)`,
        `Keep: ${money(bal)} × (1 + ${pct(a, 3)})^(${m} ÷ 12) = ${money(keep)}`,
        `Break: (${money(bal)} − ${money(penalty)}) × (1 + ${pct(n, 3)})^(${m} ÷ 12) = ${money(brk)}`,
        `Advantage of breaking = ${money(brk)} − ${money(keep)} = ${money(adv)}`,
        be === null ? 'The new rate is not higher than the current one, so breaking can never catch up.' : `Break-even = 12 × ln(${money(bal)} ÷ ${money(rest)}) ÷ ln(${(1 + n).toFixed(4)} ÷ ${(1 + a).toFixed(4)}) = ${be.toFixed(1)} months`,
      ],
      note: 'Assumes the new rate is fixed for the months left, the penalty is charged as simple interest at your current rate, and taxes are ignored. Check your CD agreement for the exact penalty, which can also reach into principal.',
    };
  },
  content: {
    formula: [
      'Penalty = balance × current APY × penalty months ÷ 12',
      'Keep = balance × (1 + current APY)^(months left ÷ 12)',
      'Break = (balance − penalty) × (1 + new APY)^(months left ÷ 12)',
      'Break-even months = 12 × ln(balance ÷ (balance − penalty)) ÷ ln((1 + new APY) ÷ (1 + current APY))',
    ],
    body: [
      'Breaking a CD early costs a penalty, usually a number of months of interest. Moving the money to a higher rate earns more each month from then on. This calculator puts the two paths side by side over the months your CD still has left, so you can see whether the higher rate makes up for the penalty before maturity.',
      'The penalty is calculated as simple interest at your current rate, which is how many banks describe it. Breaking then starts you from the balance minus that penalty. The remainder grows at the new APY for the same number of months. Keeping the CD simply grows the full balance at the current APY.',
      'The break-even figure is the number of months left at which both paths end up equal. If your CD has more months left than that, breaking wins, and the more months left, the bigger the gap. If it has fewer, waiting wins. When the new rate is not higher than the current one, there is no break-even and breaking can never win.',
      'Real life adds wrinkles. Some banks charge a flat amount or can dip into principal, rates on the new account may change, and interest is generally taxable. Read your CD agreement and the new account\'s terms before you move any money.',
    ],
    faq: [
      { q: 'How is the penalty calculated here?', a: 'Penalty = balance × current APY × penalty months ÷ 12, which is simple interest at your current rate. With the defaults, $10,000 at 4% with a 3-month penalty costs $100.' },
      { q: 'What does break-even months mean?', a: 'It is the months left at which keeping and breaking end up with the same money. With more months left than that, breaking wins. With the defaults it is about 12.6 months, so a CD with 12 months left is just short and waiting wins by a few dollars.' },
      { q: 'What if the new rate is lower or the same?', a: 'Breaking can never win. You would pay a penalty and then earn the same or less, so the break-even is blank and the advantage is negative.' },
      { q: 'Does this include taxes?', a: 'No. Interest is generally taxable either way, and a higher rate means somewhat more tax, so the real gain from breaking is a little smaller than shown.' },
      { q: 'Is the penalty ever bigger than interest earned?', a: 'It can be. If you break early in the term, the penalty can exceed interest earned so far and take some principal. This tool deducts the penalty from your balance in all cases.' },
    ],
    sources: [
      { label: 'CFPB: What is an early withdrawal penalty on a CD?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-certificate-of-deposit-cd-en-1395/' },
      { label: 'Investor.gov: Certificates of deposit', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/certificates-deposit-cds' },
    ],
  },
  related: ['cd', 'cd-ladder', 'savings-account-switch', 'apy-calculator'],
  examples: [
    // Defaults: keep 10000 x 1.04 = 10400. Penalty 10000 x 0.04 x 3/12 = 100. Break 9900 x 1.05 = 10395. Advantage -5.
    // Break-even = 12 ln(10000/9900) / ln(1.05/1.04) = 12 x 0.0100503 / 0.0095694 = 12.60 months.
    { values: { balance: 10000, apy: 4, months: 12, penalty: 3, newApy: 5 }, expect: { advantage: -5, keep: 10400, breakValue: 10395, breakeven: 12.603024984241076 } },
    // 20000 at 3%, 24 months, 6-month penalty, new 5%: keep 20000 x 1.0609 = 21218. Penalty 20000 x 0.03 x 6/12 = 300.
    // Break 19700 x 1.1025 = 21719.25. Advantage 501.25.
    { values: { balance: 20000, apy: 3, months: 24, penalty: 6, newApy: 5 }, expect: { advantage: 501.25, keep: 21218, breakValue: 21719.25 } },
  ],
});

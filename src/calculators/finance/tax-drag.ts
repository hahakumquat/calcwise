import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Future value of a starting balance plus end-of-year contributions at annual rate r (percent).
function fv(balance: number, contrib: number, r: number, years: number): number {
  const i = r / 100;
  const g = Math.pow(1 + i, years);
  const annuity = i === 0 ? contrib * years : (contrib * (g - 1)) / i;
  return balance * g + annuity;
}

export default defineCalculator({
  slug: 'tax-drag',
  title: 'Tax Drag Calculator: Taxable vs IRA',
  category: 'finance',
  description: 'See how yearly tax on dividends and distributions slows a taxable account, and the dollar gap versus a Roth-style tax-advantaged account over time.',
  keywords: ['tax drag calculator', 'taxable vs tax advantaged account', 'tax drag on investments', 'should i max ira before taxable', 'roth vs taxable brokerage', 'dividend tax drag'],
  updated: '2026-11-23',
  inputs: [
    { id: 'balance', label: 'Starting balance', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'What you invest today.' },
    { id: 'contrib', label: 'Contribution each year', type: 'number', prefix: '$', default: 0, min: 0, step: 500, info: 'Added at the end of each year. Leave at 0 for a one-time investment.' },
    { id: 'years', label: 'Years invested', type: 'number', suffix: 'years', default: 30, min: 1, max: 60, step: 1, info: 'How long the money stays invested.' },
    { id: 'ret', label: 'Return before tax', type: 'number', suffix: '%', default: 7, min: -50, max: 50, step: 0.5, info: 'An assumption, not a forecast. The same return applies to both accounts before tax.' },
    { id: 'drag', label: 'Yearly tax drag', type: 'number', suffix: 'points', default: 0.5, min: 0, max: 10, step: 0.1, info: 'Return lost each year to tax on dividends and distributions, in percentage points. Your own estimate: it depends on your funds and your tax rate.' },
    { id: 'rate', label: 'Tax rate on gains at the end', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'The capital gains rate you would pay when you sell the taxable account.' },
  ],
  outputs: [
    { id: 'gap', label: 'Advantage of the tax-advantaged account', format: 'currency', primary: true, info: 'Tax-advantaged balance minus the taxable balance after tax at the end.' },
    { id: 'advantaged', label: 'Tax-advantaged balance', format: 'currency', info: 'Grown at the full return, with no tax when you withdraw (Roth-style).' },
    { id: 'taxableBefore', label: 'Taxable balance before final tax', format: 'currency', info: 'Grown at the return minus the yearly tax drag.' },
    { id: 'endTax', label: 'Tax when you sell', format: 'currency', info: 'Tax rate × (balance − money you put in).' },
    { id: 'taxableAfter', label: 'Taxable balance after tax', format: 'currency', info: 'What is left after paying tax on the gain.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const contrib = num(v.contrib) ?? 0;
    const years = num(v.years);
    const ret = num(v.ret);
    const drag = num(v.drag);
    const rate = num(v.rate);
    if (balance === null || years === null || ret === null || drag === null || rate === null) return { gap: null };
    if (balance < 0 || contrib < 0 || drag < 0 || rate < 0) return { gap: null, error: 'Values cannot be negative.' };
    if (years < 1) return { gap: null, error: 'Enter at least 1 year.' };
    if (rate > 100) return { gap: null, error: 'The tax rate cannot be above 100%.' };
    if (ret - drag <= -100) return { gap: null, error: 'The return after drag must be above -100%.' };
    if (balance === 0 && contrib === 0) return { gap: null, note: 'Enter a balance or a yearly contribution to see the result.' };
    const advantaged = fv(balance, contrib, ret, years);
    const taxableBefore = fv(balance, contrib, ret - drag, years);
    const invested = balance + contrib * years;
    const endTax = Math.max(0, taxableBefore - invested) * (rate / 100);
    const taxableAfter = taxableBefore - endTax;
    const gap = advantaged - taxableAfter;
    return {
      gap,
      advantaged,
      taxableBefore,
      endTax,
      taxableAfter,
      tone: gap > 0.005 ? 'good' : 'ok',
      badge: gap > 0.005 ? 'Tax-advantaged account comes out ahead' : 'No difference',
      chart: {
        type: 'bar',
        title: 'Balance after ' + years + ' years',
        categories: ['Tax-advantaged', 'Taxable, after tax'],
        series: [{ name: 'Balance', values: [advantaged, taxableAfter] }],
        format: { format: 'currency' },
      },
      steps: [
        `Tax-advantaged: grown at ${ret}% for ${years} years = ${usd(advantaged)}`,
        `Taxable before final tax: grown at ${ret}% − ${drag} = ${+(ret - drag).toFixed(4)}% = ${usd(taxableBefore)}`,
        `Tax on the gain: ${rate}% × (${usd(taxableBefore)} − ${usd(invested)}) = ${usd(endTax)}`,
        `Taxable after tax: ${usd(taxableBefore)} − ${usd(endTax)} = ${usd(taxableAfter)}`,
        `Gap: ${usd(advantaged)} − ${usd(taxableAfter)} = ${usd(gap)}`,
      ],
      note: 'The tax drag and the final tax rate are your own estimates. Taxing the whole gain over the money you put in overstates the final tax, because reinvested distributions you already paid tax on add to your cost basis. Tax-advantaged is modelled Roth-style (no tax on withdrawal); a traditional account would also deduct contributions and tax withdrawals, which is not computed. Contribution limits and eligibility are not computed.',
    };
  },
  content: {
    formula: [
      'Balance = start × (1 + r)^years + yearly contribution × ((1 + r)^years − 1) ÷ r',
      'Tax-advantaged uses r = the return before tax',
      'Taxable uses r = the return before tax − yearly tax drag',
      'Final tax = tax rate × (taxable balance − money you put in)',
    ],
    body: [
      'In a taxable brokerage account, dividends and fund distributions are taxed every year even if you never sell. That tax comes out of the money that would otherwise keep compounding, which is why it is called tax drag. In a Roth IRA or similar account, nothing is taxed along the way.',
      'This calculator gives you the dollar gap. You enter the return, your own estimate of the yearly drag in percentage points, and the tax rate on gains when you eventually sell. A half point of drag sounds small, but over 30 years it compounds into a gap of thousands of dollars on a small balance.',
      'Use it for the year-end question of whether to fill an IRA or 401(k) before investing in a taxable account. Drag depends on what you hold: broad index funds that rarely distribute gains lose less than funds that trade often or pay high dividends.',
      'The final tax here is simplified. Because you pay tax on distributions each year, your cost basis rises, so the real tax at the end is lower than shown. Contribution limits, income limits and the deduction on a traditional account are not computed.',
    ],
    faq: [
      { q: 'What is tax drag?', a: 'It is the return lost each year to tax on dividends and fund distributions in a taxable account. Enter it in percentage points: 0.5 means a 7% return behaves like 6.5% each year.' },
      { q: 'How much does tax drag cost over 30 years?', a: 'With $10,000, 7% return, 0.5 points of drag and a 15% tax at the end, the tax-advantaged account reaches $76,122.55 and the taxable account ends with $57,722.11 after tax, a gap of $18,400.44.' },
      { q: 'What tax drag should I use?', a: 'There is no single figure. Broad index funds often lose well under half a point; actively traded or high-dividend funds can lose more. Use your fund\'s tax-cost ratio if it publishes one, or try a few values.' },
      { q: 'Why is the final tax overstated?', a: 'Tax paid on reinvested distributions raises your cost basis, so you owe tax on less gain than the balance minus contributions. The result is a slight overstatement of the taxable account\'s tax, so the true gap is a little smaller.' },
      { q: 'Should I max out my IRA before a taxable account?', a: 'Usually the tax-advantaged account wins on tax alone, but liquidity, withdrawal rules and employer match matter too. This calculator only measures the tax gap.' },
    ],
    sources: [
      { label: 'IRS: Roth IRAs', url: 'https://www.irs.gov/retirement-plans/roth-iras' },
      { label: 'IRS Topic 409: Capital gains and losses', url: 'https://www.irs.gov/taxtopics/tc409' },
    ],
  },
  related: ['roth-vs-traditional', 'investment-fee-drag', 'roth-conversion'],
  examples: [
    // 1.07^30 = 7.6122550; 1.065^30 = 6.6143663; tax = 0.15 × 56143.663 = 8421.549; after 57722.114; gap 18400.44
    { values: { balance: 10000, contrib: 0, years: 30, ret: 7, drag: 0.5, rate: 15 }, expect: { advantaged: 76122.55, taxableBefore: 66143.66, endTax: 8421.55, taxableAfter: 57722.11, gap: 18400.44 }, tolerance: 0.05 },
    // zero drag, zero rate: gap = 0 (1.05^2 = 1.1025 × 1000 = 1102.5)
    { values: { balance: 1000, contrib: 0, years: 2, ret: 5, drag: 0, rate: 0 }, expect: { advantaged: 1102.5, taxableAfter: 1102.5, gap: 0 }, tolerance: 1e-6 },
    // contributions: 1000/yr, 2 years, 10%: 1000×1.1 + 1000 = 2100; drag 0, rate 20: tax 0.2×(2100−2000)=20; after 2080; gap 20
    { values: { balance: 0, contrib: 1000, years: 2, ret: 10, drag: 0, rate: 20 }, expect: { advantaged: 2100, endTax: 20, taxableAfter: 2080, gap: 20 }, tolerance: 1e-6 },
  ],
});

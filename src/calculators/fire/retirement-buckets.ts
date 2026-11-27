import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'retirement-buckets',
  title: 'Retirement Cash and Bond Buckets Calculator',
  seoTitle: 'Retirement Bucket Strategy Calculator',
  metaDescription: 'Size a cash bucket and a bond bucket from your yearly spending, and see how much of your portfolio is left for stocks. Plain arithmetic, no sign-up.',
  updated: '2026-11-28',
  category: 'fire',
  description: 'Split a retirement portfolio into a cash bucket, a bond bucket and the stock remainder, based on years of spending.',
  keywords: ['retirement bucket strategy calculator', 'cash bucket retirement', 'bond bucket', 'how much cash to hold in retirement', 'years of expenses in cash', 'sequence of returns buffer'],
  popular: false,
  inputs: [
    { id: 'spending', label: 'Annual spending', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'What you expect to withdraw from the portfolio each year.' },
    { id: 'cashYears', label: 'Years of spending in cash', type: 'number', default: 2, min: 0, max: 30, step: 0.5, info: 'The cash bucket: savings or money market, spent first.' },
    { id: 'bondYears', label: 'Years of spending in bonds', type: 'number', default: 5, min: 0, max: 30, step: 0.5, info: 'The bond bucket: refills cash when stocks are down.' },
    { id: 'portfolio', label: 'Total portfolio', type: 'number', prefix: '$', default: 1000000, min: 0, step: 10000, info: 'Everything you have invested and saved for retirement.' },
  ],
  outputs: [
    { id: 'equity', label: 'Left for stocks', format: 'currency', precision: 0, primary: true, info: 'Portfolio minus the cash and bond buckets.' },
    { id: 'cash', label: 'Cash bucket', format: 'currency', precision: 0, info: 'Annual spending × years in cash.' },
    { id: 'bonds', label: 'Bond bucket', format: 'currency', precision: 0, info: 'Annual spending × years in bonds.' },
    { id: 'equityPct', label: 'Stocks share of portfolio', format: 'percent', precision: 1, info: 'Left for stocks ÷ portfolio.' },
    { id: 'safePct', label: 'Cash and bonds share', format: 'percent', precision: 1, info: '(Cash + bonds) ÷ portfolio.' },
  ],
  compute: (v) => {
    const s = num(v.spending);
    const cy = num(v.cashYears);
    const by = num(v.bondYears);
    const p = num(v.portfolio);
    if (s === null || cy === null || by === null || p === null) return { equity: null };
    if (s < 0 || cy < 0 || by < 0 || p < 0) return { equity: null, error: 'Values cannot be negative.' };
    if (p === 0) return { equity: null, error: 'Enter a portfolio above $0.' };
    const cash = s * cy;
    const bonds = s * by;
    const safe = cash + bonds;
    if (safe > p) {
      return { equity: null, error: `Cash and bonds need ${money(safe, 0)}, more than your ${money(p, 0)} portfolio. Lower the years or spending.` };
    }
    const equity = p - safe;
    const equityPct = equity / p;
    const safePct = safe / p;
    return {
      equity,
      cash,
      bonds,
      equityPct,
      safePct,
      tone: 'ok',
      badge: `${(equityPct * 100).toFixed(1)}% in stocks`,
      chart: {
        type: 'donut',
        title: 'Your three buckets',
        format: CURRENCY,
        slices: [
          { label: 'Cash', value: Math.round(cash) },
          { label: 'Bonds', value: Math.round(bonds) },
          { label: 'Stocks', value: Math.round(equity) },
        ],
        centerValue: `${(equityPct * 100).toFixed(0)}%`,
        centerLabel: 'stocks',
      },
      steps: [
        `Cash = ${money(s, 0)} × ${cy} years = ${money(cash, 0)}`,
        `Bonds = ${money(s, 0)} × ${by} years = ${money(bonds, 0)}`,
        `Stocks = ${money(p, 0)} − ${money(cash, 0)} − ${money(bonds, 0)} = ${money(equity, 0)}`,
      ],
      note: `${money(safe, 0)} (${(safePct * 100).toFixed(1)}%) sits in cash and bonds, enough to cover ${cy + by} years of spending without selling stocks. This is a sizing tool, not advice: the right mix depends on your situation.`,
    };
  },
  content: {
    formula: [
      'Cash bucket = annual spending × years held in cash',
      'Bond bucket = annual spending × years held in bonds',
      'Stocks = portfolio − cash bucket − bond bucket',
    ],
    body: [
      'A bucket strategy keeps the next few years of spending in safe assets, so a stock market drop does not force you to sell stocks at a low. This calculator sizes the buckets from your yearly spending and shows how much of the portfolio is left for stocks.',
      'With $50,000 of annual spending, 2 years in cash and 5 years in bonds, the cash bucket is $100,000 and the bond bucket is $250,000. In a $1,000,000 portfolio that leaves $650,000, or 65%, for stocks.',
    ],
    sections: [
      {
        heading: 'There is no standard number of years',
        paragraphs: [
          'Two years of cash and five of bonds is a common example, not a rule. More safe assets mean less stress in a downturn but usually lower long-run growth, and holding a lot of cash can leave you short against inflation. Pick years you can defend for your own plan.',
        ],
      },
    ],
    faq: [
      { q: 'How much cash should I hold in retirement?', a: 'There is no single answer. Many people hold one to three years of spending. At $50,000 a year, 2 years is $100,000.' },
      { q: 'How is the stock share calculated?', a: 'Portfolio minus the cash and bond buckets, divided by the portfolio. For $650,000 of stocks in $1,000,000, that is 65%.' },
      { q: 'What if the buckets are bigger than my portfolio?', a: 'The calculator shows a message instead of a result. Lower the years held in cash or bonds, or the spending.' },
      { q: 'Does this predict returns?', a: 'No. It only does the sizing arithmetic. It does not model returns, taxes or inflation.' },
    ],
    sources: [],
  },
  related: ['safe-withdrawal-rate', 'how-long-will-money-last', 'fire-number', 'years-to-fi'],
  examples: [
    // cash 50000*2=100000; bonds 50000*5=250000; stocks 1e6-350000=650000; 65%; 35%
    { values: { spending: 50000, cashYears: 2, bondYears: 5, portfolio: 1000000 }, expect: { cash: 100000, bonds: 250000, equity: 650000, equityPct: 0.65, safePct: 0.35 }, tolerance: 0.0001 },
  ],
});

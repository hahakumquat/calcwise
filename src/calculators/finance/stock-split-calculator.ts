import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'stock-split-calculator',
  title: 'Stock Split Calculator',
  category: 'finance',
  description: 'See your new share count, new price per share and cost basis after a forward or reverse stock split, including cash paid for fractional shares.',
  keywords: ['stock split calculator', 'reverse stock split calculator', 'how many shares after split', 'split adjusted price', 'fractional shares after reverse split'],
  updated: '2026-11-18',
  inputs: [
    { id: 'shares', label: 'Shares you own', type: 'number', default: 100, min: 0, step: 1, info: 'Shares held before the split.' },
    { id: 'price', label: 'Price per share before', type: 'number', prefix: '$', default: 200, min: 0, step: 0.5, info: 'Price just before the split takes effect.' },
    { id: 'basis', label: 'Your cost per share', type: 'number', prefix: '$', default: 120, min: 0, step: 0.5, info: 'What you paid per share on average. Leave at 0 to skip cost basis.' },
    { id: 'to', label: 'Split: new shares', type: 'number', default: 4, min: 0, step: 1, info: 'In a 4-for-1 split this is 4. In a 1-for-10 reverse split this is 1.' },
    { id: 'from', label: 'for every old shares', type: 'number', default: 1, min: 0, step: 1, info: 'In a 4-for-1 split this is 1. In a 1-for-10 reverse split this is 10.' },
  ],
  outputs: [
    { id: 'newShares', label: 'Shares after split', format: 'number', precision: 4, primary: true, info: 'Shares × new ÷ old, before any fractional share is paid out in cash.' },
    { id: 'newPrice', label: 'Price per share after', format: 'currency', precision: 2, info: 'Price × old ÷ new. The company is worth the same, so each share is worth proportionally more or less.' },
    { id: 'newBasis', label: 'Cost per share after', format: 'currency', precision: 2, info: 'Your cost per share × old ÷ new. Your total cost does not change.' },
    { id: 'whole', label: 'Whole shares you keep', format: 'number', info: 'Whole shares. Brokers usually cash out any fraction.' },
    { id: 'cash', label: 'Cash for the fraction', format: 'currency', precision: 2, info: 'Fractional share × new price. Brokers may pay this "cash in lieu" and it can be taxable.' },
    { id: 'value', label: 'Position value', format: 'currency', precision: 2, info: 'Whole shares × new price + cash. Equals the value before the split.' },
  ],
  compute: (v) => {
    const sh = num(v.shares) ?? 0, p = num(v.price) ?? 0, b = num(v.basis) ?? 0;
    const to = num(v.to) ?? 0, from = num(v.from) ?? 0;
    if (sh < 0 || p < 0 || b < 0) return { newShares: null, error: 'Shares and prices cannot be negative.' };
    if (to <= 0 || from <= 0) return { newShares: null, error: 'Enter a split ratio above zero, such as 4 for 1.' };
    const ratio = to / from;
    const newShares = sh * ratio;
    const newPrice = p / ratio;
    const newBasis = b / ratio;
    const whole = Math.floor(newShares + 1e-9);
    const frac = Math.max(0, newShares - whole);
    const cash = frac * newPrice;
    const value = whole * newPrice + cash;
    const kind = ratio >= 1 ? 'forward split' : 'reverse split';
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Price per share',
      categories: ['Before', 'After'],
      series: [{ name: 'Price', values: [p, Math.round(newPrice * 100) / 100] }],
      format: { format: 'currency' },
      highlight: 1,
    };
    return {
      chart,
      newShares,
      newPrice,
      newBasis,
      whole,
      cash,
      value,
      note: `A ${to}-for-${from} ${kind} changes the number of shares and the price, not what your position is worth. Cash for fractions can be taxable; this is not tax advice.`,
      steps: [
        `Ratio = ${to} ÷ ${from} = ${Math.round(ratio * 1e6) / 1e6}`,
        `New shares = ${sh} × ${Math.round(ratio * 1e6) / 1e6} = ${Math.round(newShares * 1e4) / 1e4}`,
        `New price = ${money(p, 2)} ÷ ${Math.round(ratio * 1e6) / 1e6} = ${money(newPrice, 2)}`,
      ],
    };
  },
  content: {
    formula: ['Ratio r = new shares ÷ old shares (4-for-1 → 4; 1-for-10 → 0.1)', 'New shares = shares × r; new price = price ÷ r; new cost per share = cost ÷ r'],
    body: [
      'A stock split changes how many shares exist without changing the company\'s value. In a forward split such as 4-for-1, you get more shares and each is worth less. In a reverse split such as 1-for-10, you get fewer shares and each is worth more.',
      'Your total cost basis stays the same, but it is spread across the new share count, so cost per share is divided by the ratio. Reverse splits often leave a fraction of a share, which brokers commonly pay out in cash.',
      'This is a quick calculator, not tax advice. How your broker handles fractions and reports them can vary.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['You own 100 shares at $200 and the company does a 4-for-1 split. You now hold 400 shares at $50, and a $120 cost per share becomes $30. Your position is $20,000 before and after. In a 1-for-10 reverse split, 25 shares at $2 become 2.5 shares at $20: you keep 2 shares and receive cash for the half share, $10.'],
      },
    ],
    faq: [
      { q: 'How many shares will I have after a stock split?', a: 'Multiply your shares by new ÷ old. For a 4-for-1 split, 100 shares become 400. For a 3-for-2 split, 100 shares become 150.' },
      { q: 'Does a stock split change what I own?', a: 'No. The number of shares and the price change in opposite directions, so the value of your position stays the same. 100 shares at $200 become 400 shares at $50, both worth $20,000.' },
      { q: 'What happens to fractional shares in a reverse split?', a: 'Many brokers pay cash for the fraction. 2.5 shares at $20 leaves 2 whole shares and $10 in cash. Policies differ, so check with your broker.' },
      { q: 'How do I enter a reverse split?', a: 'Put the new shares first. For a 1-for-10 reverse split, enter 1 in "new shares" and 10 in "for every old shares".' },
    ],
    sources: [{ label: 'SEC Investor.gov: Stock splits', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/stock-split' }],
  },
  related: ['average-cost-basis', 'stock-profit-calculator', 'roi'],
  examples: [
    // 100*4=400; 200/4=50; 120/4=30; whole 400; cash 0; value 20000
    { values: { shares: 100, price: 200, basis: 120, to: 4, from: 1 }, expect: { newShares: 400, newPrice: 50, newBasis: 30, whole: 400, cash: 0, value: 20000 } },
    // 25*0.1=2.5; 2/0.1=20; 2 whole; cash .5*20=10; value 2*20+10=50
    { values: { shares: 25, price: 2, basis: 1, to: 1, from: 10 }, expect: { newShares: 2.5, newPrice: 20, newBasis: 10, whole: 2, cash: 10, value: 50 } },
  ],
});

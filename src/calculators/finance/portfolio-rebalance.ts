import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const ASSETS = [
  { id: 'a1', label: 'Stocks', value: 70000, target: 60 },
  { id: 'a2', label: 'Bonds', value: 20000, target: 30 },
  { id: 'a3', label: 'Real estate or other', value: 5000, target: 5 },
  { id: 'a4', label: 'Cash', value: 5000, target: 5 },
];

export default defineCalculator({
  slug: 'portfolio-rebalance',
  title: 'Portfolio Rebalance Calculator',
  seoTitle: 'Portfolio Rebalance Calculator',
  metaDescription: 'Enter what you hold and your target mix to see how far each part has drifted and exactly how much to buy or sell, with or without new cash.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'See how far your portfolio has drifted from your target mix and how much to buy or sell in each holding, either by trading or by adding new money only.',
  keywords: ['portfolio rebalance calculator', 'rebalance portfolio', 'asset allocation calculator', 'how much to buy and sell to rebalance', 'rebalance with new contributions'],
  popular: false,
  inputs: [
    ...ASSETS.flatMap((a) => [
      { id: `${a.id}v`, label: `${a.label}: current value`, type: 'number' as const, prefix: '$', default: a.value, min: 0, step: 500, info: 'What this holding is worth today.' },
      { id: `${a.id}t`, label: `${a.label}: target (%)`, type: 'number' as const, suffix: '%', default: a.target, min: 0, max: 100, step: 1, info: 'The share of the portfolio you want. The four targets must add up to 100.' },
    ]),
    { id: 'cash', label: 'New money to add', type: 'number', prefix: '$', default: 0, min: 0, step: 500, info: 'Optional fresh money you will invest. Enter 0 to rebalance with what you already hold.' },
    {
      id: 'mode', label: 'How to rebalance', type: 'select', segmented: true, default: 'trade',
      options: [{ value: 'trade', label: 'Buy and sell' }, { value: 'buy', label: 'Buy only' }],
      info: 'Buy and sell reaches the target exactly. Buy only uses the new money on the holdings that are below target and never sells.',
    },
  ],
  outputs: [
    { id: 'turnover', label: 'Total to buy', format: 'currency', primary: true, info: 'The sum of all purchases.' },
    { id: 'sells', label: 'Total to sell', format: 'currency', info: 'The sum of all sales. Zero in buy-only mode.' },
    ...ASSETS.map((a) => ({ id: `${a.id}x`, label: `${a.label}: buy (+) or sell (-)`, format: 'currency' as const, info: 'Target value minus current value (buy and sell), or this holding\'s share of the new money (buy only).' })),
    { id: 'drift', label: 'Largest drift today', format: 'number', precision: 1, suffix: ' pts', info: 'The biggest gap between a holding\'s current share and its target, in percentage points.' },
    { id: 'total', label: 'Portfolio after', format: 'currency', info: 'Current total plus new money.' },
  ],
  compute: (v) => {
    const cur = ASSETS.map((a) => num(v[`${a.id}v`]));
    const tgt = ASSETS.map((a) => num(v[`${a.id}t`]));
    const cash = num(v.cash);
    const mode = String(v.mode ?? 'trade');
    if ([...cur, ...tgt, cash].some((x) => x === null)) return { turnover: null };
    const c = cur as number[], t = tgt as number[], n = cash as number;
    if ([...c, ...t, n].some((x) => x < 0)) return { turnover: null, error: 'Values cannot be negative.' };
    const sum = t.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 1e-9) return { turnover: null, error: `The four targets add up to ${+sum.toFixed(2)}%. They need to add up to 100%.` };
    const total = c.reduce((a, b) => a + b, 0);
    if (total + n <= 0) return { turnover: null, error: 'Enter at least one holding or some new money.' };
    const after = total + n;
    const targetVal = t.map((p) => (after * p) / 100);
    let trades: number[];
    if (mode === 'buy') {
      const def = targetVal.map((tv, i) => Math.max(tv - c[i], 0));
      const D = def.reduce((a, b) => a + b, 0);
      if (n === 0 || D === 0) trades = c.map(() => 0);
      else if (n >= D) trades = def.map((d, i) => d + ((n - D) * t[i]) / 100);
      else trades = def.map((d) => (n * d) / D);
    } else {
      trades = targetVal.map((tv, i) => tv - c[i]);
    }
    const buys = trades.filter((x) => x > 0).reduce((a, b) => a + b, 0);
    const sells = -trades.filter((x) => x < 0).reduce((a, b) => a + b, 0);
    const drift = total > 0 ? Math.max(...c.map((x, i) => Math.abs((x / total) * 100 - t[i]))) : 0;
    const out: Record<string, any> = { turnover: buys, sells, drift, total: after };
    ASSETS.forEach((a, i) => { out[`${a.id}x`] = trades[i]; });
    const newVal = c.map((x, i) => x + trades[i]);
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Share of portfolio (%): now, after, target',
      categories: ASSETS.map((a) => a.label),
      series: [
        { name: 'Now', values: c.map((x) => (total > 0 ? (x / total) * 100 : 0)) },
        { name: 'After', values: newVal.map((x) => (x / after) * 100) },
        { name: 'Target', values: t },
      ],
      format: { format: 'number', suffix: '%' },
    };
    const first = ASSETS.findIndex((_, i) => Math.abs(trades[i]) > 0.005);
    return {
      ...out,
      tone: drift > 5 ? 'warn' : 'ok',
      badge: buys + sells < 0.005 ? 'Already on target' : `Largest drift ${+drift.toFixed(1)} points`,
      chart,
      steps: [
        `Portfolio after = ${money(total, 0)} + ${money(n, 0)} new = ${money(after, 0)}`,
        `Target value = ${money(after, 0)} × target share, for example ${ASSETS[0].label} = ${money(targetVal[0], 0)}`,
        mode === 'buy'
          ? 'Buy only: new money goes to holdings below target, in proportion to how far below they are'
          : first >= 0
            ? `Trade = target value - current value, for example ${ASSETS[first].label} = ${money(trades[first], 0)}`
            : 'Trade = target value - current value; every gap is zero',
      ],
      note: 'This is arithmetic, not advice. Selling in a taxable account can trigger capital gains tax, and trading costs are not included. Retirement accounts and new-money purchases often avoid that.',
    };
  },
  content: {
    formula: [
      'Portfolio after = current total + new money',
      'Target value = portfolio after × target share ÷ 100',
      'Buy or sell = target value - current value',
      'Buy only: each below-target holding gets new money × its gap ÷ the sum of all gaps',
    ],
    body: [
      'Over time the parts of a portfolio grow at different speeds, so a 60/30/10 mix slowly becomes 70/22/8. Rebalancing means moving it back to the mix you chose so you carry the risk you meant to carry.',
      'Enter each holding\'s value and your target share. The calculator shows how far each part has drifted and the exact dollar amount to buy or sell. If you are adding money anyway, switch to buy only: the new money goes to whatever is below target, and nothing is sold.',
      'Selling in a taxable account can trigger capital gains tax, and trading can cost fees. Buying with new money, or rebalancing inside a retirement account, usually avoids both. This page does arithmetic only and does not give tax or investment advice.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A $100,000 portfolio holds $70,000 in stocks, $20,000 in bonds, $5,000 in other and $5,000 in cash, against a 60/30/5/5 target. Buy and sell moves $10,000 out of stocks and $10,000 into bonds; the other two are already on target.',
          'With $10,000 of new money and buy only, the portfolio after is $110,000, so the targets are $66,000, $33,000, $5,500 and $5,500. Stocks are above target and get nothing. The gaps are $13,000, $500 and $500, which total $14,000, so the $10,000 is split in that proportion: $9,285.71 to bonds and $357.14 each to the other two. Stocks end near 63.6%, still above the 60% target, but closer.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The investment calculator projects growth, and the net worth calculator totals what you own. The capital gains tax calculator estimates the tax cost of a sale, and the shares to sell calculator works out how many shares to sell.',
        ],
      },
    ],
    faq: [
      { q: 'How do I rebalance without selling?', a: 'Choose buy only and enter the new money. It is spread over the holdings below target in proportion to their gaps. With $10,000 in the example, bonds receive $9,285.71.' },
      { q: 'How often should I rebalance?', a: 'There is no single right answer. Many people check once or twice a year, or when a holding drifts a set number of points from its target. The calculator shows the largest drift so you can apply your own rule.' },
      { q: 'Does selling cause tax?', a: 'In a taxable account it can, if you sell at a gain. Inside a retirement account it usually does not. The calculator does not estimate tax; check your own situation.' },
      { q: 'Why does buy only not reach my target exactly?', a: 'Without selling, a holding that is above target cannot shrink. If the new money is smaller than the total of the gaps, some drift remains. Add more money or allow selling to close it fully.' },
    ],
    sources: [],
  },
  related: ['investment', 'net-worth', 'capital-gains-tax', 'shares-to-sell'],
  examples: [
    // total 100000; targets 60000,30000,5000,5000 -> -10000,+10000,0,0; drift max(|70-60|,|20-30|)=10
    { values: { a1v: 70000, a1t: 60, a2v: 20000, a2t: 30, a3v: 5000, a3t: 5, a4v: 5000, a4t: 5, cash: 0, mode: 'trade' }, expect: { a1x: -10000, a2x: 10000, a3x: 0, a4x: 0, turnover: 10000, sells: 10000, drift: 10, total: 100000 }, tolerance: 1e-6 },
    // after 110000: targets 66000,33000,5500,5500 -> -4000,+13000,+500,+500
    { values: { a1v: 70000, a1t: 60, a2v: 20000, a2t: 30, a3v: 5000, a3t: 5, a4v: 5000, a4t: 5, cash: 10000, mode: 'trade' }, expect: { a1x: -4000, a2x: 13000, a3x: 500, a4x: 500, turnover: 14000, sells: 4000 }, tolerance: 1e-6 },
    // buy only: gaps 0,13000,500,500 (sum 14000 > 10000) -> 10000*13000/14000=9285.714, 357.143 each
    { values: { a1v: 70000, a1t: 60, a2v: 20000, a2t: 30, a3v: 5000, a3t: 5, a4v: 5000, a4t: 5, cash: 10000, mode: 'buy' }, expect: { a1x: 0, a2x: 9285.7143, a3x: 357.1429, a4x: 357.1429, sells: 0, turnover: 10000 }, tolerance: 1e-3 },
  ],
});

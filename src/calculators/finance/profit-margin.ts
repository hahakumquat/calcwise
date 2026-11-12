import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, moneyDonut } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'profit-margin',
  title: 'Profit Margin Calculator',
  category: 'finance',
  description: 'Calculate gross profit, profit margin and markup from an item\'s cost and selling price.',
  keywords: ['profit margin', 'gross margin', 'margin percentage', 'gross profit', 'margin vs markup'],
  inputs: [
    { id: 'cost', label: 'Cost', type: 'number', prefix: '$', default: 60, min: 0, info: 'What the item costs you to buy or make (cost of goods sold). Include other expenses for a net margin.' },
    { id: 'price', label: 'Selling price (revenue)', type: 'number', prefix: '$', default: 100, min: 0, info: 'What you sell the item for, or total revenue.' },
  ],
  outputs: [
    { id: 'margin', label: 'Profit margin', format: 'percent', precision: 2, primary: true, info: 'The share of the selling price you keep as profit.' },
    { id: 'profit', label: 'Profit', format: 'currency', info: 'Selling price minus cost.' },
    { id: 'markup', label: 'Markup', format: 'percent', precision: 2, info: 'Profit as a share of cost — the same profit measured against what you paid.' },
  ],
  compute: (v) => {
    const cost = num(v.cost);
    const price = num(v.price);
    if (cost === null || price === null || cost < 0 || price <= 0) return { margin: null };
    const profit = price - cost;
    const margin = profit / price;
    const markup = cost > 0 ? profit / cost : null;
    return {
      margin,
      profit,
      markup,
      chart: profit > 0 ? moneyDonut('Selling price', [{ label: 'Cost', value: cost }, { label: 'Profit', value: profit }], pct(margin, 1), 'margin') : { type: 'bar', title: 'Cost vs selling price', categories: ['Cost', 'Selling price'], series: [{ name: 'Amount', values: [cost, price] }], format: CURRENCY },
      steps: [
        `Profit = ${money(price)} − ${money(cost)} = ${money(profit)}`,
        `Margin = ${money(profit)} ÷ ${money(price)} = ${pct(margin)}`,
        ...(markup !== null ? [`Markup = ${money(profit)} ÷ ${money(cost)} = ${pct(markup)}`] : []),
      ],
      note: profit < 0 ? 'You are selling below cost — this is a loss.' : `You keep ${money(profit)} of every ${money(price)} sale.`,
    };
  },
  content: {
    formula: ['Profit = price − cost', 'Margin = profit ÷ price', 'Markup = profit ÷ cost'],
    body: [
      'Profit margin tells you what share of each sale you keep as profit. If you sell something for $100 that cost you $60, you keep $40 — a 40% margin. Because margin is measured against the selling price, it can never exceed 100%.',
      'Margin and markup describe the same profit from different starting points. Markup compares profit with cost (the $40 profit is 66.7% of the $60 cost), so it is always the larger number. Mixing the two up is a common pricing mistake: adding a 40% markup gives only a 28.6% margin.',
      'Entering cost of goods sold gives gross margin. To find net margin, include every expense — rent, salaries, marketing, taxes — in the cost figure. Typical gross margins vary widely: grocery stores run on thin margins, while software companies often exceed 70%.',
    ],
    faq: [
      { q: 'How do I set a price for a target margin?', a: 'Divide cost by (1 − target margin). For a 40% margin on a $60 cost: $60 ÷ 0.6 = $100.' },
      { q: 'What is a good profit margin?', a: 'It depends on the industry. A 10% net margin is often considered healthy for a small business, but retail and restaurants frequently run lower and software or consulting higher.' },
    ],
  },
  related: ['markup', 'break-even', 'roi', 'discount'],
  examples: [
    { values: { cost: 60, price: 100 }, expect: { margin: 0.4, profit: 40, markup: 0.6666666667 } },
    { values: { cost: 120, price: 100 }, expect: { margin: -0.2, profit: -20 } },
  ],
});

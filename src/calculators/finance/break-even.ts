import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'break-even',
  title: 'Break-Even Calculator',
  category: 'finance',
  description: 'Find how many units you need to sell to cover fixed costs — or reach a profit target — and the matching revenue.',
  keywords: ['break even point', 'break-even analysis', 'contribution margin', 'units to sell', 'fixed costs', 'variable costs'],
  inputs: [
    { id: 'fixed', label: 'Fixed costs', type: 'number', prefix: '$', default: 50000, min: 0, help: 'Rent, salaries, insurance — costs that don\'t change with sales.', info: 'Costs that stay the same however much you sell in the period: rent, salaries, insurance, software.' },
    { id: 'price', label: 'Price per unit', type: 'number', prefix: '$', default: 25, min: 0, info: 'What you charge customers for one unit.' },
    { id: 'variable', label: 'Variable cost per unit', type: 'number', prefix: '$', default: 10, min: 0, help: 'Materials, packaging, shipping, payment fees per sale.', info: 'Costs that come with each unit sold: materials, packaging, shipping, payment fees.' },
    { id: 'target', label: 'Target profit', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', info: 'Profit you want to make in the period. Leave blank for the plain break-even point.' },
  ],
  outputs: [
    { id: 'units', label: 'Units to sell', format: 'integer', primary: true, info: 'Whole units you must sell to cover fixed costs (and reach your target profit, if entered).' },
    { id: 'revenue', label: 'Sales revenue needed', format: 'currency', info: 'Sales revenue at the break-even point.' },
    { id: 'contribution', label: 'Contribution margin per unit', format: 'currency', info: 'What each unit sale leaves over after its variable cost, to pay fixed costs.' },
    { id: 'contributionRatio', label: 'Contribution margin ratio', format: 'percent', precision: 2, info: 'Contribution margin as a share of the price — the part of each sales dollar that covers fixed costs.' },
    { id: 'exactUnits', label: 'Exact break-even units', format: 'number', precision: 2, info: 'The unrounded break-even quantity, before rounding up to whole units.' },
  ],
  compute: (v) => {
    const fixed = num(v.fixed);
    const price = num(v.price);
    const variable = num(v.variable);
    const target = num(v.target) ?? 0;
    if (fixed === null || price === null || variable === null || fixed < 0 || price <= 0 || variable < 0 || target < 0) return { units: null };
    const contribution = price - variable;
    if (contribution <= 0) return { units: null, error: 'The price must be higher than the variable cost per unit, or you lose money on every sale.' };
    const exactUnits = (fixed + target) / contribution;
    const units = Math.ceil(exactUnits - 1e-9);
    const maxU = Math.max(1, exactUnits * 2);
    const ux = Array.from({ length: 21 }, (_, i) => +((maxU * i) / 20).toFixed(2));
    return {
      units,
      revenue: exactUnits * price,
      contribution,
      contributionRatio: contribution / price,
      exactUnits,
      chart: { type: 'line', title: 'Revenue vs total cost', x: ux, xLabel: 'Units sold', yFormat: CURRENCY, series: [{ name: 'Revenue', values: ux.map((u) => u * price) }, { name: 'Total cost', values: ux.map((u) => fixed + u * variable) }], markers: [{ x: +exactUnits.toFixed(2), label: target ? 'Target' : 'Break-even' }] },
      steps: [
        `Contribution margin = ${money(price)} − ${money(variable)} = ${money(contribution)} per unit`,
        `Units = (${money(fixed)} fixed${target ? ` + ${money(target)} target` : ''}) ÷ ${money(contribution)} = ${+exactUnits.toFixed(4)} → ${units}`,
        `Revenue = ${+exactUnits.toFixed(4)} × ${money(price)} = ${money(exactUnits * price)}`,
      ],
      note: `Each sale contributes ${money(contribution)} (${pct(contribution / price)} of the price) toward fixed costs${target ? ' and profit' : ''}.`,
    };
  },
  content: {
    formula: ['Break-even units = fixed costs ÷ (price − variable cost per unit)', 'With a profit target: units = (fixed costs + target) ÷ (price − variable cost)', 'Break-even revenue = units × price'],
    body: [
      'The break-even point is the sales volume where total revenue exactly covers total costs, so profit is zero. Every unit sold beyond it adds profit; every unit short of it adds to a loss.',
      'The key number is the contribution margin: the price minus the variable cost of one unit. That is how much each sale contributes toward paying fixed costs. Divide fixed costs by it and you have the number of units to break even. Add a profit target to fixed costs to find the sales needed to earn that profit.',
      'The analysis assumes a constant price and constant variable cost per unit. In practice, discounts, volume pricing and step changes in fixed costs (such as hiring another employee) change the picture, so rerun it for each scenario.',
    ],
    faq: [
      { q: 'How can I lower my break-even point?', a: 'Raise the price, cut variable costs per unit, or reduce fixed costs. Raising the price usually has the biggest effect because it increases the contribution margin of every sale.' },
      { q: 'What is the contribution margin ratio used for?', a: 'It is the share of each sales dollar that covers fixed costs. Dividing fixed costs by the ratio gives break-even revenue directly — handy when you sell many products at different prices.' },
    ],
  },
  related: ['profit-margin', 'markup', 'roi'],
  examples: [
    { values: { fixed: 50000, price: 25, variable: 10, target: null }, expect: { units: 3334, exactUnits: 3333.3333333, revenue: 83333.333333 } },
    { values: { fixed: 1000, price: 20, variable: 10, target: 500 }, expect: { units: 150, revenue: 3000 } },
  ],
});

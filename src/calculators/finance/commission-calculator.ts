import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'commission-calculator',
  title: 'Sales Commission Calculator',
  category: 'finance',
  description: 'Work out sales commission from your sales and rate, with an optional higher rate above quota and base pay, to see total earnings and your effective rate.',
  keywords: ['commission calculator', 'sales commission calculator', 'commission rate', 'tiered commission', 'commission with quota', 'base plus commission'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'sales', label: 'Total sales', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'Sales you earn commission on in the period.' },
    { id: 'rate', label: 'Commission rate', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.5, info: 'Percent of sales paid as commission, up to the quota.' },
    { id: 'quota', label: 'Quota', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, optional: true, info: 'Sales level where a higher rate starts. Leave empty for one flat rate.' },
    { id: 'accel', label: 'Rate above quota', type: 'number', suffix: '%', default: 8, min: 0, max: 100, step: 0.5, optional: true, info: 'Rate applied only to sales above the quota. Ignored without a quota.' },
    { id: 'base', label: 'Base pay for the period', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, optional: true, info: 'Salary or draw for the same period. Leave empty if commission only.' },
  ],
  outputs: [
    { id: 'commission', label: 'Commission earned', format: 'currency', precision: 2, primary: true, info: 'Commission on all sales, using the tiers above.' },
    { id: 'total', label: 'Total pay (base + commission)', format: 'currency', precision: 2, info: 'Base pay plus commission.' },
    { id: 'effective', label: 'Effective commission rate', format: 'number', precision: 2, suffix: '%', info: 'Commission ÷ total sales.' },
    { id: 'extra', label: 'Earned above quota', format: 'currency', precision: 2, info: 'Commission from sales above the quota.' },
  ],
  compute: (v) => {
    const sales = num(v.sales);
    const rate = num(v.rate);
    const quota = num(v.quota);
    const accel = num(v.accel);
    const base = num(v.base) ?? 0;
    if (sales === null || rate === null || sales < 0 || rate < 0 || base < 0) return { commission: null };
    const useTier = quota !== null && quota > 0 && accel !== null && accel >= 0;
    const baseSales = useTier ? Math.min(sales, quota as number) : sales;
    const overSales = useTier ? Math.max(0, sales - (quota as number)) : 0;
    const main = (baseSales * rate) / 100;
    const extra = useTier ? (overSales * (accel as number)) / 100 : 0;
    const commission = main + extra;
    const total = base + commission;
    const effective = sales > 0 ? (commission / sales) * 100 : 0;
    const steps = useTier
      ? [
          `Up to quota: $${fmt(baseSales)} × ${fmt(rate)}% = $${fmt(main)}`,
          `Above quota: $${fmt(overSales)} × ${fmt(accel as number)}% = $${fmt(extra)}`,
          `Commission = $${fmt(main)} + $${fmt(extra)} = $${fmt(commission)}`,
          `Total pay = $${fmt(base)} base + $${fmt(commission)} = $${fmt(total)}`,
        ]
      : [
          `Commission = $${fmt(sales)} × ${fmt(rate)}% = $${fmt(commission)}`,
          `Total pay = $${fmt(base)} base + $${fmt(commission)} = $${fmt(total)}`,
        ];
    return {
      commission,
      total,
      effective,
      extra,
      chart: {
        type: 'bar',
        title: 'Where your pay comes from',
        categories: ['Base', 'Commission to quota', 'Commission above quota'],
        series: [{ name: 'Pay', values: [base, main, extra] }],
        format: { format: 'currency', precision: 0 },
      },
      steps,
      note: useTier && overSales > 0
        ? `You beat the quota by $${fmt(overSales)}, so that slice earns ${fmt(accel as number)}% instead of ${fmt(rate)}%.`
        : undefined,
    };
  },
  content: {
    formula: [
      'Flat: commission = sales × rate',
      'Tiered: commission = (sales up to quota × rate) + (sales above quota × higher rate)',
      'Effective rate = commission ÷ sales',
    ],
    body: [
      'Commission pay rewards you for what you sell. The simplest plan is a flat percentage: $80,000 of sales at 5% pays $4,000.',
      'Many plans pay a higher rate once you pass a quota. The higher rate usually applies only to sales above the quota, not to everything. With a $50,000 quota, 5% below it and 8% above it, $80,000 of sales pays $2,500 + $2,400 = $4,900.',
      'Your effective rate is commission divided by total sales. It lands between your two rates, so it tells you what the plan really pays.',
      'Plans differ: some pay the higher rate on all sales once you hit quota (retroactive), or use more than two tiers, or pay on profit instead of revenue. Check your own plan document. This calculator covers one quota with a higher rate on the excess.',
    ],
    faq: [
      { q: 'How do you calculate commission?', a: 'Multiply sales by the commission rate. $80,000 × 5% = $4,000. With a quota and a higher rate, apply each rate to its own slice of sales.' },
      { q: 'How does tiered commission work?', a: 'You earn one rate up to the quota and a higher rate on sales beyond it. With a $50,000 quota at 5% and 8% above, $80,000 pays 5% of $50,000 ($2,500) plus 8% of $30,000 ($2,400) = $4,900.' },
      { q: 'What is the effective commission rate?', a: 'Total commission divided by total sales. In the example, $4,900 ÷ $80,000 = 6.13%.' },
      { q: 'Is commission taxed differently?', a: 'Commission is usually treated as supplemental wages, which some employers withhold at a flat rate. Your actual tax is settled on your annual return. See the bonus tax calculator for the withholding method.' },
    ],
    sources: [
      { label: 'Commission (Investopedia)', url: 'https://www.investopedia.com/terms/c/commission.asp' },
      { label: 'Tax withholding for supplemental wages (IRS Publication 15)', url: 'https://www.irs.gov/publications/p15' },
    ],
  },
  related: ['bonus-tax', 'take-home-pay', 'salary-to-hourly', 'freelance-rate', 'raise-calculator', 'profit-margin'],
  examples: [
    { values: { sales: 80000, rate: 5, quota: 50000, accel: 8, base: 3000 }, expect: { commission: 4900, total: 7900, effective: 6.125, extra: 2400 }, tolerance: 1e-6 },
    { values: { sales: 20000, rate: 10, quota: null, accel: null, base: null }, expect: { commission: 2000, total: 2000, effective: 10, extra: 0 }, tolerance: 1e-6 },
  ],
});

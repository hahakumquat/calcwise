import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'customer-lifetime-value',
  title: 'Customer Lifetime Value (LTV) Calculator',
  category: 'finance',
  description: 'Work out customer lifetime value from monthly revenue, gross margin and churn, then see your LTV to CAC ratio and the months to earn back CAC.',
  keywords: ['customer lifetime value calculator', 'ltv calculator', 'ltv to cac ratio', 'cac payback period', 'churn rate lifetime value', 'subscription business metrics'],
  updated: '2026-11-26',
  inputs: [
    { id: 'arpu', label: 'Monthly revenue per customer', type: 'number', prefix: '$', default: 50, min: 0, step: 1, info: 'Average amount one customer pays you each month (often called ARPU).' },
    { id: 'margin', label: 'Gross margin', type: 'number', suffix: '%', default: 80, min: 0, max: 100, step: 1, info: 'The share of each sale left after the direct costs of serving the customer: payment fees, hosting, materials, delivery.' },
    { id: 'churn', label: 'Monthly churn rate', type: 'number', suffix: '%', default: 5, min: 0.01, max: 100, step: 0.1, info: 'The share of customers who leave each month. 5% means you lose about 1 in 20 each month.' },
    { id: 'cac', label: 'Cost to acquire a customer (CAC)', type: 'number', prefix: '$', default: 100, min: 0, step: 1, info: 'Ads, sales time and anything else you spend to win one new customer. Set to 0 to skip the ratio and payback.' },
  ],
  outputs: [
    { id: 'ltv', label: 'Customer lifetime value', format: 'currency', primary: true, info: 'Monthly revenue × gross margin ÷ monthly churn: the gross profit you expect from an average customer before they leave.' },
    { id: 'lifetime', label: 'Average customer lifetime', format: 'number', precision: 1, suffix: 'months', info: '1 ÷ monthly churn. At 5% churn the average customer stays 20 months.' },
    { id: 'monthly', label: 'Gross profit per customer per month', format: 'currency', info: 'Monthly revenue × gross margin.' },
    { id: 'ratio', label: 'LTV to CAC ratio', format: 'number', precision: 2, suffix: ': 1', info: 'LTV ÷ CAC. A common rule of thumb treats 3 or more as healthy; it is a guide, not a law.' },
    { id: 'payback', label: 'CAC payback', format: 'number', precision: 1, suffix: 'months', info: 'CAC ÷ gross profit per month: how long a customer takes to earn back what it cost to win them.' },
    { id: 'net', label: 'Profit per customer after CAC', format: 'currency', info: 'LTV minus CAC. Negative means each new customer loses you money on average.' },
  ],
  compute: (v) => {
    const arpu = num(v.arpu);
    const margin = num(v.margin);
    const churn = num(v.churn);
    const cac = num(v.cac) ?? 0;
    if (arpu === null || margin === null || churn === null || arpu < 0 || cac < 0 || margin < 0 || margin > 100 || churn <= 0 || churn > 100) return { ltv: null };
    const c = churn / 100;
    const monthly = arpu * (margin / 100);
    const lifetime = 1 / c;
    const ltv = monthly * lifetime;
    const hasCac = cac > 0;
    const ratio = hasCac ? ltv / cac : null;
    const payback = hasCac && monthly > 0 ? cac / monthly : null;
    const net = ltv - cac;
    const good = hasCac ? (ratio as number) >= 3 : null;
    const months = Math.min(120, Math.max(24, Math.ceil(lifetime * 3)));
    const xs: number[] = [];
    const cum: number[] = [];
    const ref: number[] = [];
    for (let k = 0; k <= 24; k++) {
      const m = Math.round((months * k) / 24);
      if (xs.length && xs[xs.length - 1] === m) continue;
      xs.push(m);
      // Expected gross profit per original customer after m months, with a share c leaving each month.
      cum.push((monthly * (1 - Math.pow(1 - c, m))) / c);
      ref.push(cac);
    }
    return {
      ltv,
      lifetime,
      monthly,
      ratio,
      payback,
      net,
      tone: good === null ? ('ok' as const) : good ? ('good' as const) : (ratio as number) >= 1 ? ('ok' as const) : ('bad' as const),
      badge: good === null ? 'Lifetime value' : good ? 'Healthy ratio' : (ratio as number) >= 1 ? 'Thin ratio' : 'Losing money',
      note: hasCac
        ? `An average customer is worth $${fmt(ltv, 2)} in gross profit over ${fmt(lifetime, 1)} months, ${fmt(ratio as number, 2)} times the $${fmt(cac, 2)} it costs to win them.${payback === null ? '' : ` They pay back that cost in ${fmt(payback, 1)} months.`}`
        : `An average customer is worth $${fmt(ltv, 2)} in gross profit over ${fmt(lifetime, 1)} months. Add your acquisition cost to see the LTV to CAC ratio and payback.`,
      chart: {
        type: 'line',
        title: 'Expected profit per customer over time',
        x: xs,
        xLabel: 'Months since signing up',
        yFormat: { format: 'currency' },
        series: [{ name: 'Cumulative gross profit', values: cum }, ...(hasCac ? [{ name: 'Acquisition cost', values: ref }] : [])],
      },
      steps: [
        `Gross profit per month = $${fmt(arpu, 2)} × ${fmt(margin, 2)}% = $${fmt(monthly, 2)}`,
        `Lifetime = 1 ÷ ${fmt(churn, 2)}% = ${fmt(lifetime, 1)} months`,
        `LTV = $${fmt(monthly, 2)} × ${fmt(lifetime, 1)} = $${fmt(ltv, 2)}`,
        ...(hasCac ? [`LTV to CAC = $${fmt(ltv, 2)} ÷ $${fmt(cac, 2)} = ${fmt(ratio as number, 2)}`] : []),
      ],
    };
  },
  content: {
    formula: [
      'Gross profit per month = monthly revenue per customer × gross margin',
      'Customer lifetime (months) = 1 ÷ monthly churn rate',
      'LTV = gross profit per month ÷ monthly churn rate',
      'LTV to CAC = LTV ÷ customer acquisition cost; CAC payback (months) = CAC ÷ gross profit per month',
    ],
    body: [
      'Customer lifetime value (LTV) is the gross profit you can expect from an average customer before they stop paying. It matters for any subscription, membership or repeat-purchase business, because it tells you how much you can afford to spend to win each new customer.',
      'This calculator uses the common simple model: revenue per month, times gross margin, divided by the monthly churn rate. If you earn $50 a month at an 80% margin and lose 5% of customers each month, the average customer stays 20 months and is worth $40 × 20 = $800.',
      'It is a simple model. It assumes churn, price and margin stay constant, ignores discounting and upsells, and treats every customer as average. Use it for planning and comparison, not as a forecast. Everything runs in your browser.',
    ],
    sections: [
      {
        heading: 'LTV to CAC and payback',
        paragraphs: [
          'Dividing LTV by what it costs to acquire a customer (CAC) shows whether growth pays for itself. A ratio of 3 or more is a widely quoted rule of thumb for a healthy business, and a ratio under 1 means each customer loses money. The right target depends on your cash, margins and how reliable your churn figure is.',
          'Payback is how many months of gross profit it takes to recover CAC. A short payback frees cash to reinvest. The chart shows expected profit per customer climbing towards LTV as customers leave, with CAC as the line to cross.',
          'Churn is the lever to watch. Cutting monthly churn from 5% to 4% lifts lifetime from 20 to 25 months and LTV by a quarter, with no change in price.',
        ],
      },
    ],
    faq: [
      { q: 'How do you calculate customer lifetime value?', a: 'Multiply monthly revenue per customer by gross margin, then divide by the monthly churn rate. For $50 a month, an 80% margin and 5% churn: $50 × 0.80 = $40 per month, and $40 ÷ 0.05 = $800.' },
      { q: 'What is a good LTV to CAC ratio?', a: 'A ratio of 3 or more is a common rule of thumb. With an LTV of $800 and a CAC of $100 the ratio is 8, which is comfortably healthy. A ratio below 1 means customers cost more to win than they return.' },
      { q: 'How is the customer lifetime worked out?', a: 'It is 1 divided by the monthly churn rate. At 5% churn, 1 ÷ 0.05 = 20 months. At 4% churn it is 25 months.' },
      { q: 'How is CAC payback calculated?', a: 'Divide CAC by gross profit per month. With a $100 CAC and $40 of monthly gross profit, payback takes 100 ÷ 40 = 2.5 months.' },
      { q: 'Why use gross margin instead of revenue?', a: 'Revenue ignores what it costs to serve the customer. Using margin counts only the profit you keep, so LTV is not overstated. $1,000 of lifetime revenue at an 80% margin is $800 of profit.' },
    ],
  },
  related: ['profit-margin', 'break-even', 'roi', 'subscription-cost', 'freelance-rate'],
  examples: [
    // monthly 50 × 0.80 = 40; lifetime 1 ÷ 0.05 = 20; LTV 40 × 20 = 800; ratio 800 ÷ 100 = 8; payback 100 ÷ 40 = 2.5; net 800 − 100 = 700.
    { values: { arpu: 50, margin: 80, churn: 5, cac: 100 }, expect: { ltv: 800, lifetime: 20, monthly: 40, ratio: 8, payback: 2.5, net: 700 }, tolerance: 1e-9 },
    // monthly 20 × 0.70 = 14; lifetime 1 ÷ 0.04 = 25; LTV 350; ratio 350 ÷ 200 = 1.75; payback 200 ÷ 14 = 14.2857142857; net 150.
    { values: { arpu: 20, margin: 70, churn: 4, cac: 200 }, expect: { ltv: 350, lifetime: 25, monthly: 14, ratio: 1.75, payback: 14.285714285714286, net: 150 }, tolerance: 1e-9 },
  ],
});

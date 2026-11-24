import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'cost-per-hour-entertainment',
  title: 'Cost Per Hour of Entertainment Calculator',
  category: 'finance',
  description: 'Divide each streaming or game subscription by the hours you use it, see which costs the most per hour, and how much you save a year by cancelling it.',
  keywords: ['cost per hour streaming', 'which subscription to cancel', 'streaming cost per hour calculator', 'subscription value calculator', 'cancel streaming savings'],
  updated: '2026-11-24',
  inputs: [
    { id: 'price1', label: 'Service 1: monthly price', type: 'number', prefix: '$', default: 17.99, min: 0, step: 0.01, optional: true, info: 'Leave at 0 if you have fewer services.' },
    { id: 'hours1', label: 'Service 1: hours used a month', type: 'number', suffix: 'h', default: 20, min: 0, step: 0.5, optional: true, info: 'Your honest estimate of hours watched, played or listened.' },
    { id: 'price2', label: 'Service 2: monthly price', type: 'number', prefix: '$', default: 11.99, min: 0, step: 0.01, optional: true, info: 'Leave at 0 if you have fewer services.' },
    { id: 'hours2', label: 'Service 2: hours used a month', type: 'number', suffix: 'h', default: 4, min: 0, step: 0.5, optional: true, info: 'Your honest estimate of hours watched, played or listened.' },
    { id: 'price3', label: 'Service 3: monthly price', type: 'number', prefix: '$', default: 9.99, min: 0, step: 0.01, optional: true, info: 'Leave at 0 if you have fewer services.' },
    { id: 'hours3', label: 'Service 3: hours used a month', type: 'number', suffix: 'h', default: 0.5, min: 0, step: 0.5, optional: true, info: 'Your honest estimate of hours watched, played or listened.' },
    { id: 'price4', label: 'Service 4: monthly price', type: 'number', prefix: '$', default: 0, min: 0, step: 0.01, optional: true, info: 'Leave at 0 if you have fewer services.' },
    { id: 'hours4', label: 'Service 4: hours used a month', type: 'number', suffix: 'h', default: 0, min: 0, step: 0.5, optional: true, info: 'Your honest estimate of hours watched, played or listened.' },
    { id: 'price5', label: 'Service 5: monthly price', type: 'number', prefix: '$', default: 0, min: 0, step: 0.01, optional: true, info: 'Leave at 0 if you have fewer services.' },
    { id: 'hours5', label: 'Service 5: hours used a month', type: 'number', suffix: 'h', default: 0, min: 0, step: 0.5, optional: true, info: 'Your honest estimate of hours watched, played or listened.' },
    { id: 'price6', label: 'Service 6: monthly price', type: 'number', prefix: '$', default: 0, min: 0, step: 0.01, optional: true, info: 'Leave at 0 if you have fewer services.' },
    { id: 'hours6', label: 'Service 6: hours used a month', type: 'number', suffix: 'h', default: 0, min: 0, step: 0.5, optional: true, info: 'Your honest estimate of hours watched, played or listened.' },
  ],
  outputs: [
    { id: 'saving', label: 'Saved a year by cancelling the worst value', format: 'currency', primary: true, info: '12 × the monthly price of the service with the highest cost per hour. An unused service counts as worst.' },
    { id: 'total', label: 'Total spent a month', format: 'currency', info: 'Sum of all monthly prices.' },
    { id: 'worst', label: 'Highest cost per hour', format: 'currency', info: 'Price ÷ hours for the worst-value service. Blank if that service is unused.' },
    { id: 'best', label: 'Lowest cost per hour', format: 'currency', info: 'Price ÷ hours for the best-value service you actually use.' },
  ],
  compute: (v) => {
    const rows: { n: number; p: number; h: number }[] = [];
    for (let k = 1; k <= 6; k++) {
      const p = v['price' + k] === undefined || v['price' + k] === '' ? 0 : num(v['price' + k]);
      const h = v['hours' + k] === undefined || v['hours' + k] === '' ? 0 : num(v['hours' + k]);
      if (p === null || h === null) return { saving: null };
      if (p < 0 || h < 0) return { saving: null, error: 'Prices and hours cannot be negative.' };
      if (p > 0) rows.push({ n: k, p, h });
    }
    if (rows.length === 0) return { saving: null };
    const total = rows.reduce((s, r) => s + r.p, 0);
    const unused = rows.filter((r) => r.h === 0).sort((a, b) => b.p - a.p);
    const used = rows.filter((r) => r.h > 0).sort((a, b) => b.p / b.h - a.p / a.h);
    const worstRow = unused.length ? unused[0] : used[0];
    const saving = worstRow.p * 12;
    const worst = unused.length ? null : worstRow.p / worstRow.h;
    const best = used.length ? used[used.length - 1].p / used[used.length - 1].h : null;
    const labels = rows.map((r) => 'Service ' + r.n);
    return {
      saving, total, worst, best,
      tone: 'good',
      badge: `Cancel service ${worstRow.n}: save ${usd(saving)} a year`,
      chart: {
        type: 'bar',
        title: 'Cost per hour by service',
        categories: labels,
        series: [{ name: 'Per hour', values: rows.map((r) => (r.h > 0 ? r.p / r.h : r.p)) }],
        format: { format: 'currency' },
      },
      steps: [
        ...rows.map((r) => r.h > 0 ? `Service ${r.n}: ${usd(r.p)} ÷ ${r.h} h = ${usd(r.p / r.h)} an hour` : `Service ${r.n}: ${usd(r.p)} with no hours, so it is unused`),
        `Total: ${usd(total)} a month`,
        `Cancelling service ${worstRow.n}: ${usd(worstRow.p)} × 12 = ${usd(saving)} a year`,
      ],
      note: 'Hours are your own estimate, and the chart shows an unused service at its full monthly price. Cost per hour ignores value you get from a service in other ways, such as shared accounts. Prices are whatever you enter.',
    };
  },
  content: {
    formula: [
      'Cost per hour = monthly price ÷ hours used a month',
      'Total spent = sum of monthly prices',
      'Saved a year = 12 × price of the highest cost-per-hour service (an unused one counts as worst)',
    ],
    body: [
      'Subscriptions pile up quietly. Dividing each price by the hours you actually use it turns a vague feeling into a number you can compare.',
      'Enter up to six services with their monthly price and your honest hours. The service with the highest cost per hour is the first to cancel, and the calculator shows the yearly saving.',
      'A service you never open has no cost per hour, because you cannot divide by zero hours. It simply goes straight to the top of the cancel list.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: '$17.99 at 20 hours is $0.90 an hour, $11.99 at 4 hours is $3.00, and $9.99 at 0.5 hours is $19.98. The total is $39.97 a month, and cancelling the worst saves $119.88 a year.' },
      { q: 'What if I never use a service?', a: 'It counts as the worst value. A $9.99 service with 0 hours would save $119.88 a year if cancelled.' },
      { q: 'Should I cancel the highest cost per hour?', a: 'It is a good first candidate, but the number only counts hours. Shared accounts, kids or a show you are waiting for can change the answer.' },
      { q: 'Can I rotate services instead?', a: 'Yes. Cancelling and resubscribing for the months you use it can cut the cost per hour, but this calculator compares what you pay each month.' },
    ],
    sources: [],
  },
  related: ['subscription-cost', 'cost-per-use', 'annual-vs-monthly-plan'],
  examples: [
    // 17.99/20=0.8995; 11.99/4=2.9975; 9.99/.5=19.98; total 39.97; saving 9.99*12=119.88
    { values: { price1: 17.99, hours1: 20, price2: 11.99, hours2: 4, price3: 9.99, hours3: 0.5, price4: 0, hours4: 0, price5: 0, hours5: 0, price6: 0, hours6: 0 }, expect: { saving: 119.88, total: 39.97, worst: 19.98, best: 0.8995 }, tolerance: 0.01 },
    // unused service 14.99 -> saving 179.88; best 10/10 = 1
    { values: { price1: 10, hours1: 10, price2: 14.99, hours2: 0, price3: 0, hours3: 0, price4: 0, hours4: 0, price5: 0, hours5: 0, price6: 0, hours6: 0 }, expect: { saving: 179.88, total: 24.99, best: 1 }, tolerance: 0.01 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'phone-upgrade-vs-keep',
  title: 'Phone Upgrade vs Keep Calculator',
  category: 'finance',
  description: 'Compare the monthly cost of buying a new phone, after trade-in credit and resale value, with the cost of keeping your old one running a little longer.',
  keywords: ['should i upgrade my phone', 'phone upgrade cost per month', 'keep old phone vs buy new', 'new phone vs battery replacement', 'phone cost calculator'],
  updated: '2026-11-24',
  inputs: [
    { id: 'price', label: 'New phone price', type: 'number', prefix: '$', default: 999, min: 0, step: 10, info: 'Full price before any credit.' },
    { id: 'credit', label: 'Trade-in or promo credit', type: 'number', prefix: '$', default: 300, min: 0, step: 10, optional: true, info: 'One-off credit you get toward the new phone.' },
    { id: 'resale', label: 'Expected resale value at the end', type: 'number', prefix: '$', default: 150, min: 0, step: 10, optional: true, info: 'What you could sell the new phone for when you stop using it.' },
    { id: 'years', label: 'Years you will keep the new phone', type: 'number', suffix: 'years', default: 3, min: 0.5, max: 15, step: 0.5, info: 'How long you expect to use it.' },
    { id: 'oldCost', label: 'Cost to keep the old phone going', type: 'number', prefix: '$', default: 89, min: 0, step: 10, optional: true, info: 'Battery, screen or other repairs needed to keep it usable.' },
    { id: 'oldYears', label: 'Extra years you would keep the old phone', type: 'number', suffix: 'years', default: 1, min: 0.5, max: 15, step: 0.5, info: 'How much longer the old phone would last after those repairs.' },
  ],
  outputs: [
    { id: 'extraYear', label: 'Upgrading costs more a year', format: 'currency', primary: true, info: 'Difference per month × 12. Negative means upgrading is cheaper per year.' },
    { id: 'newMonth', label: 'New phone per month', format: 'currency', info: '(Price − credit − resale) ÷ (years × 12).' },
    { id: 'keepMonth', label: 'Keeping the old phone per month', format: 'currency', info: 'Repair cost ÷ (extra years × 12).' },
    { id: 'diff', label: 'Difference per month', format: 'currency', info: 'New phone per month − keeping per month.' },
    { id: 'netNew', label: 'Net cost of the new phone', format: 'currency', info: 'Price − credit − resale.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const credit = v.credit === undefined || v.credit === '' ? 0 : num(v.credit);
    const resale = v.resale === undefined || v.resale === '' ? 0 : num(v.resale);
    const years = num(v.years);
    const oldCost = v.oldCost === undefined || v.oldCost === '' ? 0 : num(v.oldCost);
    const oldYears = num(v.oldYears);
    if (price === null || credit === null || resale === null || years === null || oldCost === null || oldYears === null) return { extraYear: null };
    if (price < 0 || credit < 0 || resale < 0 || oldCost < 0) return { extraYear: null, error: 'Money amounts cannot be negative.' };
    if (years <= 0 || oldYears <= 0) return { extraYear: null, error: 'Years must be above 0.' };
    const netNew = price - credit - resale;
    const newMonth = netNew / (years * 12);
    const keepMonth = oldCost / (oldYears * 12);
    const diff = newMonth - keepMonth;
    const extraYear = diff * 12;
    const cheaperNew = diff < 0;
    return {
      extraYear, newMonth, keepMonth, diff, netNew,
      tone: cheaperNew ? 'good' : 'warn',
      badge: cheaperNew
        ? `Upgrading is ${usd(-diff)} a month cheaper`
        : `Upgrading costs ${usd(diff)} more a month`,
      chart: {
        type: 'bar',
        title: 'Cost per month',
        categories: ['New phone', 'Keep old phone'],
        series: [{ name: 'Per month', values: [newMonth, keepMonth] }],
        format: { format: 'currency' },
      },
      steps: [
        `Net cost of the new phone: ${usd(price)} − ${usd(credit)} − ${usd(resale)} = ${usd(netNew)}`,
        `New phone per month: ${usd(netNew)} ÷ (${years} × 12) = ${usd(newMonth)}`,
        `Old phone per month: ${usd(oldCost)} ÷ (${oldYears} × 12) = ${usd(keepMonth)}`,
        `Difference: ${usd(newMonth)} − ${usd(keepMonth)} = ${usd(diff)} a month, ${usd(extraYear)} a year`,
      ],
      note: 'Carrier plan prices and credits spread over 36 months are not modelled beyond the one credit input. Resale value and how long each phone lasts are your own estimates. Cost does not capture camera, speed or security-update differences.',
    };
  },
  content: {
    formula: [
      'Net cost of new phone = price − credit − resale value',
      'New phone per month = net cost ÷ (years kept × 12)',
      'Old phone per month = repair cost ÷ (extra years × 12)',
      'Difference per month = new per month − old per month',
    ],
    body: [
      'A new phone looks cheaper once a trade-in credit is subtracted, but the real comparison is cost per month of use. This calculator spreads each option over the time you expect it to last.',
      'For the new phone, take the price off the credit and what you could resell it for, then divide by the months you will keep it. For the old phone, divide the cost of a battery or screen repair by the extra months it buys you.',
      'If you would keep the old phone for free, set the repair cost to 0 and the old phone costs nothing per month. The result is only as good as your estimates of resale value and lifespan.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A $999 phone with $300 credit and $150 resale has a net cost of $549. Over 3 years that is $15.25 a month. An $89 battery that buys 1 more year is $7.42 a month. Upgrading costs $7.83 more a month, about $94 a year.' },
      { q: 'What resale value should I use?', a: 'Check what the same model sells for used today after a year or two, then use a cautious figure. Enter 0 if you will not sell it.' },
      { q: 'Does it include my carrier plan?', a: 'No. Monthly plan fees are the same either way if you keep the same plan. Only the one credit input is modelled.' },
      { q: 'When does upgrading win?', a: 'When the old phone needs a costly repair for little extra life, or when the new phone will last long enough that its monthly cost falls below the old one\'s.' },
    ],
    sources: [],
  },
  related: ['cost-per-use', 'subscription-cost', 'bill-negotiation-savings'],
  examples: [
    // net 999-300-150=549; 549/36=15.25; 89/12=7.41667; diff 7.83333; year 94
    { values: { price: 999, credit: 300, resale: 150, years: 3, oldCost: 89, oldYears: 1 }, expect: { netNew: 549, newMonth: 15.25, keepMonth: 7.4167, diff: 7.8333, extraYear: 94 }, tolerance: 0.01 },
    // net 800-0-200=600; /24=25; keep 0 -> 0; diff 25; year 300
    { values: { price: 800, credit: 0, resale: 200, years: 2, oldCost: 0, oldYears: 1 }, expect: { netNew: 600, newMonth: 25, keepMonth: 0, extraYear: 300 }, tolerance: 0.01 },
  ],
});

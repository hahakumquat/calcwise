import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');

export default defineCalculator({
  slug: 'cost-of-living-salary',
  title: 'Salary Needed in a New City (Cost of Living)',
  category: 'finance',
  description: 'What salary keeps your lifestyle in a more or less expensive city? Enter both cost-of-living indexes and compare any job offer in today\'s buying power.',
  keywords: ['cost of living salary calculator', 'salary adjustment for moving', 'cost of living comparison', 'equivalent salary new city', 'is this job offer enough to move', 'cost of living index salary'],
  updated: '2026-11-20',
  inputs: [
    { id: 'salary', label: 'Current salary', type: 'number', prefix: '$', default: 80000, min: 0, step: 500, info: 'Your yearly pay today, before tax.' },
    { id: 'from', label: 'Cost-of-living index: where you live now', type: 'number', default: 100, min: 1, step: 0.1, info: 'Any cost-of-living index, as long as both cities use the same one and the same scale. 100 is a common baseline.' },
    { id: 'to', label: 'Cost-of-living index: new city', type: 'number', default: 120, min: 1, step: 0.1, info: 'The same index for the city you may move to. 120 means 20% more expensive than a city at 100.' },
    { id: 'offer', label: 'Job offer in the new city (optional)', type: 'number', prefix: '$', optional: true, min: 0, step: 500, info: 'Fill in to see how an offer compares with your current buying power.' },
  ],
  outputs: [
    { id: 'needed', label: 'Salary to keep the same lifestyle', format: 'currency', primary: true, info: 'Current salary × new index ÷ current index.' },
    { id: 'diff', label: 'Change needed', format: 'currency', info: 'Equivalent salary minus current salary.' },
    { id: 'pct', label: 'Cost-of-living difference', format: 'percent', precision: 1, info: 'New index ÷ current index − 1.' },
    { id: 'offerReal', label: 'Offer in today\'s buying power', format: 'currency', info: 'Offer × current index ÷ new index: what the offer is worth in your current city\'s prices. Shown only if you enter an offer.' },
    { id: 'offerGap', label: 'Offer vs current salary (buying power)', format: 'currency', info: 'Offer in buying power minus current salary. Positive means you would be better off.' },
  ],
  compute: (v) => {
    const s = num(v.salary), a = num(v.from), b = num(v.to), offer = num(v.offer);
    if (s === null || a === null || b === null) return { needed: null, note: 'Enter your salary and both indexes.' };
    if (s < 0 || a <= 0 || b <= 0) return { needed: null, error: 'Use a salary of 0 or more and indexes above 0.' };
    const needed = (s * b) / a;
    const out: Record<string, number | string | object | null> = {
      needed,
      diff: needed - s,
      pct: b / a - 1,
      tone: 'ok',
      badge: b === a ? 'Same cost of living' : b > a ? `${((b / a - 1) * 100).toFixed(1)}% more expensive` : `${((1 - b / a) * 100).toFixed(1)}% cheaper`,
      steps: [
        `Index ratio = ${b} ÷ ${a} = ${(b / a).toFixed(4)}`,
        `Salary needed = ${usd(s)} × ${(b / a).toFixed(4)} = ${usd(needed)}`,
      ],
      note: 'A single index averages housing, food, transport and more. Your own costs, especially rent, can differ a lot, and income tax differs by state and country.',
    };
    if (offer !== null && offer >= 0) {
      const real = (offer * a) / b;
      out.offerReal = real;
      out.offerGap = real - s;
      out.badge = real >= s ? `Offer beats today by ${usd(real - s)}` : `Offer is ${usd(s - real)} short`;
      (out.steps as string[]).push(`Offer in today's buying power = ${usd(offer)} × ${a} ÷ ${b} = ${usd(real)}`);
    }
    out.chart = {
      type: 'bar',
      title: 'Salary in each city',
      categories: offer !== null ? ['Current', 'Needed', 'Offer'] : ['Current', 'Needed'],
      series: [{ name: 'Salary', values: offer !== null ? [s, needed, offer] : [s, needed] }],
      format: { format: 'currency' },
    };
    return out as ReturnType<Parameters<typeof defineCalculator>[0]['compute']>;
  },
  content: {
    formula: [
      'Salary needed = current salary × (new index ÷ current index)',
      'Offer in today\'s buying power = offer × (current index ÷ new index)',
    ],
    body: [
      'When you move, a salary buys more or less depending on prices there. A cost-of-living index puts a city\'s prices on one scale, and the ratio between two cities shows how much more or less you would need to earn to live the same way.',
      'You supply both index values. Use the same index source for both cities, since different publishers use different scales. If your current city is 100 and the new one is 120, prices are 20% higher and an $80,000 salary would need to be $96,000.',
      'The offer field turns a job offer into buying power at your current prices. An offer of $90,000 in a city at 120 is worth $75,000 where you live now, so it is a pay cut in real terms even though the number is higher.',
      'An index is an average. It cannot see your actual rent, commute or family size, and it ignores differences in income tax. Treat the result as a first filter and check real housing costs before deciding.',
    ],
    faq: [
      { q: 'How much do I need to earn if the new city is 20% more expensive?', a: 'Multiply by 1.2. An $80,000 salary at index 100 becomes $96,000 at index 120.' },
      { q: 'Is a $90,000 offer in a city at 120 better than $80,000 at 100?', a: 'No. $90,000 × 100 ÷ 120 = $75,000 in your current buying power, which is $5,000 less than $80,000.' },
      { q: 'Where do I find a cost-of-living index?', a: 'Several publishers offer city comparisons, including the Bureau of Economic Analysis regional price parities for US areas. Use the same source and scale for both cities.' },
      { q: 'Does this include taxes?', a: 'No. It scales pre-tax salary by price levels only. State and local taxes can change the result, so compare take-home pay for a closer answer.' },
    ],
    sources: [
      { label: 'Regional price parities (US Bureau of Economic Analysis)', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
    ],
  },
  related: ['inflation', 'take-home-pay', 'rent-affordability', 'raise-calculator'],
  examples: [
    // 80000 x 120/100 = 96000; diff 16000; pct 0.2; offer 90000 x 100/120 = 75000; gap -5000
    { values: { salary: 80000, from: 100, to: 120, offer: 90000 }, expect: { needed: 96000, diff: 16000, pct: 0.2, offerReal: 75000, offerGap: -5000 }, tolerance: 1e-6 },
    // 60000 x 85/100 = 51000
    { values: { salary: 60000, from: 100, to: 85 }, expect: { needed: 51000, diff: -9000, pct: -0.15 }, tolerance: 1e-9 },
    // 100000 x 150/120 = 125000
    { values: { salary: 100000, from: 120, to: 150 }, expect: { needed: 125000, pct: 0.25 }, tolerance: 1e-9 },
  ],
});

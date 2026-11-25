import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const N = 5;
const ids = Array.from({ length: N }, (_, i) => `d${i + 1}`);
const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'utility-days-split',
  title: 'Utility Bill Split by Days Present',
  category: 'everyday',
  description: 'Split a utility bill by how many days each housemate was home. Enter the bill and days present for up to five people and get each fair share.',
  keywords: ['utility bill split by days', 'split utilities by days present', 'split electric bill move in move out', 'prorate utilities roommates', 'split bill by days lived'],
  updated: '2026-11-25',
  inputs: [
    { id: 'bill', label: 'Utility bill total', type: 'number', prefix: '$', default: 150, min: 0, step: 1, info: 'The full amount on the bill.' },
    ...ids.map((id, i) => ({
      id,
      label: `Person ${i + 1}: days present`,
      type: 'number' as const,
      suffix: 'days',
      ...(i < 3 ? { default: [30, 30, 10][i] } : {}),
      min: 0,
      step: 1,
      ...(i >= 2 ? { optional: true } : {}),
      info: 'Days in the billing period this person lived there. Blank or 0 leaves them out.',
    })),
  ],
  outputs: [
    { id: 'rate', label: 'Cost per person-day', format: 'currency', primary: true, info: 'Bill divided by the total of everyone\'s days.' },
    ...ids.map((id, i) => ({ id: `share${i + 1}`, label: `Person ${i + 1} pays`, format: 'currency' as const, info: `Person ${i + 1}'s days × the cost per person-day.` })),
  ],
  compute: (v) => {
    const bill = num(v.bill);
    if (bill === null) return { rate: null };
    const days = ids.map((id) => num(v[id]) ?? 0);
    if (bill < 0 || days.some((d) => d < 0)) return { rate: null, error: 'Amounts and days cannot be negative.' };
    const total = days.reduce((a, b) => a + b, 0);
    if (total <= 0) return { rate: null };
    const rate = bill / total;
    const shares = days.map((d) => d * rate);
    const out: Record<string, any> = { rate };
    shares.forEach((s, i) => { out[`share${i + 1}`] = s; });
    const used = days.map((d, i) => ({ d, i })).filter((x) => x.d > 0);
    return {
      ...out,
      tone: 'good',
      badge: `${total} person-days across ${used.length} ${used.length === 1 ? 'person' : 'people'}`,
      chart: {
        type: 'bar',
        title: 'Each person\'s share of the bill',
        categories: used.map((x) => `Person ${x.i + 1}`),
        series: [{ name: 'Pays', values: used.map((x) => shares[x.i]) }],
        format: { format: 'currency' },
      },
      steps: [
        `Person-days = ${days.filter((d) => d > 0).join(' + ')} = ${total}`,
        `Cost per person-day = ${usd(bill)} ÷ ${total} = ${usd(rate)}`,
        ...used.map((x) => `Person ${x.i + 1} = ${x.d} × ${usd(rate)} = ${usd(shares[x.i])}`),
      ],
      note: 'Shares add up to the bill before rounding to cents. Fixed charges and heavy-use differences are for the housemates to agree.',
    };
  },
  content: {
    formula: ['Person-days = sum of everyone\'s days present', 'Cost per person-day = bill ÷ person-days', 'Share = days present × cost per person-day'],
    body: [
      'Splitting a bill equally is unfair when someone moves in late or leaves early. Splitting by days present fixes that: everyone pays the same price for each day they lived there.',
      'Example: a $150 bill where A and B were there 30 days and C only 10. That is 70 person-days at $2.14 each, so A and B pay $64.29 and C pays $21.43. Second example: $90 with A at 28 days and B at 14 is 42 person-days, so A pays $60.00 and B pays $30.00.',
      'The method treats every day the same. If you want to charge for heavy use or split a fixed service fee equally, agree that with your housemates first. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I split utilities when someone moved in mid-month?', a: 'Count the days each person lived there, divide the bill by the total of all those days, then multiply by each person\'s days. $150 over 70 person-days is about $2.14 a day.' },
      { q: 'Why do the shares not add up exactly?', a: 'Each share is rounded to cents for display. Before rounding they add up to the bill exactly.' },
      { q: 'What if a person was away for part of the period?', a: 'Enter only the days they were present, or the days you agree to charge them for.' },
      { q: 'Is a flat service fee split the same way?', a: 'This calculator does not separate it. If you want a fixed charge split equally, take it out of the bill total and split it with the bill splitter.' },
    ],
    sources: [],
  },
  related: ['bill-splitter', 'prorated-rent', 'rent-split'],
  examples: [
    // 70 person-days; 150/70 = 2.142857; 30*r = 64.2857; 10*r = 21.4286
    { values: { bill: 150, d1: 30, d2: 30, d3: 10 }, expect: { rate: 2.142857, share1: 64.285714, share2: 64.285714, share3: 21.428571 }, tolerance: 0.001 },
    // 42 person-days; 90/42 = 2.142857; 28r = 60; 14r = 30
    { values: { bill: 90, d1: 28, d2: 14, d3: 0 }, expect: { rate: 2.142857, share1: 60, share2: 30, share3: 0 }, tolerance: 0.001 },
  ],
});

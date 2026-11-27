import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'flip-70-rule',
  title: 'House Flip 70% Rule Calculator',
  category: 'finance',
  description: 'Use the 70% rule for house flipping: find the maximum offer from after-repair value and repair costs, and see the profit at the price you actually offer.',
  keywords: ['70 percent rule house flipping', '70% rule calculator', 'house flip maximum offer', 'flipping houses calculator', 'after repair value calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'arv', label: 'After-repair value (ARV)', type: 'number', prefix: '$', default: 300000, min: 0, step: 1000, info: 'What the house should sell for once the work is finished.' },
    { id: 'repairs', label: 'Repair costs', type: 'number', prefix: '$', default: 40000, min: 0, step: 1000, info: 'Your estimate of the full renovation cost.' },
    { id: 'pct', label: 'Rule percentage', type: 'number', suffix: '%', default: 70, min: 1, max: 100, step: 1, info: 'The rule of thumb is 70%. Investors change it with the market. It is editable.' },
    { id: 'offer', label: 'Your actual offer', type: 'number', prefix: '$', default: 170000, min: 0, step: 1000, optional: true, info: 'Optional. Enter a price to see the profit on it. It is the gap before holding, closing and selling costs.' },
  ],
  outputs: [
    { id: 'maxOffer', label: 'Maximum offer', format: 'currency', primary: true, info: 'ARV × percentage − repair costs.' },
    { id: 'margin', label: 'Cushion kept by the rule', format: 'currency', info: 'ARV × (100% − percentage). Covers selling, holding and profit.' },
    { id: 'profit', label: 'Gross profit at your offer', format: 'currency', info: 'ARV − offer − repairs. Before holding, closing and selling costs.' },
  ],
  compute: (v) => {
    const arv = num(v.arv);
    const repairs = num(v.repairs);
    const pctN = num(v.pct);
    const offer = v.offer === undefined || v.offer === '' ? null : num(v.offer);
    if (arv === null || repairs === null || pctN === null) return { maxOffer: null };
    if (arv <= 0) return { maxOffer: null, error: 'Enter the after-repair value.' };
    if (repairs < 0 || (offer !== null && offer < 0)) return { maxOffer: null, error: 'Money amounts cannot be negative.' };
    if (pctN <= 0 || pctN > 100) return { maxOffer: null, error: 'Rule percentage must be between 1% and 100%.' };
    const pct = pctN / 100;
    const maxOffer = arv * pct - repairs;
    const margin = arv * (1 - pct);
    const profit = offer === null ? null : arv - offer - repairs;
    const steps = [
      `ARV × ${pctN}% = ${usd(arv)} × ${pct} = ${usd(arv * pct)}`,
      `Maximum offer: ${usd(arv * pct)} − ${usd(repairs)} repairs = ${usd(maxOffer)}`,
      `Cushion the rule leaves: ${usd(arv)} × ${(100 - pctN).toFixed(0)}% = ${usd(margin)}`,
    ];
    if (profit !== null) steps.push(`Gross profit at ${usd(offer as number)}: ${usd(arv)} − ${usd(offer as number)} − ${usd(repairs)} = ${usd(profit)}`);
    const over = offer !== null && offer > maxOffer;
    return {
      maxOffer, margin, profit,
      tone: maxOffer <= 0 ? 'warn' : over ? 'warn' : 'good',
      badge: maxOffer <= 0
        ? 'Repairs use up the whole budget: the rule says there is no price that works'
        : over
          ? `Your offer is ${usd((offer as number) - maxOffer)} above the rule's maximum`
          : `The rule allows an offer up to ${usd(maxOffer)}`,
      chart: {
        type: 'bar',
        title: 'Where the after-repair value goes at the maximum offer',
        categories: ['Max offer', 'Repairs', 'Cushion'],
        series: [{ name: 'Dollars', values: [Math.max(maxOffer, 0), repairs, margin] }],
        format: { format: 'currency' },
      },
      steps,
      note: 'The 70% rule is a rough screen, not a guarantee of profit. The cushion has to cover selling costs, holding costs, financing and your profit, and the ARV is only as good as your comparable sales. Check local costs before you offer.',
    };
  },
  content: {
    formula: [
      'Maximum offer = ARV × rule percentage − repair costs',
      'Cushion = ARV × (100% − rule percentage)',
      'Gross profit at an offer = ARV − offer − repair costs',
    ],
    body: [
      'The 70% rule is a rule of thumb among house flippers. Take the after-repair value (ARV), multiply by 70%, and subtract the repair costs. The result is the most you should pay for the house.',
      'The remaining 30% of ARV is the cushion. It has to pay for selling costs, holding costs such as loan interest, taxes and utilities, and still leave a profit. A different percentage suits a different market, so the 70% here can be edited.',
      'The rule is only as good as its two inputs. ARV should come from recent comparable sales, and repair costs from real quotes with some margin for surprises. Treat the answer as a ceiling for a first offer, not a promise of profit.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'With an ARV of $300,000, repairs of $40,000 and a 70% rule, the maximum offer is $300,000 × 0.70 − $40,000 = $170,000. The cushion is $300,000 × 30% = $90,000. An offer of $170,000 gives $300,000 − $170,000 − $40,000 = $90,000 gross profit before other costs.' },
      { q: 'Is the 70% rule a law or a guarantee?', a: 'No. It is a common rule of thumb. Investors in expensive markets may accept a higher percentage, and cautious investors use a lower one. That is why the percentage is editable.' },
      { q: 'What does gross profit mean here?', a: 'It is ARV minus your offer minus repairs. It does not subtract selling costs, holding costs or financing, which the cushion is meant to cover.' },
      { q: 'What if the maximum offer is negative?', a: 'Then the repairs are larger than the rule allows for at that ARV. No offer price meets the rule, so either the repairs or the ARV estimate needs to change.' },
    ],
    sources: [],
  },
  related: ['rental-rules-screen', 'house-hacking-offset', 'diy-vs-hire', 'roi'],
  examples: [
    // 300000*.7-40000=170000; margin 90000; profit 300000-170000-40000=90000
    { values: { arv: 300000, repairs: 40000, pct: 70, offer: 170000 }, expect: { maxOffer: 170000, margin: 90000, profit: 90000 }, tolerance: 0.01 },
    // 200000*.75-30000=120000; margin 50000; profit 200000-130000-30000=40000
    { values: { arv: 200000, repairs: 30000, pct: 75, offer: 130000 }, expect: { maxOffer: 120000, margin: 50000, profit: 40000 }, tolerance: 0.01 },
  ],
});

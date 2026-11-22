import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'bill-negotiation-savings',
  title: 'Bill Negotiation Savings Calculator',
  category: 'finance',
  description: 'Work out what a lower monthly price is worth over time, including the price after the deal ends, and what the saving could grow to if you invest it.',
  keywords: ['bill negotiation savings', 'negotiate my bill calculator', 'how much will i save by negotiating', 'promo price savings', 'lower monthly bill savings', 'retention offer savings'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'current', label: 'Current monthly price', type: 'number', prefix: '$', default: 80, min: 0, step: 1, info: 'What you pay each month now.' },
    { id: 'deal', label: 'Negotiated monthly price', type: 'number', prefix: '$', default: 65, min: 0, step: 1, info: 'The new price you were offered for the length of the deal.' },
    { id: 'dealMonths', label: 'Months the deal lasts', type: 'number', default: 12, min: 0, max: 600, step: 1, suffix: 'months', info: 'If the deal is longer than your horizon, only the months inside the horizon count.' },
    { id: 'after', label: 'Price after the deal ends', type: 'number', prefix: '$', default: 80, min: 0, step: 1, info: 'What you expect to pay once the deal ends. Use the same as the negotiated price if it stays.' },
    { id: 'horizon', label: 'Horizon', type: 'number', default: 36, min: 1, max: 600, step: 1, suffix: 'months', info: 'How many months ahead to look.' },
    { id: 'rate', label: 'Return if you invest the saving (optional)', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.1, info: 'A yearly return you assume, not a promise. Use 0 to ignore investing.' },
  ],
  outputs: [
    { id: 'saved', label: 'Total saved', format: 'currency', precision: 2, primary: true, info: '(Current − deal price) × deal months, plus (Current − price after) × remaining months.' },
    { id: 'perMonth', label: 'Saving per month during the deal', format: 'currency', precision: 2, info: 'Current price minus the negotiated price.' },
    { id: 'perMonthAfter', label: 'Saving per month after the deal', format: 'currency', precision: 2, info: 'Current price minus the price after the deal. Negative means you pay more than today.' },
    { id: 'dealSaved', label: 'Saved during the deal', format: 'currency', precision: 2, info: 'Saving per month × months inside the deal.' },
    { id: 'afterSaved', label: 'Saved after the deal', format: 'currency', precision: 2, info: 'Saving per month after the deal × remaining months.' },
    { id: 'invested', label: 'Value if the saving is invested', format: 'currency', precision: 2, info: 'Each month\'s saving is added at month end and grows at the yearly return ÷ 12.' },
    { id: 'growth', label: 'Growth from investing', format: 'currency', precision: 2, info: 'Invested value minus total saved.' },
  ],
  compute: (v) => {
    const c = num(v.current);
    const d = num(v.deal);
    const m0 = num(v.dealMonths);
    const a = num(v.after);
    const h0 = num(v.horizon);
    const r = num(v.rate) ?? 0;
    if (c === null || d === null || m0 === null || a === null || h0 === null) return { saved: null };
    if (c < 0 || d < 0 || a < 0 || m0 < 0 || h0 < 1 || h0 > 600 || r < 0 || r > 100) return { saved: null };
    const h = Math.round(h0);
    const m = Math.min(Math.round(m0), h);
    const rest = h - m;
    const sDeal = c - d;
    const sAfter = c - a;
    const dealSaved = sDeal * m;
    const afterSaved = sAfter * rest;
    const saved = dealSaved + afterSaved;
    const i = r / 100 / 12;
    // Month-by-month: balance grows by r/12, then that month's saving is added (ordinary annuity).
    const xs: number[] = [];
    const cum: number[] = [];
    const bal: number[] = [];
    let b = 0;
    let s = 0;
    for (let k = 0; k <= h; k++) {
      if (k > 0) {
        const sv = k <= m ? sDeal : sAfter;
        b = b * (1 + i) + sv;
        s += sv;
      }
      xs.push(k);
      cum.push(s);
      bal.push(b);
    }
    const series = [{ name: 'Saved (no investing)', values: cum }];
    if (r > 0) series.push({ name: 'Invested', values: bal });
    return {
      saved,
      perMonth: sDeal,
      perMonthAfter: sAfter,
      dealSaved,
      afterSaved,
      invested: b,
      growth: b - saved,
      tone: saved > 0 ? 'good' : saved < 0 ? 'warn' : undefined,
      badge: saved > 0 ? 'You save' : saved < 0 ? 'Costs more' : 'No change',
      chart: {
        type: 'line',
        title: 'Savings over time',
        x: xs,
        xLabel: 'Months',
        xFormat: { format: 'number' },
        yFormat: { format: 'currency', precision: 0 },
        series,
      },
      steps: [
        `During the deal: (${money(c)} − ${money(d)}) × ${m} months = ${money(dealSaved)}`,
        `After the deal: (${money(c)} − ${money(a)}) × ${rest} months = ${money(afterSaved)}`,
        `Total saved = ${money(dealSaved)} + ${money(afterSaved)} = ${money(saved)}`,
        ...(r > 0 ? [`Invested at ${r}% a year (${+(r / 12).toFixed(4)}% a month), saving added at each month end: ${money(b)}`] : []),
      ],
      note: saved > 0
        ? `Over ${h} months you would pay ${money(saved)} less than at today's price.`
        : saved < 0
          ? `After the deal ends the price is higher than today's, so over ${h} months you would pay ${money(-saved)} more.`
          : `Over ${h} months you would pay the same as at today's price.`,
    };
  },
  content: {
    formula: [
      'Total saved = (current − deal price) × months in deal + (current − price after) × remaining months',
      'Months in deal = the smaller of deal months and horizon; remaining months = horizon − months in deal',
      'Invested value: each month, balance = balance × (1 + return ÷ 12) + that month\'s saving',
    ],
    body: [
      'Calling a provider to ask for a lower price can be worth it, but the headline number is only part of the story. Many deals are short, and the price may rise again afterwards. This calculator adds up the saving month by month across the whole horizon you choose, so a short deal followed by a return to your old price shows its real size.',
      'Try 80 dollars a month cut to 65 dollars for 12 months, then back to 80 dollars, over 36 months. You save 15 dollars a month for 12 months, which is 180 dollars, and nothing after that. If the 65 dollar price lasted all 36 months, you would save 540 dollars.',
      'The optional return shows what the saving could become if you put it aside each month instead of spending it. Each month\'s saving is added at month end, and the balance grows by one twelfth of the yearly return. At 6% a year, 15 dollars a month for 36 months grows to about 590.04 dollars. The return is an assumption you choose, not a promise, and taxes and fees are ignored.',
      'The tool takes the prices you enter at face value. It does not know what any provider will offer, so check the terms of a deal, including contract length, fees and what happens when it ends.',
    ],
    faq: [
      { q: 'How is the saving calculated?', a: 'During the deal, the saving is current price minus negotiated price, times the months the deal lasts (capped at your horizon). For the remaining months it is current price minus the price after the deal, times those months. The two parts are added together.' },
      { q: 'What happens to the saving after the deal ends?', a: 'If you enter a price after the deal, the calculator keeps counting: the saving is the current price minus that price each month. If that price is the same as today\'s, the saving is zero. If it is higher than today\'s, the saving for those months is negative and reduces the total. The investing figure uses the same monthly savings, so a negative month takes money out of the balance.' },
      { q: 'How is the invested value worked out?', a: 'Month by month, the balance grows by the yearly return divided by 12, then that month\'s saving is added at month end. With a constant saving this is an ordinary annuity: 15 dollars a month for 36 months at 6% gives about 590.04 dollars.' },
      { q: 'What if the deal is longer than my horizon?', a: 'Only the months inside your horizon count. The deal months are capped at the horizon, and there are no remaining months.' },
      { q: 'Is the investment return guaranteed?', a: 'No. It is a rate you type in, applied steadily. Real returns vary, and this tool ignores taxes and fees. Set it to 0 to see the plain saving.' },
    ],
    sources: [
      { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' },
      { label: 'Investor.gov: Compound interest calculator', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
    ],
  },
  related: ['subscription-cost', 'price-hike-impact', 'savings-goal', 'compound-interest', 'annual-vs-monthly-plan'],
  examples: [
    {
      // (80 − 65) × 12 = 180; (80 − 80) × 24 = 0; total 180
      values: { current: 80, deal: 65, dealMonths: 12, after: 80, horizon: 36, rate: 0 },
      expect: { saved: 180, perMonth: 15, perMonthAfter: 0, dealSaved: 180, afterSaved: 0, invested: 180 },
      tolerance: 1e-6,
    },
    {
      // (80 − 65) × 36 = 540
      values: { current: 80, deal: 65, dealMonths: 36, after: 65, horizon: 36, rate: 0 },
      expect: { saved: 540 },
      tolerance: 1e-6,
    },
    {
      // 15 × ((1.005^36 − 1) / 0.005) = 590.04
      values: { current: 80, deal: 65, dealMonths: 36, after: 65, horizon: 36, rate: 6 },
      expect: { saved: 540, invested: 590.04, growth: 50.04 },
      tolerance: 0.01,
    },
    {
      // (100 − 70) × 6 = 180; (100 − 90) × 6 = 60; total 240
      values: { current: 100, deal: 70, dealMonths: 6, after: 90, horizon: 12, rate: 0 },
      expect: { saved: 240, dealSaved: 180, afterSaved: 60 },
      tolerance: 1e-6,
    },
    {
      // deal 24 months capped to horizon 12: (100 − 80) × 12 = 240
      values: { current: 100, deal: 80, dealMonths: 24, after: 100, horizon: 12, rate: 0 },
      expect: { saved: 240, afterSaved: 0 },
      tolerance: 1e-6,
    },
  ],
});

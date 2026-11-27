import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pc = (n: number) => (n * 100).toFixed(1) + '%';

export default defineCalculator({
  slug: 'extended-warranty-worth-it',
  title: 'Extended Warranty Worth It? Calculator',
  category: 'finance',
  description: 'Is an extended warranty worth it? Compare the plan price with the expected payout from your own failure-chance guess, and see the break-even chance.',
  keywords: ['extended warranty worth it', 'is an extended warranty worth it', 'protection plan calculator', 'product protection plan break even', 'service contract worth it'],
  updated: '2026-11-27',
  inputs: [
    { id: 'price', label: 'Product price', type: 'number', prefix: '$', default: 600, min: 0, step: 10, info: 'What the product costs. Used only to show the plan as a share of it.' },
    { id: 'plan', label: 'Plan price', type: 'number', prefix: '$', default: 120, min: 0, step: 5, info: 'The full cost of the extended warranty or protection plan.' },
    { id: 'chance', label: 'Chance it fails and is covered during the plan', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 1, info: 'Your own guess, not insurer data. Think of the chance that at least one covered failure happens during the plan.' },
    { id: 'repair', label: 'Repair or replacement cost if it fails', type: 'number', prefix: '$', default: 400, min: 0, step: 10, info: 'What you would pay without the plan.' },
    { id: 'fee', label: 'Deductible or service fee per claim', type: 'number', prefix: '$', default: 0, min: 0, step: 5, optional: true, info: 'What you still pay on a claim. Leave blank for none.' },
  ],
  outputs: [
    { id: 'net', label: 'Expected net value of the plan', format: 'currency', primary: true, info: 'Expected payout − plan price. Negative means the plan costs more than it is expected to pay back.' },
    { id: 'payout', label: 'Expected payout', format: 'currency', info: 'Chance × (repair cost − fee).' },
    { id: 'breakEven', label: 'Break-even failure chance', format: 'percent', info: 'Plan price ÷ (repair cost − fee). Above 100% the plan can never pay off.' },
    { id: 'planPct', label: 'Plan price as share of product price', format: 'percent', info: 'Plan price ÷ product price.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const plan = num(v.plan);
    const chancePct = num(v.chance);
    const repair = num(v.repair);
    const fee = v.fee === undefined || v.fee === '' ? 0 : num(v.fee);
    if (price === null || plan === null || chancePct === null || repair === null || fee === null) return { net: null };
    if (price < 0 || plan < 0 || repair < 0 || fee < 0) return { net: null, error: 'Money amounts cannot be negative.' };
    if (chancePct < 0 || chancePct > 100) return { net: null, error: 'Chance must be between 0% and 100%.' };
    if (price === 0) return { net: null, error: 'Enter the price of the product.' };
    if (repair <= fee) return { net: null, error: 'The repair cost must be higher than the fee per claim, otherwise the plan pays nothing.' };
    const chance = chancePct / 100;
    const claim = repair - fee;
    const payout = chance * claim;
    const net = payout - plan;
    const breakEven = plan / claim;
    const planPct = plan / price;
    const worth = net >= 0;
    return {
      net, payout, breakEven, planPct,
      tone: worth ? 'good' : 'warn',
      badge: worth
        ? `On your guess, the plan is expected to pay ${usd(net)} more than it costs`
        : `On your guess, the plan is expected to cost ${usd(-net)} more than it pays`,
      chart: {
        type: 'bar',
        title: 'Plan price vs expected payout',
        categories: ['Plan price', 'Expected payout'],
        series: [{ name: 'Dollars', values: [plan, payout] }],
        format: { format: 'currency' },
      },
      steps: [
        `Payout if you claim: ${usd(repair)} − ${usd(fee)} fee = ${usd(claim)}`,
        `Expected payout: ${pc(chance)} × ${usd(claim)} = ${usd(payout)}`,
        `Expected net: ${usd(payout)} − ${usd(plan)} plan = ${usd(net)}`,
        `Break-even chance: ${usd(plan)} ÷ ${usd(claim)} = ${pc(breakEven)}${breakEven > 1 ? ' (above 100%, so the plan cannot pay off on average)' : ''}`,
        `The plan is ${pc(planPct)} of the product price.`,
      ],
      note: 'The chance is your own guess, not insurer or manufacturer data, so try a low and a high value. This is an average over many purchases: one plan either pays out or it does not. It ignores hassle, peace of mind, how long claims take, plan exclusions, the manufacturer warranty that already covers the first period, and any extended warranty perk on your credit card.',
    };
  },
  content: {
    formula: [
      'Payout per claim = repair or replacement cost − fee per claim',
      'Expected payout = failure chance × payout per claim',
      'Expected net value = expected payout − plan price',
      'Break-even chance = plan price ÷ payout per claim',
    ],
    body: [
      'An extended warranty is a bet. You pay a known price now, and in return the plan pays a repair bill if something goes wrong. The plan is worth it, on average, only when the chance of a claim times the claim amount is more than the price.',
      'The break-even failure chance makes that concrete. If the plan costs $120 and a failure would cost you $400, the plan pays off on average only if you think there is at least a 30% chance of a claim. If your honest guess is lower, the plan is expected to cost more than it returns.',
      'The failure chance here is your own guess. This page contains no failure rates, and nothing from a manufacturer or insurer. Try a low and a high value to see whether the answer changes.',
      'Averages are not the whole story. Some people pay for a plan to cap a bill they could not afford, and that peace of mind has real value the maths leaves out. Also check what is already covered: the manufacturer warranty, and any extended warranty benefit from your credit card.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'With a $120 plan, a 20% chance of a claim and a $400 repair with no fee, the expected payout is 0.20 × $400 = $80. The expected net value is $80 − $120 = -$40, so the plan is expected to cost $40 more than it pays. The break-even chance is $120 ÷ $400 = 30%, and the plan is 20.0% of a $600 product.' },
      { q: 'Where do I get the failure chance?', a: 'It is your own estimate. This calculator has no failure statistics. Consider how reliable the product has been for you or in reviews, then test a low and a high guess. The break-even chance shows how high your guess would need to be.' },
      { q: 'How does a deductible change the result?', a: 'The plan pays only repair cost minus your fee. With a $50 fee on a $400 repair, a claim pays $350, so expected payout and break-even both use $350 instead of $400.' },
      { q: 'What if the break-even chance is above 100%?', a: 'The plan costs more than a single claim would pay, so it cannot pay off on average, even if the product certainly fails.' },
      { q: 'What does this leave out?', a: 'Peace of mind, the hassle of repairs and claims, exclusions and limits in the contract, the manufacturer warranty that already covers the early period, and credit-card extended warranty perks. A plan may still make sense if a surprise bill would hurt you.' },
    ],
    sources: [],
  },
  related: ['repair-vs-replace', 'expected-value', 'deductible-breakeven', 'cost-per-use'],
  examples: [
    // payout 0.2*400=80; net 80-120=-40; breakEven 120/400=0.3; planPct 120/600=0.2
    { values: { price: 600, plan: 120, chance: 20, repair: 400, fee: 0 }, expect: { payout: 80, net: -40, breakEven: 0.3, planPct: 0.2 }, tolerance: 0.001 },
    // claim 400-50=350; payout 0.25*350=87.5; net 87.5-60=27.5; breakEven 60/350=0.171429; planPct 60/300=0.2
    { values: { price: 300, plan: 60, chance: 25, repair: 400, fee: 50 }, expect: { payout: 87.5, net: 27.5, breakEven: 0.171429, planPct: 0.2 }, tolerance: 0.001 },
  ],
});

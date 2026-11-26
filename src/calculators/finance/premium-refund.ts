import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'premium-refund',
  title: 'Insurance Premium Refund Calculator',
  category: 'finance',
  description: 'Estimate your insurance refund if you cancel mid-term. Enter the premium, policy length, days in force and any short-rate penalty to see the money back.',
  keywords: ['insurance premium refund calculator', 'cancel car insurance refund', 'pro rata refund', 'short rate cancellation penalty', 'unearned premium calculator'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'premium', label: 'Premium you paid for the term', type: 'number', prefix: '$', default: 1200, min: 0, step: 50, info: 'The total premium for the whole policy term, as shown on your declarations page or bill.' },
    { id: 'term', label: 'Policy term (days)', type: 'number', suffix: 'days', default: 365, min: 1, step: 1, info: 'Days from the policy start date to its end date. Use 365 for a 12-month policy, about 180 for a 6-month one.' },
    { id: 'used', label: 'Days the policy was in force', type: 'number', suffix: 'days', default: 100, min: 0, step: 1, info: 'Days from the start date to the date the cancellation takes effect. It cannot be more than the term.' },
    { id: 'penalty', label: 'Short-rate penalty (% of unearned premium)', type: 'number', suffix: '%', default: 0, min: 0, max: 100, step: 1, info: 'Some insurers keep a share of the unearned premium when you cancel. Enter 0 for a pro rata refund. Check your policy for the exact figure.' },
  ],
  outputs: [
    { id: 'refund', label: 'Estimated refund', format: 'currency', precision: 2, primary: true, info: 'Unearned premium minus any short-rate penalty.' },
    { id: 'unearned', label: 'Unearned premium', format: 'currency', precision: 2, info: 'Premium × days left ÷ term.' },
    { id: 'penaltyAmt', label: 'Short-rate penalty', format: 'currency', precision: 2, info: 'Unearned premium × penalty %.' },
    { id: 'earned', label: 'Premium for days covered', format: 'currency', precision: 2, info: 'Premium × days in force ÷ term.' },
    { id: 'kept', label: 'Total the insurer keeps', format: 'currency', precision: 2, info: 'Premium for days covered plus the penalty.' },
  ],
  compute: (v) => {
    const premium = num(v.premium);
    const term = num(v.term);
    const used = num(v.used);
    const pen = num(v.penalty ?? 0) ?? 0;
    if ([premium, term, used].some((x) => x === null)) return { refund: null };
    if ([premium, used, pen].some((x) => (x as number) < 0)) return { refund: null, error: 'Values cannot be negative.' };
    if ((term as number) <= 0) return { refund: null, error: 'The policy term must be at least 1 day.' };
    if (used! > term!) return { refund: null, error: 'Days in force cannot be more than the policy term.' };
    if (pen > 100) return { refund: null, error: 'The penalty cannot be over 100%.' };
    const unearned = premium! * ((term! - used!) / term!);
    const penaltyAmt = unearned * (pen / 100);
    const refund = unearned - penaltyAmt;
    const earned = premium! - unearned;
    const kept = premium! - refund;
    return {
      refund,
      unearned,
      penaltyAmt,
      earned,
      kept,
      tone: refund > 0 ? (pen > 0 ? 'warn' : 'good') : 'bad',
      badge: premium! > 0 ? `${pct(refund / premium!, 1)} of premium back` : 'No premium',
      note: refund > 0
        ? `Cancelling after ${used} of ${term} days leaves ${money(unearned)} unearned${pen > 0 ? `; after a ${pen}% penalty you get back ${money(refund)}` : `, so a pro rata refund is ${money(refund)}`}. Your insurer's policy terms govern the real figure, including any minimum premium or fees.`
        : 'With these inputs no refund is due. Your insurer\'s policy terms govern the real figure.',
      chart: {
        type: 'donut' as const,
        title: 'Where your premium goes',
        slices: [
          { label: 'Refund to you', value: refund },
          { label: 'Days covered', value: earned },
          { label: 'Penalty', value: penaltyAmt },
        ].filter((s) => s.value > 0),
        format: CURRENCY,
        centerLabel: 'Refund',
        centerValue: money(refund, 0),
      },
      steps: [
        `Unearned premium = ${money(premium!)} × (${term} − ${used}) ÷ ${term} = ${money(unearned)}`,
        `Penalty = ${money(unearned)} × ${pen}% = ${money(penaltyAmt)}`,
        `Refund = ${money(unearned)} − ${money(penaltyAmt)} = ${money(refund)}`,
      ],
    };
  },
  content: {
    formula: [
      'Unearned premium = premium × (term days − days in force) ÷ term days',
      'Short-rate penalty = unearned premium × penalty %',
      'Refund = unearned premium − short-rate penalty',
    ],
    body: [
      'When you cancel an insurance policy partway through the term, you have used some of the coverage you paid for. The unused share is called the unearned premium. A pro rata refund returns all of it, based on the days left.',
      'Example: you paid $1,200 for a 365-day policy and cancel on day 100. The unearned premium is $1,200 × 265 ÷ 365 = $871.23. With a 10% short-rate penalty the insurer keeps $87.12 of that, so you get back $784.11.',
      'This is an estimate only. Insurers may use a different day count, charge a flat cancellation fee, apply a minimum earned premium, or refund differently when they cancel rather than you. State rules vary. Your insurer\'s policy terms govern the real refund, so check your policy or ask them. This is general information, not insurance advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much is refunded if I cancel a $1,200 policy on day 100 of 365?', a: 'A pro rata refund is $871.23, which is $1,200 × 265 ÷ 365. You paid for 100 days of cover, worth $328.77.' },
      { q: 'What changes with a 10% short-rate penalty?', a: 'The insurer keeps 10% of the unearned premium, which is $87.12 here, so the refund drops to $784.11.' },
      { q: 'What is the difference between pro rata and short rate?', a: 'Pro rata refunds every unused day at the same daily rate. Short rate refunds less, because the insurer keeps a penalty. Enter 0% for pro rata.' },
      { q: 'Is the penalty a share of the whole premium?', a: 'Here it is a share of the unearned premium, not the whole premium. Some policies describe it differently, so enter the percentage that matches your policy wording.' },
      { q: 'Will my insurer refund exactly this amount?', a: 'Not necessarily. The insurer\'s policy terms govern, and they may add fees, a minimum premium or a different day count. Treat this as an estimate.' },
    ],
    sources: [],
  },
  related: ['prorated-salary', 'pto-payout-value', 'cd-early-break', 'bill-negotiation-savings'],
  examples: [
    // unearned = 1200 x 265/365 = 871.232877 (rounds to $871.23); earned = 1200 - 871.232877 = 328.767123
    { values: { premium: 1200, term: 365, used: 100, penalty: 0 }, expect: { unearned: 871.232877, refund: 871.232877, penaltyAmt: 0, earned: 328.767123, kept: 328.767123 } },
    // penalty = 871.232877 x 10% = 87.123288; refund = 784.109589 ($784.11); kept = 1200 - 784.109589 = 415.890411
    { values: { premium: 1200, term: 365, used: 100, penalty: 10 }, expect: { unearned: 871.232877, penaltyAmt: 87.123288, refund: 784.109589, earned: 328.767123, kept: 415.890411 } },
    // 600 x 135/180 = 450; penalty 45; refund 405; earned 150; kept 195
    { values: { premium: 600, term: 180, used: 45, penalty: 10 }, expect: { unearned: 450, penaltyAmt: 45, refund: 405, earned: 150, kept: 195 } },
  ],
});

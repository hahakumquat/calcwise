import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'security-deposit-return',
  title: 'Security Deposit Return Calculator',
  category: 'finance',
  description: 'Estimate your security deposit refund after itemised deductions and any interest held. See what you get back, or what you owe if costs exceed the deposit.',
  keywords: ['security deposit return', 'security deposit refund calculator', 'security deposit deductions', 'deposit interest', 'landlord deductions', 'move out deposit'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'deposit', label: 'Security deposit paid', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'The deposit you paid your landlord at move-in, from your lease.' },
    { id: 'd1', label: 'Deduction 1', type: 'number', prefix: '$', default: 150, min: 0, step: 5, optional: true, help: 'For example cleaning or a repair on the landlord\'s itemised list.', info: 'The amount of the first itemised charge the landlord took from the deposit.' },
    { id: 'd2', label: 'Deduction 2', type: 'number', prefix: '$', default: 75, min: 0, step: 5, optional: true, info: 'The amount of the second itemised charge.' },
    { id: 'd3', label: 'Deduction 3', type: 'number', prefix: '$', default: 0, min: 0, step: 5, optional: true, info: 'The amount of the third itemised charge.' },
    { id: 'rate', label: 'Annual interest on the deposit', type: 'number', suffix: '%', default: 1, min: 0, max: 100, step: 0.1, optional: true, help: 'Leave blank if your landlord owes none.', info: 'Some places require landlords to pay interest on deposits. Enter the yearly rate if that applies to you, or leave it blank.' },
    { id: 'months', label: 'Months the deposit was held', type: 'number', suffix: 'months', default: 12, min: 0, step: 1, optional: true, info: 'How long the landlord held the deposit. Simple interest, not compounded.' },
  ],
  outputs: [
    { id: 'refund', label: 'Estimated refund', format: 'currency', primary: true, info: 'Deposit plus interest minus deductions, never below zero.' },
    { id: 'interest', label: 'Interest on the deposit', format: 'currency', info: 'Deposit × annual rate × months ÷ 12, simple interest.' },
    { id: 'deductions', label: 'Total deductions', format: 'currency', info: 'The sum of the itemised deductions.' },
    { id: 'shortfall', label: 'Still owed to landlord', format: 'currency', info: 'How much the deductions exceed the deposit plus interest. Zero if you get a refund.' },
  ],
  compute: (v) => {
    const deposit = num(v.deposit);
    if (deposit === null || deposit < 0) return { refund: null };
    const ds = [num(v.d1) ?? 0, num(v.d2) ?? 0, num(v.d3) ?? 0];
    const rate = num(v.rate) ?? 0;
    const months = num(v.months) ?? 0;
    if (ds.some((x) => x < 0) || rate < 0 || months < 0) return { refund: null, error: 'Values cannot be negative.' };

    const deductions = ds[0] + ds[1] + ds[2];
    const interest = (deposit * rate * months) / 1200;
    const net = deposit + interest - deductions;
    const refund = Math.max(0, net);
    const shortfall = Math.max(0, -net);
    const lost = deductions > 0 ? Math.min(deductions, deposit + interest) : 0;

    return {
      refund,
      interest,
      deductions,
      shortfall,
      tone: shortfall > 0 ? 'bad' : deductions <= 0.1 * deposit ? 'good' : 'ok',
      badge: shortfall > 0 ? `You owe ${money(shortfall, 0)}` : `${money(refund, 0)} back`,
      chart: moneyDonut('Where the deposit goes', [{ label: 'Refund', value: refund }, { label: 'Deductions', value: lost }], money(refund, 0), 'refund'),
      steps: [
        `Interest = ${money(deposit, 0)} × ${rate}% × ${months} ÷ 12 = ${money(interest)}`,
        `Deductions = ${ds.map((x) => money(x)).join(' + ')} = ${money(deductions)}`,
        `Refund = ${money(deposit)} + ${money(interest)} - ${money(deductions)} = ${money(net)}${net < 0 ? ', shown as $0 with the shortfall owed' : ''}`,
      ],
      note: shortfall > 0
        ? `The deductions are ${money(shortfall)} more than the deposit plus interest, so nothing comes back and the landlord may bill you for the difference. Rules on deadlines, caps and what can be deducted vary by state and city, so check your local law.`
        : 'Estimate only. Return deadlines, caps, interest rules and what a landlord may deduct vary by state and city, and this calculator does not apply them. Check your local law.',
    };
  },
  content: {
    formula: [
      'Interest = deposit × annual rate × months held ÷ 12',
      'Refund = deposit + interest - total deductions (not below 0)',
      'Still owed = total deductions - deposit - interest (when positive)',
    ],
    body: [
      'When you move out, your landlord usually has to either return your security deposit or send an itemised list of what was deducted and why. This calculator turns that list into a number: add up up to three deductions, add any interest the deposit earned, and see what should come back to you.',
      'Interest is optional. Some places require landlords to pay interest on deposits, and others do not. If yours does, enter the yearly rate and how many months the deposit was held. The calculator uses simple interest, so the interest does not compound.',
      'If the deductions are larger than the deposit plus interest, the refund is shown as $0 and the extra is shown as the amount still owed. The landlord may be able to bill you for it, depending on the rules where you live.',
      'Deadlines, caps, interest requirements and the rules for what counts as normal wear and tear are set by state and local law, so they are not coded here. Check the rules for your location, and keep move-in and move-out photos and your lease.',
    ],
    faq: [
      { q: 'How is the refund calculated?', a: 'Refund = deposit + interest - deductions. With a $1,800 deposit, deductions of $150, $75 and $0, and 1% interest for 12 months, interest is $18, deductions are $225 and the refund is $1,593.' },
      { q: 'What happens if deductions are more than the deposit?', a: 'The refund shows $0 and the extra shows as the amount still owed. For example, a $1,000 deposit with $1,200 of deductions and no interest leaves $200 owed.' },
      { q: 'Is interest on a deposit compounded here?', a: 'No. The calculator uses simple interest: deposit × rate × months ÷ 12. On $1,800 at 1% for 12 months that is $18. Leave the rate blank if no interest is owed.' },
      { q: 'How long does a landlord have to return the deposit?', a: 'It depends on your state or city, and this calculator does not code any deadline. Check your local law or your lease, and ask for the itemised list in writing.' },
      { q: 'Can I dispute a deduction?', a: 'Often yes. Compare each item to your lease and your move-in and move-out photos, write to the landlord, and look up your local small claims or tenant rules. Then change the amounts here to see how a successful dispute changes the refund.' },
    ],
    sources: [
      { label: 'HUD: Tenant rights, laws and protections', url: 'https://www.hud.gov/topics/rental_assistance/tenantrights' },
    ],
  },
  related: ['rent-vs-buy', 'moving-cost', 'budget-50-30-20'],
  examples: [
    {
      // interest = 1,800 × 1% × 12 ÷ 12 = 18; deductions 150 + 75 = 225; refund = 1,800 + 18 - 225 = 1,593.
      values: { deposit: 1800, d1: 150, d2: 75, d3: 0, rate: 1, months: 12 },
      expect: { refund: 1593, interest: 18, deductions: 225, shortfall: 0 },
      tolerance: 1e-9,
    },
    {
      // No interest: 1,000 - (800 + 400) = -200 -> refund 0, owed 200.
      values: { deposit: 1000, d1: 800, d2: 400, d3: null, rate: null, months: null },
      expect: { refund: 0, interest: 0, deductions: 1200, shortfall: 200 },
      tolerance: 1e-9,
    },
  ],
});

import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'arm-payment-reset',
  title: 'ARM Payment After Reset Calculator',
  seoTitle: 'ARM Payment After Reset Calculator',
  metaDescription: 'See your adjustable-rate mortgage payment during the fixed period and after the rate resets, the balance at reset, and how much the payment jumps.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Work out what an adjustable-rate mortgage payment becomes after the fixed period ends, using the balance left and the new rate you enter.',
  keywords: ['arm payment calculator', 'adjustable rate mortgage reset calculator', '5/1 arm payment after reset', 'arm vs fixed payment jump', 'mortgage rate reset payment'],
  popular: false,
  inputs: [
    { id: 'loan', label: 'Loan amount', type: 'number', prefix: '$', default: 300000, min: 1, step: 5000, info: 'The amount you borrow.' },
    { id: 'term', label: 'Loan term', type: 'number', suffix: 'years', default: 30, min: 1, max: 50, step: 1, info: 'Total length of the loan.' },
    { id: 'rate', label: 'Starting interest rate', type: 'number', suffix: '%', default: 5, min: 0, max: 30, step: 0.125, info: 'The rate during the fixed period.' },
    { id: 'fixed', label: 'Fixed period', type: 'number', suffix: 'years', default: 5, min: 0, max: 49, step: 1, info: 'How long the starting rate lasts, for example 5 for a 5/1 ARM.' },
    { id: 'newrate', label: 'Rate after the reset', type: 'number', suffix: '%', default: 7, min: 0, max: 30, step: 0.125, info: 'The rate you expect after the reset. Your loan\'s rate caps limit how high it can go, so check them and enter a rate within them.' },
  ],
  outputs: [
    { id: 'pay1', label: 'Payment during the fixed period', format: 'currency', info: 'Principal and interest only, at the starting rate over the full term.' },
    { id: 'pay2', label: 'Payment after the reset', format: 'currency', primary: true, info: 'The balance left at the reset, at the new rate, over the remaining months.' },
    { id: 'jump', label: 'Payment increase', format: 'currency', info: 'New payment minus starting payment, per month.' },
    { id: 'jumppct', label: 'Increase as a percentage', format: 'number', precision: 1, suffix: '%', info: 'Payment increase ÷ starting payment.' },
    { id: 'bal', label: 'Balance at the reset', format: 'currency', info: 'What you still owe when the rate changes.' },
  ],
  compute: (v) => {
    const l = num(v.loan), t = num(v.term), r1 = num(v.rate), f = num(v.fixed), r2 = num(v.newrate);
    if ([l, t, r1, f, r2].some((x) => x === null)) return { pay2: null };
    const [loan, term, rate, fixed, newrate] = [l, t, r1, f, r2] as number[];
    if (loan <= 0 || term <= 0 || rate < 0 || fixed < 0 || newrate < 0) return { pay2: null, error: 'Enter a positive loan and term, and rates that are zero or more.' };
    if (fixed >= term) return { pay2: null, error: 'The fixed period must be shorter than the loan term, or there is no reset.' };
    const n = Math.round(term * 12), k = Math.round(fixed * 12);
    const pay1 = amortizedPayment(loan, rate, n);
    const rm = rate / 1200;
    const bal = rm === 0 ? loan - pay1 * k : loan * (1 + rm) ** k - (pay1 * ((1 + rm) ** k - 1)) / rm;
    const pay2 = amortizedPayment(bal, newrate, n - k);
    const jump = pay2 - pay1;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Monthly payment ($)',
      categories: ['During fixed period', 'After reset'],
      series: [{ name: 'Payment', values: [pay1, pay2] }],
      format: { format: 'currency' },
    };
    return {
      pay1, pay2, jump, jumppct: (jump / pay1) * 100, bal,
      tone: jump > 0 ? 'warn' : 'ok',
      badge: jump > 0 ? `Payment rises ${money(jump, 2)} a month` : jump < 0 ? `Payment falls ${money(-jump, 2)} a month` : 'Payment stays the same',
      chart,
      steps: [
        `Starting payment = ${money(loan, 0)} at ${rate}% over ${n} months = ${money(pay1, 2)}`,
        `Balance after ${k} payments = ${money(bal, 2)}`,
        `New payment = ${money(bal, 2)} at ${newrate}% over ${n - k} months = ${money(pay2, 2)}`,
      ],
      note: 'Principal and interest only; tax, insurance and fees are not included. Real ARMs reset on a schedule with rate caps and a margin over an index, so use the rate your lender\'s terms allow. This is arithmetic, not advice.',
    };
  },
  content: {
    formula: [
      'Payment = loan × r ÷ (1 - (1 + r)^-n), with r the monthly rate and n the number of months',
      'Balance at reset = what is left after the fixed-period payments',
      'New payment = balance at reset, at the new rate, over the remaining months',
    ],
    body: [
      'An adjustable-rate mortgage starts with one rate and then changes it. The payment during the fixed period is a normal amortizing payment. When the rate resets, the lender recalculates the payment from the balance you still owe, the new rate and the months left, so the payment can jump even though the balance has fallen.',
      'Enter the loan, term, starting rate, length of the fixed period and a rate you expect after the reset. You get the starting payment, the balance at the reset, the new payment and the increase. Try a few new rates, including the highest your loan\'s caps allow, to see the range.',
      'This covers principal and interest only. Taxes, insurance and fees are extra, and real loans reset on a schedule set by the loan terms. Nothing here is financial advice.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A $300,000 30-year loan at 5% fixed for 5 years has a payment of $1,610.46. After 60 payments the balance is $275,486.20. If the rate resets to 7% for the remaining 300 months, the new payment is $1,947.08, an increase of $336.61 a month, or about 20.9%.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The mortgage calculator handles a single-rate loan, and the refinance calculator shows whether switching to a new loan pays off.',
        ],
      },
    ],
    faq: [
      { q: 'How is the payment after a reset calculated?', a: 'The lender takes the balance you still owe, the new rate and the months left on the loan, and works out a fresh level payment. In the example, $275,486.20 at 7% over 300 months is $1,947.08.' },
      { q: 'Why does the payment rise if I have paid down the loan?', a: 'Because the new rate is higher. The balance is lower, but the higher rate over fewer months raises the payment more than the paydown lowers it.' },
      { q: 'What rate should I enter after the reset?', a: 'Use the rate your loan terms would produce, within its caps. Your loan documents list the index, margin and caps. The calculator does not predict future rates.' },
      { q: 'Does this include taxes and insurance?', a: 'No. It shows principal and interest only.' },
    ],
    sources: [],
  },
  related: ['mortgage', 'refinance', 'interest-only-loan'],
  examples: [
    // 300k 30y 5% -> 1610.4649; bal after 60 = 275486.196; 7% over 300 -> 1947.0791; jump 336.6143; 20.9%
    { values: { loan: 300000, term: 30, rate: 5, fixed: 5, newrate: 7 }, expect: { pay1: 1610.4649, bal: 275486.196, pay2: 1947.0791, jump: 336.6143, jumppct: 20.9 }, tolerance: 0.1 },
    // same loan, reset to 9% -> 2311.87
    { values: { loan: 300000, term: 30, rate: 5, fixed: 5, newrate: 9 }, expect: { pay2: 2311.8701 }, tolerance: 0.01 },
  ],
});

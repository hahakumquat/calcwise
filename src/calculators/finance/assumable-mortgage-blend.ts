import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment } from '../../lib/helpers/finance';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'assumable-mortgage-blend',
  title: 'Assumable Mortgage: Blended Rate and Payment',
  category: 'finance',
  description: 'Assuming a seller\'s low-rate mortgage? Cover the gap with a second loan and see the blended rate, the combined payment and the saving versus one new loan.',
  keywords: ['assumable mortgage calculator', 'assumable mortgage blended rate', 'assume seller mortgage gap loan', 'assumable loan second mortgage payment', 'assumable mortgage vs new loan'],
  updated: '2026-11-28',
  inputs: [
    { id: 'price', label: 'Home price', type: 'number', prefix: '$', default: 400000, min: 0, step: 5000, info: 'The agreed purchase price.' },
    { id: 'down', label: 'Down payment', type: 'number', prefix: '$', default: 40000, min: 0, step: 1000, info: 'Cash you put in at closing.' },
    { id: 'bal', label: 'Assumed loan balance', type: 'number', prefix: '$', default: 250000, min: 0, step: 5000, info: 'The seller\'s remaining mortgage balance you would take over.' },
    { id: 'rate1', label: 'Assumed loan rate', type: 'number', suffix: '%', default: 3, min: 0, step: 0.125, info: 'The seller\'s existing interest rate.' },
    { id: 'years1', label: 'Assumed loan years remaining', type: 'number', suffix: 'years', default: 25, min: 0, step: 1, info: 'Years left on the seller\'s loan.' },
    { id: 'rate2', label: 'Gap loan rate', type: 'number', suffix: '%', default: 7, min: 0, step: 0.125, info: 'Rate on the second loan that covers price minus down payment minus assumed balance.' },
    { id: 'term2', label: 'Gap loan term', type: 'number', suffix: 'years', default: 30, min: 0, step: 1, info: 'Length of the second loan.' },
    { id: 'newrate', label: 'Rate on one new loan (comparison)', type: 'number', suffix: '%', default: 7, min: 0, step: 0.125, info: 'Rate for a single new 30-year loan on the same total borrowed.' },
  ],
  outputs: [
    { id: 'total', label: 'Combined monthly payment', format: 'currency', primary: true, info: 'Assumed loan payment plus gap loan payment (principal and interest only).' },
    { id: 'gap', label: 'Gap to finance', format: 'currency', info: 'Price minus down payment minus assumed balance.' },
    { id: 'blended', label: 'Blended rate (approximate)', format: 'percent', precision: 2, info: 'Balance-weighted average of the two rates. An approximation, not an APR.' },
    { id: 'pay1', label: 'Assumed loan payment', format: 'currency', info: 'Monthly principal and interest on the assumed balance over its remaining years.' },
    { id: 'pay2', label: 'Gap loan payment', format: 'currency', info: 'Monthly principal and interest on the gap loan.' },
    { id: 'newPay', label: 'One new loan payment', format: 'currency', info: 'Payment on one new 30-year loan for the assumed balance plus the gap.' },
    { id: 'saving', label: 'Monthly saving vs one new loan', format: 'currency', info: 'One new loan payment minus the combined payment. Negative means the blend costs more.' },
  ],
  compute: (v) => {
    const price = num(v.price), down = num(v.down), bal = num(v.bal), r1 = num(v.rate1), y1 = num(v.years1);
    const r2 = num(v.rate2), t2 = num(v.term2), rn = num(v.newrate);
    if (price === null || down === null || bal === null || r1 === null || y1 === null || r2 === null || t2 === null || rn === null) return { total: null };
    if (price < 0 || down < 0 || bal < 0 || r1 < 0 || r2 < 0 || rn < 0) return { total: null, error: 'Amounts and rates cannot be negative.' };
    if (y1 <= 0 || t2 <= 0) return { total: null, error: 'Years must be above 0.' };
    const gap = price - down - bal;
    if (gap < 0) return { total: null, error: 'The down payment plus the assumed balance is more than the price, so there is no gap to finance.' };
    const pay1 = amortizedPayment(bal, r1, Math.round(y1 * 12));
    const pay2 = gap === 0 ? 0 : amortizedPayment(gap, r2, Math.round(t2 * 12));
    const total = pay1 + pay2;
    const borrowed = bal + gap;
    if (borrowed <= 0) return { total: null, error: 'Nothing is borrowed with these numbers.' };
    const blended = (bal * r1 + gap * r2) / borrowed / 100;
    const newPay = amortizedPayment(borrowed, rn, 360);
    const saving = newPay - total;
    return {
      total, gap, blended, pay1, pay2, newPay, saving,
      tone: saving > 0 ? 'good' : 'warn',
      badge: saving > 0 ? `${usd(saving)} less a month` : `${usd(-saving)} more a month`,
      chart: {
        type: 'bar',
        title: 'Monthly principal and interest',
        categories: ['Assumed + gap loan', 'One new loan'],
        series: [{ name: 'Payment', values: [total, newPay] }],
        format: { format: 'currency' },
        highlight: 0,
      },
      steps: [
        `Gap = ${usd(price)} - ${usd(down)} - ${usd(bal)} = ${usd(gap)}`,
        `Assumed loan payment = ${usd(pay1)} (${usd(bal)} at ${r1}% for ${y1} years)`,
        `Gap loan payment = ${usd(pay2)} (${usd(gap)} at ${r2}% for ${t2} years)`,
        `Combined = ${usd(total)}; blended rate = (${usd(bal)} x ${r1}% + ${usd(gap)} x ${r2}%) ÷ ${usd(borrowed)} = ${+(blended * 100).toFixed(2)}%`,
        `One new ${usd(borrowed)} loan at ${rn}% over 30 years = ${usd(newPay)}, so the blend is ${usd(saving)} a month ${saving >= 0 ? 'cheaper' : 'dearer'}.`,
      ],
      note: 'Few loans are assumable (mostly FHA, VA and USDA), the lender must approve, the gap loan may cost more than assumed here, and closing costs apply. Confirm with the servicer and at consumerfinance.gov.',
    };
  },
  content: {
    formula: [
      'Gap = price - down payment - assumed balance',
      'Payment = P x r ÷ (1 - (1 + r)^-n), with r = annual rate ÷ 12 and n = years x 12',
      'Blended rate ≈ (balance x rate 1 + gap x rate 2) ÷ (balance + gap)',
      'Combined payment = assumed loan payment + gap loan payment',
    ],
    body: [
      'Some mortgages can be taken over by a buyer, keeping the seller\'s original rate. If the rate is well below today\'s, that is valuable, but the balance is usually smaller than the price minus your down payment. The difference, the gap, needs a second loan or more cash.',
      'This calculator amortizes both loans, adds the payments, and compares the total with one new loan on the same amount. The blended rate is a balance-weighted average, shown as an approximation.',
      'Only some loans are assumable, mostly FHA, VA and USDA, and the lender has to approve the buyer. Second loans can carry higher rates or fees than a first mortgage, and closing costs apply. Treat the output as a first look, not a quote.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A $400,000 price with $40,000 down and a $250,000 balance leaves a $110,000 gap. The assumed loan at 3.0% over 25 years costs $1,185.53 a month and the gap loan at 7.0% over 30 years costs $731.83, a total of $1,917.36.' },
      { q: 'What is the blended rate?', a: 'In the example it is ($250,000 x 3.0% + $110,000 x 7.0%) ÷ $360,000, about 4.22%. It is a weighted average, not an APR, because the loans have different terms.' },
      { q: 'How does it compare with one new loan?', a: 'One new $360,000 loan at 7.0% over 30 years is $2,395.09 a month, so the blend is about $477.73 a month less in the example.' },
      { q: 'Can I assume any mortgage?', a: 'No. Most conventional loans have due-on-sale clauses. FHA, VA and USDA loans are the usual assumable ones, and the servicer must approve you.' },
    ],
    sources: [{ label: 'CFPB: Consumer finance mortgage help', url: 'https://www.consumerfinance.gov/owning-a-home/' }],
  },
  related: ['mortgage', 'refinance', 'loan-comparison'],
  examples: [
    // gap 400000-40000-250000 = 110000
    // pay1: 250000 at 3%/12=0.0025, n=300: 1185.53; pay2: 110000 at 7%, n=360: 731.83; total 1917.36
    // blended (250000*3 + 110000*7)/360000 = 1,520,000/360000 = 4.2222% -> 0.042222
    // new: 360000 at 7%, 360 = 2395.09; saving 477.73
    { values: { price: 400000, down: 40000, bal: 250000, rate1: 3, years1: 25, rate2: 7, term2: 30, newrate: 7 }, expect: { total: 1917.36, gap: 110000, blended: 0.042222, newPay: 2395.09, saving: 477.73 }, tolerance: 0.01 },
  ],
});

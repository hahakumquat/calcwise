import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'foreign-transaction-fee',
  title: 'Foreign Transaction & ATM Fee Calculator',
  category: 'finance',
  description: 'See what card fees and ATM charges add to a trip abroad. Enter your card spend, cash withdrawals and your own fee rates to get the total cost.',
  keywords: ['foreign transaction fee calculator', 'atm fee abroad calculator', 'travel card fees', 'cost of using credit card abroad', 'international atm withdrawal fee', 'foreign currency fee cost'],
  inputs: [
    { id: 'spend', label: 'Card spending abroad', type: 'number', prefix: '$', default: 2000, min: 0, step: 50, info: 'Total you expect to put on your card, in your home currency.' },
    { id: 'feePct', label: 'Card foreign transaction fee', type: 'number', suffix: '%', default: 3, min: 0, max: 20, step: 0.1, info: 'The percentage your card issuer charges on foreign purchases. Check your card terms; many travel cards charge 0%.' },
    { id: 'cash', label: 'Cash withdrawn from ATMs', type: 'number', prefix: '$', default: 400, min: 0, step: 20, info: 'Total cash you expect to take out, in your home currency.' },
    { id: 'atmPct', label: 'ATM percentage fee', type: 'number', suffix: '%', default: 3, min: 0, max: 20, step: 0.1, info: 'Percentage your bank charges on foreign withdrawals. Use 0 if it charges none.' },
    { id: 'atmCount', label: 'Number of withdrawals', type: 'number', default: 2, min: 0, step: 1, info: 'How many separate ATM withdrawals you plan to make.' },
    { id: 'atmFlat', label: 'Flat fee per withdrawal', type: 'number', prefix: '$', default: 5, min: 0, step: 0.5, info: 'The fixed fee per withdrawal from your bank, plus any fee the ATM operator shows on screen.' },
  ],
  outputs: [
    { id: 'total', label: 'Total fees', format: 'currency', primary: true, info: 'Card fees plus ATM fees.' },
    { id: 'cardFees', label: 'Card fees', format: 'currency', info: 'Card spending × card fee rate.' },
    { id: 'atmFees', label: 'ATM fees', format: 'currency', info: 'Cash × ATM rate + withdrawals × flat fee.' },
    { id: 'effective', label: 'Share of everything you spent', format: 'percent', precision: 2, info: 'Total fees ÷ (card spending + cash withdrawn).' },
  ],
  compute: (v) => {
    const spend = num(v.spend), feePct = num(v.feePct), cash = num(v.cash) ?? 0;
    const atmPct = num(v.atmPct) ?? 0, atmCount = num(v.atmCount) ?? 0, atmFlat = num(v.atmFlat) ?? 0;
    if (spend === null || feePct === null) return { total: null, note: 'Enter your card spending and fee rate.' };
    if (spend < 0 || feePct < 0 || cash < 0 || atmPct < 0 || atmCount < 0 || atmFlat < 0) return { total: null, error: 'Use values of 0 or more.' };
    const cardFees = spend * feePct / 100;
    const atmFees = cash * atmPct / 100 + atmCount * atmFlat;
    const total = cardFees + atmFees;
    const base = spend + cash;
    const effective = base > 0 ? (total / base) * 100 : 0;
    return {
      total,
      cardFees,
      atmFees,
      effective,
      tone: total > 0 ? 'warn' : 'ok',
      badge: total > 0 ? `${n2(effective)}% lost to fees` : 'No fees',
      chart: {
        type: 'bar',
        title: 'Where the fees come from',
        categories: ['Card fees', 'ATM fees'],
        series: [{ name: 'Fees', values: [cardFees, atmFees] }],
        format: { format: 'currency' },
      },
      steps: [
        `Card fees = $${n2(spend)} × ${n1(feePct)}% = $${n2(cardFees)}`,
        `ATM fees = $${n2(cash)} × ${n1(atmPct)}% + ${n1(atmCount)} × $${n2(atmFlat)} = $${n2(atmFees)}`,
        `Total = $${n2(cardFees)} + $${n2(atmFees)} = $${n2(total)}`,
      ],
    };
  },
  content: {
    formula: ['Card fees = card spending × card fee rate', 'ATM fees = cash × ATM rate + withdrawals × flat fee', 'Total fees = card fees + ATM fees'],
    body: [
      'Small percentages add up fast on a trip. A 3% foreign transaction fee sounds minor until it is applied to every hotel, meal and train ticket. This calculator adds your card fees and ATM charges together so you can see the full cost before you go.',
      'Every rate here is yours to enter, because fees differ by bank and card. Look in your card agreement or app for the foreign transaction fee and your bank\'s ATM terms. The ATM operator may also charge its own fee, which usually appears on screen before you confirm; add it to the flat fee.',
      'If the total is more than you want to pay, compare it with a card that charges no foreign transaction fee, and take fewer, larger withdrawals to cut the flat fees. Exchange rate markups are not included, since they are built into the rate you are given.',
    ],
    faq: [
      { q: 'How much is a 3% foreign transaction fee on $2,000?', a: 'It is $60. With the default inputs, $400 of ATM cash at 3% plus two $5 withdrawals adds another $22, for $82 in total.' },
      { q: 'How much do ATM fees cost for $200 with one $5 withdrawal?', a: 'With no percentage fee, one $5 flat fee on $200 is 2.5%. Taking out $400 in one go halves that to 1.25%.' },
      { q: 'Does this include the exchange rate markup?', a: 'No. Markups are built into the rate you receive and are not shown as a separate fee. Only the fees you enter are counted.' },
      { q: 'Where do I find my foreign transaction fee?', a: 'In your card agreement or banking app, usually listed as a percentage of each foreign purchase. Many travel cards list 0%.' },
    ],
    sources: [
      { label: 'Consumer Financial Protection Bureau: Using credit and debit cards abroad', url: 'https://www.consumerfinance.gov/' },
    ],
  },
  related: ['credit-card-payoff', 'daily-spending-allowance', 'gift-budget', 'apr'],
  examples: [
    { values: { spend: 2000, feePct: 3, cash: 400, atmPct: 2, atmCount: 2, atmFlat: 5 }, expect: { total: 78, cardFees: 60, atmFees: 18, effective: 3.25 } },
    { values: { spend: 800, feePct: 1.5, cash: 200, atmPct: 0, atmCount: 1, atmFlat: 5 }, expect: { total: 17, cardFees: 12, atmFees: 5, effective: 1.7 } },
    { values: { spend: 1000, feePct: 3, cash: 0, atmPct: 0, atmCount: 0, atmFlat: 0 }, expect: { total: 30, cardFees: 30, atmFees: 0, effective: 3 } },
  ],
});

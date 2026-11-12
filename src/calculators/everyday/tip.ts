import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'tip',
  title: 'Tip Calculator',
  category: 'everyday',
  description: 'Work out the tip and total for a restaurant bill and split it evenly between people.',
  keywords: ['gratuity', 'split the bill', 'restaurant tip', 'how much to tip', 'bill splitter'],
  popular: true,
  inputs: [
    { id: 'bill', label: 'Bill amount', type: 'number', prefix: '$', default: 85, min: 0, step: 0.01, info: 'The total on the check. Many people use the subtotal before tax; either is fine.' },
    { id: 'pct', label: 'Tip', type: 'number', suffix: '%', default: 18, min: 0, step: 1, info: 'The tip as a percentage of the bill. 15–20% is customary for table service in the US.' },
    { id: 'people', label: 'Number of people', type: 'number', default: 2, min: 1, step: 1, info: 'How many people are splitting the bill evenly. Use 1 if you are paying alone.' },
    { id: 'roundUp', label: 'Round each share up to the next dollar', type: 'toggle', default: false, info: 'Rounds every person’s share up to a whole dollar; the extra cents are added to the tip.' },
  ],
  outputs: [
    { id: 'tip', label: 'Tip', format: 'currency', primary: true, info: 'The total tip to leave for the whole table.' },
    { id: 'total', label: 'Total with tip', format: 'currency', info: 'Bill plus tip — the full amount paid.' },
    { id: 'perPerson', label: 'Each person pays', format: 'currency', info: 'Total with tip divided evenly between everyone.' },
    { id: 'tipPerPerson', label: 'Tip per person', format: 'currency', info: 'Each person’s share of the tip.' },
  ],
  compute: (v) => {
    const bill = num(v.bill);
    const pct = num(v.pct);
    const people = num(v.people);
    if (bill === null || pct === null || bill < 0 || pct < 0 || !people || people < 1 || !Number.isInteger(people)) return { tip: null };
    let tip = (bill * pct) / 100;
    let share = (bill + tip) / people;
    let note: string | undefined;
    if (v.roundUp === 'on') {
      const rounded = Math.ceil(share - 1e-9);
      tip += (rounded - share) * people;
      share = rounded;
      if (bill > 0) note = `Rounding up makes the effective tip ${((tip / bill) * 100).toFixed(1)}%.`;
    }
    return {
      tip,
      total: bill + tip,
      perPerson: share,
      tipPerPerson: tip / people,
      chart: {
        type: 'donut',
        title: people > 1 ? 'Each person’s share' : 'What you pay',
        format: { format: 'currency' },
        slices: [
          { label: 'Bill', value: bill / people },
          { label: 'Tip', value: tip / people },
        ],
        centerValue: `$${share.toFixed(2)}`,
        centerLabel: people > 1 ? 'per person' : 'total',
      },
      note,
      steps: [`Tip = $${bill} × ${pct}% = $${((bill * pct) / 100).toFixed(2)}`, `Total ÷ ${people} = $${share.toFixed(2)} each`],
    };
  },
  content: {
    formula: ['Tip = bill × tip % ÷ 100', 'Per person = (bill + tip) ÷ people'],
    body: [
      'Multiply the bill by the tip percentage, add it to the bill and divide by the number of people. Turn on rounding if you would rather each person pays a whole-dollar amount; the extra goes to the tip and the effective percentage is shown.',
      'In the United States, 15–20% is the usual range for table service, with 18–20% now common in cities. Many people tip on the pre-tax amount; if you want to, enter the subtotal before tax as the bill.',
      'Customs differ widely: in much of Europe a service charge is often already included, and in Japan tipping is generally not expected. Check the receipt for a service charge before adding a tip on top.',
    ],
    faq: [
      { q: 'What is a quick way to work out 20% in my head?', a: 'Move the decimal point one place left to get 10%, then double it. For a $64 bill, 10% is $6.40 and 20% is $12.80.' },
      { q: 'Should I tip on tax?', a: 'Etiquette guides generally say tipping on the pre-tax subtotal is fine. The difference is small — on a $100 meal with 8% tax it is about $1.50 at 18%.' },
    ],
  },
  related: ['unit-price', 'percentage', 'hours-worked'],
  examples: [
    { values: { bill: 85, pct: 18, people: 2, roundUp: 'off' }, expect: { tip: 15.3, total: 100.3, perPerson: 50.15, tipPerPerson: 7.65 } },
    { values: { bill: 85, pct: 18, people: 2, roundUp: 'on' }, expect: { perPerson: 51, total: 102, tip: 17 } },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'kids-allowance',
  title: 'Kids Allowance Calculator',
  category: 'finance',
  description: 'Work out a weekly and yearly kids allowance from age and a dollars-per-year-of-age rule, then split it into save, spend and give jars.',
  keywords: ['kids allowance calculator', 'how much allowance by age', 'allowance per year of age', 'save spend give jars', 'weekly allowance calculator', 'child allowance'],
  updated: '2026-11-27',
  inputs: [
    { id: 'age', label: 'Child age', type: 'number', suffix: 'years', default: 9, min: 1, step: 1, info: 'Age in years, at least 1.' },
    { id: 'rate', label: 'Dollars per year of age, per week', type: 'number', prefix: '$', default: 1, min: 0, step: 0.25, info: '$1.00 per year of age per week is a popular folk rule, not an expert standard. Use any rate that suits your household.' },
    { id: 'weeks', label: 'Weeks', type: 'number', default: 52, min: 1, step: 1, info: 'How many weeks of allowance to total. 52 covers a full year.' },
    { id: 'save', label: 'Save jar', type: 'number', suffix: '%', default: 50, min: 0, max: 100, step: 5, info: 'Share put aside. The three shares must total 100.' },
    { id: 'spend', label: 'Spend jar', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 5, info: 'Share for the child to spend freely.' },
    { id: 'give', label: 'Give jar', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 5, info: 'Share set aside for giving to others.' },
  ],
  outputs: [
    { id: 'weekly', label: 'Weekly allowance', format: 'currency', precision: 2, primary: true, info: 'Age × dollars per year of age.' },
    { id: 'yearly', label: 'Total over the weeks', format: 'currency', precision: 2, info: 'Weekly allowance × weeks (a full year if you kept 52).' },
    { id: 'saveWeek', label: 'Save jar, per week', format: 'currency', precision: 2, info: 'Weekly allowance × save percent.' },
    { id: 'spendWeek', label: 'Spend jar, per week', format: 'currency', precision: 2, info: 'Weekly allowance × spend percent.' },
    { id: 'giveWeek', label: 'Give jar, per week', format: 'currency', precision: 2, info: 'Weekly allowance × give percent.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const rate = num(v.rate);
    const weeks = num(v.weeks);
    const save = num(v.save);
    const spend = num(v.spend);
    const give = num(v.give);
    if (age === null || rate === null || weeks === null || save === null || spend === null || give === null) return { weekly: null };
    if (age < 1) return { weekly: null, error: 'Child age must be at least 1.' };
    if (rate < 0) return { weekly: null, error: 'Dollars per year of age cannot be negative.' };
    if (weeks < 1) return { weekly: null, error: 'Weeks must be at least 1.' };
    if (save < 0 || spend < 0 || give < 0) return { weekly: null, error: 'Jar percentages cannot be negative.' };
    const total = save + spend + give;
    if (Math.abs(total - 100) > 1e-9) return { weekly: null, error: `Save, spend and give must total 100%. They currently total ${Math.round(total * 100) / 100}%.` };
    const weekly = age * rate;
    const yearly = weekly * weeks;
    const saveWeek = (weekly * save) / 100;
    const spendWeek = (weekly * spend) / 100;
    const giveWeek = (weekly * give) / 100;
    return {
      weekly, yearly, saveWeek, spendWeek, giveWeek,
      tone: 'ok',
      badge: `${money(weekly)} a week`,
      chart: { type: 'bar', title: `Per-week split of ${money(weekly)}`, categories: ['Save', 'Spend', 'Give'], series: [{ name: 'Per week', values: [saveWeek, spendWeek, giveWeek] }], format: { format: 'currency', precision: 2 } },
      steps: [
        `Weekly = ${age} × ${money(rate)} = ${money(weekly)}`,
        `Total = ${money(weekly)} × ${weeks} weeks = ${money(yearly)}`,
        `Jars per week = ${money(saveWeek)} save (${save}%), ${money(spendWeek)} spend (${spend}%), ${money(giveWeek)} give (${give}%)`,
      ],
      note: 'The per-year-of-age rule is a popular folk rule, not an expert standard. This is arithmetic, not parenting advice.',
    };
  },
  content: {
    formula: [
      'Weekly allowance = age × dollars per year of age',
      'Total = weekly allowance × weeks',
      'Each jar per week = weekly allowance × its percent ÷ 100 (the three percents must total 100)',
    ],
    body: [
      'A common rule of thumb gives a child a set amount per week for each year of age, often $1.00. It is a popular folk rule, not an expert standard, so treat it as a starting point and change the rate to suit your household.',
      'Enter the age, the rate and the number of weeks, then choose how to divide each payment between a save jar, a spend jar and a give jar. The default is 50 / 30 / 20, and the three shares must total 100.',
      'For example, a 9-year-old at $1.00 per year of age gets $9.00 a week, or $468.00 over 52 weeks. Split 50 / 30 / 20, that is $4.50 to save, $2.70 to spend and $1.80 to give each week. A 12-year-old at $1.50 gets $18.00 a week ($936.00 a year), and a 6-year-old at $0.50 gets $3.00 a week ($156.00 a year).',
      'This only does the arithmetic. If you want to see how small regular amounts add up, try the savings challenge calculator, or the daily spending allowance calculator for your own budget.',
    ],
    faq: [
      { q: 'How much allowance for a 9-year-old at $1.00 per year of age?', a: '$9.00 a week, or $468.00 over 52 weeks.' },
      { q: 'How is the 50 / 30 / 20 split worked out for that $9.00?', a: 'Each jar is the weekly allowance times its percent: $4.50 to save, $2.70 to spend and $1.80 to give.' },
      { q: 'What does a 12-year-old get at $1.50 per year of age?', a: '$18.00 a week, which is $936.00 over 52 weeks.' },
      { q: 'What does a 6-year-old get at $0.50 per year of age?', a: '$3.00 a week, which is $156.00 over 52 weeks.' },
      { q: 'Is the dollar-per-year-of-age rule an expert standard?', a: 'No. It is a popular folk rule, not an expert standard. Families choose amounts that fit their budget and values.' },
      { q: 'Why does the calculator show an error about percentages?', a: 'Save, spend and give must total exactly 100%. Adjust the three shares until they do.' },
    ],
    sources: [],
  },
  related: ['savings-challenge', 'daily-spending-allowance'],
  examples: [
    // weekly 9 × 1 = 9; yearly 9 × 52 = 468; jars 9 × .5 = 4.5, 9 × .3 = 2.7, 9 × .2 = 1.8
    { values: { age: 9, rate: 1, weeks: 52, save: 50, spend: 30, give: 20 }, expect: { weekly: 9, yearly: 468, saveWeek: 4.5, spendWeek: 2.7, giveWeek: 1.8 }, tolerance: 1e-9 },
    // 12 × 1.5 = 18; 18 × 52 = 936
    { values: { age: 12, rate: 1.5, weeks: 52, save: 50, spend: 30, give: 20 }, expect: { weekly: 18, yearly: 936 }, tolerance: 1e-9 },
    // 6 × 0.5 = 3; 3 × 52 = 156
    { values: { age: 6, rate: 0.5, weeks: 52, save: 50, spend: 30, give: 20 }, expect: { weekly: 3, yearly: 156 }, tolerance: 1e-9 },
  ],
});

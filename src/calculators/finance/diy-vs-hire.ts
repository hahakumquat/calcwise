import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'diy-vs-hire',
  title: 'DIY vs Hire a Pro Calculator',
  category: 'finance',
  description: 'Compare doing a job yourself with a contractor quote, counting materials, tools and the value of your time, and find the hourly rate where it breaks even.',
  keywords: ['diy vs hire calculator', 'should i diy or hire', 'diy cost vs contractor', 'is diy worth it', 'diy break even hourly rate', 'hire a pro or do it myself'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'quote', label: 'Contractor quote', type: 'number', prefix: '$', default: 600, min: 0, step: 10, info: 'The all-in price to hire someone.' },
    { id: 'materials', label: 'Materials you would buy', type: 'number', prefix: '$', default: 120, min: 0, step: 5, optional: true, info: 'Materials for doing it yourself. Leave blank for none.' },
    { id: 'tools', label: 'Tools you would need to buy or rent', type: 'number', prefix: '$', default: 80, min: 0, step: 5, optional: true, info: 'Only tools you do not already own.' },
    { id: 'hours', label: 'Hours it would take you', type: 'number', default: 8, min: 0.25, step: 0.25, suffix: 'hours', info: 'Include shopping trips and clean-up. Be honest: first-timers are slower.' },
    { id: 'rate', label: 'What an hour of your time is worth', type: 'number', prefix: '$', default: 25, min: 0, step: 1, optional: true, info: 'Your own figure. Use 0 if the time is free to you.' },
  ],
  outputs: [
    { id: 'savings', label: 'DIY saves (or costs)', format: 'currency', precision: 2, primary: true, info: 'Quote minus total DIY cost. Negative means hiring is cheaper.' },
    { id: 'diyCost', label: 'Total DIY cost', format: 'currency', precision: 2, info: 'Materials + tools + hours × your rate.' },
    { id: 'breakEven', label: 'Break-even hourly value', format: 'currency', precision: 2, info: '(Quote − materials − tools) ÷ hours.' },
  ],
  compute: (v) => {
    const quote = num(v.quote);
    const materials = num(v.materials) ?? 0;
    const tools = num(v.tools) ?? 0;
    const hours = num(v.hours);
    const rate = num(v.rate) ?? 0;
    if (quote === null || hours === null) return { savings: null };
    if (quote < 0 || materials < 0 || tools < 0 || rate < 0) return { savings: null };
    if (hours <= 0) return { savings: null, error: 'Enter the hours it would take, above zero.' };
    const time = hours * rate;
    const diyCost = materials + tools + time;
    const savings = quote - diyCost;
    const breakEven = (quote - materials - tools) / hours;
    const verdict = breakEven <= 0
      ? 'Doing it yourself costs more than the quote even if your time is free.'
      : `Doing it yourself pays if an hour of your time is worth less than ${money(breakEven)}.`;
    return {
      savings,
      diyCost,
      breakEven,
      tone: savings >= 0 ? 'good' : 'bad',
      badge: savings >= 0 ? `DIY saves ${money(savings)}` : `Hire saves ${money(-savings)}`,
      note: `DIY costs ${money(diyCost)} (${money(materials)} materials, ${money(tools)} tools, ${money(time)} of time) against a ${money(quote)} quote. ${verdict}`,
      chart: {
        type: 'bar',
        title: 'DIY vs hire',
        categories: ['Hire a pro', 'DIY'],
        series: [{ name: 'Cost', values: [quote, diyCost] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `DIY cost = ${money(materials)} + ${money(tools)} + ${fmt(hours)} × ${money(rate)} = ${money(diyCost)}`,
        `Savings = ${money(quote)} − ${money(diyCost)} = ${money(savings)}`,
        `Break-even = (${money(quote)} − ${money(materials)} − ${money(tools)}) ÷ ${fmt(hours)} = ${money(breakEven)} an hour`,
      ],
    };
  },
  content: {
    formula: [
      'DIY cost = materials + tools + hours × your hourly value',
      'Savings = contractor quote − DIY cost',
      'Break-even rate = (quote − materials − tools) ÷ hours',
    ],
    body: [
      'A quote looks expensive until you count what the job costs you: materials, tools you do not own yet, and the hours. This calculator puts a price on your time so the comparison is fair, and gives you the hourly value at which doing it yourself stops paying.',
      'Example: a $600 quote against $120 of materials, $80 of tools and 8 hours at $25 an hour. DIY costs $120 + $80 + $200 = $400, so it saves $200. The break-even is ($600 − $120 − $80) ÷ 8 = $50 an hour: if your time is worth more than that, hire.',
      'What an hour is worth to you is your own call, so nothing is assumed. The figure ignores risk, warranty, permits and the chance of redoing the job, which can tilt the choice towards hiring. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is it cheaper to DIY or hire a contractor?', a: 'Compare the quote with materials + tools + your hours × your hourly value. In the example, DIY costs $400 against a $600 quote.' },
      { q: 'What is the break-even hourly rate?', a: '(Quote − materials − tools) ÷ hours. In the example it is $50 an hour: above that, hiring is cheaper.' },
      { q: 'What if the break-even is zero or negative?', a: 'Then the materials and tools alone cost as much as the quote, so DIY is dearer even if your time is free.' },
      { q: 'Should I count tools I already own?', a: 'No. Only count tools you would have to buy or rent for this job.' },
    ],
    sources: [],
  },
  related: ['hours-of-work-cost', 'freelance-rate', 'salary-to-hourly', 'lifestyle-creep', 'gas-cost'],
  examples: [
    // diy 120+80+8*25 = 400; savings 200; break-even (600-120-80)/8 = 50
    { values: { quote: 600, materials: 120, tools: 80, hours: 8, rate: 25 }, expect: { diyCost: 400, savings: 200, breakEven: 50 }, tolerance: 1e-6 },
    // quote 100, materials 150: break-even (100-150)/2 = -25; diy 150+2*0 = 150; savings -50
    { values: { quote: 100, materials: 150, tools: 0, hours: 2, rate: 0 }, expect: { diyCost: 150, savings: -50, breakEven: -25 }, tolerance: 1e-6 },
  ],
});

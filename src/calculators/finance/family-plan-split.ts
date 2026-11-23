import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'family-plan-split',
  title: 'Family Plan Split Calculator',
  category: 'finance',
  description: 'Is a shared family plan cheaper than solo plans? See what each person pays, the yearly saving for the group and how many members it takes to break even.',
  keywords: ['family plan calculator', 'family plan vs individual', 'is a family plan worth it', 'split family plan cost', 'shared subscription split', 'family plan break even'],
  updated: '2026-11-23',
  popular: false,
  inputs: [
    { id: 'plan', label: 'Family plan price per month', type: 'number', prefix: '$', default: 22, min: 0, step: 0.01, info: 'What the shared plan costs each month in total, including any tax your bill shows.' },
    { id: 'people', label: 'People sharing the plan', type: 'number', default: 4, min: 1, step: 1, info: 'How many people will split the plan, including you. Must be a whole number and no more than the maximum seats.' },
    { id: 'solo', label: 'Solo plan price per month', type: 'number', prefix: '$', default: 11, min: 0, step: 0.01, info: 'What one person pays for their own individual plan each month.' },
    { id: 'seats', label: 'Maximum seats on the plan', type: 'number', default: 6, min: 1, max: 20, step: 1, optional: true, info: 'The most people the family plan allows. Leave blank for 6. Check the plan terms, because many require a shared household.' },
  ],
  outputs: [
    { id: 'each', label: 'Each person pays per month', format: 'currency', primary: true, info: 'Family plan price ÷ number of people.' },
    { id: 'savePerPerson', label: 'Saving per person per month', format: 'currency', info: 'Solo price − what each person pays on the family plan. Negative means the family plan costs more.' },
    { id: 'saveYear', label: 'Group saving per year', format: 'currency', info: '(Solo price × people − family plan price) × 12. Negative means the group pays more.' },
    { id: 'breakEven', label: 'Break-even members', format: 'integer', info: 'The smallest number of people at which the family plan costs no more than everyone buying solo: family plan price ÷ solo price, rounded up.' },
  ],
  compute: (v) => {
    const plan = num(v.plan);
    const people = num(v.people);
    const solo = num(v.solo);
    const seats = num(v.seats) ?? 6;
    if (plan === null || people === null || solo === null) return { each: null };
    if (plan < 0 || solo < 0) return { each: null };
    if (plan === 0 && solo === 0) return { each: null, error: 'Enter a plan price or a solo price above $0.' };
    if (!Number.isInteger(people) || people < 1) return { each: null, error: 'Enter a whole number of people, at least 1.' };
    if (!Number.isInteger(seats) || seats < 1 || seats > 20) return { each: null, error: 'Choose a maximum of 1 to 20 whole seats.' };
    if (people > seats) return { each: null, error: `The plan allows ${seats} seats, but you entered ${people} people.` };
    if (solo === 0) return { each: null, error: 'Enter a solo plan price above $0 to compare.' };

    const each = plan / people;
    const savePerPerson = solo - each;
    const saveYear = (solo * people - plan) * 12;
    // Round off float noise (e.g. 22 / 11) before taking the ceiling.
    const breakEven = Math.max(1, Math.ceil(Math.round((plan / solo) * 1e9) / 1e9));
    const fits = breakEven <= seats;

    const tone: 'good' | 'ok' | 'warn' | 'bad' = saveYear > 0 ? 'good' : saveYear === 0 ? 'ok' : 'bad';
    const badge =
      saveYear > 0 ? `Saves ${money(saveYear, 0)} a year`
        : saveYear === 0 ? 'Same cost as solo plans'
          : `Costs ${money(-saveYear, 0)} a year more`;
    const beNote = fits
      ? `It breaks even at ${breakEven} ${breakEven === 1 ? 'person' : 'people'}.`
      : `It would take ${breakEven} people to break even, but the plan only allows ${seats}, so it cannot beat solo plans.`;
    const note = saveYear >= 0
      ? `Each of ${people} people pays ${money(each)} a month instead of ${money(solo)}, saving ${money(savePerPerson)} each and ${money(saveYear, 0)} a year as a group. ${beNote}`
      : `Each of ${people} people pays ${money(each)} a month, which is ${money(-savePerPerson)} more than a ${money(solo)} solo plan. As a group that is ${money(-saveYear, 0)} a year extra. ${beNote}`;

    const categories = Array.from({ length: seats }, (_, i) => String(i + 1));
    return {
      each,
      savePerPerson,
      saveYear,
      breakEven,
      tone,
      badge,
      chart: {
        type: 'bar',
        title: 'Price per person per month, by number of people sharing',
        categories,
        series: [
          { name: 'Family plan, per person', values: categories.map((_, i) => plan / (i + 1)) },
          { name: 'Solo plan', values: categories.map(() => solo) },
        ],
        format: { format: 'currency' },
        highlight: people - 1,
      },
      steps: [
        `Per person = ${money(plan)} ÷ ${people} = ${money(each)} a month`,
        `Saving per person = ${money(solo)} − ${money(each)} = ${money(savePerPerson)} a month`,
        `Group saving = (${money(solo)} × ${people} − ${money(plan)}) × 12 = ${money(saveYear)} a year`,
        `Break-even = ${money(plan)} ÷ ${money(solo)} = ${(plan / solo).toFixed(2)}, rounded up to ${breakEven}`,
      ],
      note,
    };
  },
  content: {
    formula: [
      'Per person = family plan price ÷ people sharing',
      'Saving per person per month = solo price − per-person price',
      'Group saving per year = (solo price × people − family plan price) × 12',
      'Break-even members = family plan price ÷ solo price, rounded up',
    ],
    body: [
      'A family plan charges one price for several people, so the more people who share it, the less each person pays. Whether it beats solo plans depends on one thing: does the shared price, divided by the number of people, come in under what each person would pay alone?',
      'Take a $22 family plan shared by 4 people against an $11 solo plan. Each person pays $22 ÷ 4 = $5.50 a month, saving $5.50 each. Everyone buying solo would pay $44 a month, so the group saves $22 a month, which is $264 a year.',
      'The break-even number tells you how many people you need. It is the family plan price divided by the solo price, rounded up. At $22 and $11 that is 2, so even two people sharing pay no more than two solo plans. If the answer is bigger than the seats the plan offers, the family plan can never be cheaper than solo plans at those prices.',
      'The chart shows the price per person for every headcount from 1 up to the maximum seats, next to the solo price. Where the bar drops below the solo price, sharing wins. This calculator uses the prices you type in and makes no claim about any specific brand or service.',
    ],
    sections: [
      {
        heading: 'Check the rules before you split',
        paragraphs: [
          'Many family plans require everyone to live at the same address or belong to the same household, and some limit who can be added or how often members can change. Read the plan terms before you count on a saving.',
          'Also agree up front who pays whom and what happens if someone leaves. If a member drops out, the plan price stays the same and each remaining person pays more. Enter the smaller headcount here to see by how much.',
        ],
      },
    ],
    faq: [
      { q: 'How much does each person pay on a $22 family plan shared by 4?', a: 'Each person pays $22 ÷ 4 = $5.50 a month. Against an $11 solo plan, that saves $5.50 per person per month.' },
      { q: 'How much does the group save in a year?', a: 'Group saving = (solo price × people − family plan price) × 12. For 4 people, an $11 solo plan and a $22 family plan that is ($44 − $22) × 12 = $264 a year.' },
      { q: 'How many people do I need for a family plan to be worth it?', a: 'Divide the family plan price by the solo price and round up. $22 ÷ $11 = 2, so 2 people is the break-even point. If the result is higher than the plan\'s maximum seats, the plan can\'t be cheaper than solo plans.' },
      { q: 'Does this account for plan rules, such as sharing a household?', a: 'No. It only does the arithmetic on the prices you enter. Check the plan terms for household or location rules, and for how many people it truly allows, before you rely on the saving.' },
    ],
    sources: [
      { label: 'CFPB: Consumer tools', url: 'https://www.consumerfinance.gov/consumer-tools/' },
      { label: 'FTC: Consumer advice on subscriptions', url: 'https://consumer.ftc.gov/' },
    ],
  },
  related: ['subscription-cost', 'bill-splitter', 'income-based-bill-split', 'bill-negotiation-savings'],
  examples: [
    {
      // $22 plan, 4 people: 22 ÷ 4 = 5.50 each; 11 − 5.50 = 5.50 saved; (11 × 4 − 22) × 12 = 22 × 12 = 264; ceil(22 ÷ 11) = 2.
      values: { plan: 22, people: 4, solo: 11, seats: 6 },
      expect: { each: 5.5, savePerPerson: 5.5, saveYear: 264, breakEven: 2 },
      tolerance: 1e-6,
    },
    {
      // $30 plan, 2 people, $12 solo: 30 ÷ 2 = 15; 12 − 15 = −3; (24 − 30) × 12 = −72; ceil(30 ÷ 12 = 2.5) = 3.
      values: { plan: 30, people: 2, solo: 12, seats: 6 },
      expect: { each: 15, savePerPerson: -3, saveYear: -72, breakEven: 3 },
      tolerance: 1e-6,
    },
    {
      // $20 plan, 3 people, $10 solo: 20 ÷ 3 = 6.6667; 10 − 6.6667 = 3.3333; (30 − 20) × 12 = 120; ceil(2) = 2.
      values: { plan: 20, people: 3, solo: 10 },
      expect: { each: 6.6667, savePerPerson: 3.3333, saveYear: 120, breakEven: 2 },
      tolerance: 1e-3,
    },
  ],
});

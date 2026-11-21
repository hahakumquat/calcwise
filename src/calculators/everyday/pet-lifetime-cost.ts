import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'pet-lifetime-cost',
  title: 'Lifetime Pet Cost Calculator',
  category: 'everyday',
  description: 'Add up what a pet will cost over its life: enter your monthly and yearly costs, setup and expected years to see the total and cost per day.',
  keywords: ['lifetime cost of a pet', 'how much does a dog cost', 'pet cost calculator', 'cost of owning a cat', 'pet ownership budget', 'puppy cost calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'setup', label: 'One-off setup costs', type: 'number', prefix: '$', default: 800, min: 0, step: 50, optional: true, info: 'Adoption or purchase fee, first vet visits, crate or litter box, supplies.' },
    { id: 'monthly', label: 'Monthly costs', type: 'number', prefix: '$', default: 120, min: 0, step: 5, info: 'Food, treats, litter, flea and tick prevention, and anything else you pay every month.' },
    { id: 'yearly', label: 'Yearly costs', type: 'number', prefix: '$', default: 600, min: 0, step: 25, optional: true, info: 'Vet checkups, vaccines, insurance, licences and boarding added up per year.' },
    { id: 'years', label: 'Years you expect to have them', type: 'number', default: 12, min: 1, max: 40, step: 1, info: 'Your own estimate of how long the pet will live with you.' },
  ],
  outputs: [
    { id: 'total', label: 'Total lifetime cost', format: 'currency', primary: true, info: 'Setup + (monthly × 12 + yearly) × years.' },
    { id: 'perYear', label: 'Per year (running costs)', format: 'currency', info: 'Monthly × 12 + yearly.' },
    { id: 'perMonth', label: 'Per month, averaged', format: 'currency', info: 'Total ÷ (years × 12), setup included.' },
    { id: 'perDay', label: 'Per day, averaged', format: 'currency', info: 'Total ÷ (years × 365), setup included.' },
  ],
  compute: (v) => {
    const setup = num(v.setup) ?? 0;
    const monthly = num(v.monthly);
    const yearly = num(v.yearly) ?? 0;
    const years = num(v.years);
    if (monthly === null || years === null) return { total: null };
    if (setup < 0 || monthly < 0 || yearly < 0 || years < 1) return { total: null };
    const perYear = monthly * 12 + yearly;
    const running = perYear * years;
    const total = setup + running;
    const perMonth = total / (years * 12);
    const perDay = total / (years * 365);
    return {
      total,
      perYear,
      perMonth,
      perDay,
      tone: 'ok',
      badge: `${money(total, 0)} over ${years} ${years === 1 ? 'year' : 'years'}`,
      note: `Running costs of ${money(perYear)} a year for ${years} years come to ${money(running)}. Add ${money(setup)} of setup and the total is ${money(total)}, about ${money(perDay)} a day.`,
      chart: {
        type: 'bar',
        title: 'Where the money goes',
        categories: ['Setup', 'Monthly costs', 'Yearly costs'],
        series: [{ name: 'Lifetime', values: [+setup.toFixed(2), +(monthly * 12 * years).toFixed(2), +(yearly * years).toFixed(2)] }],
        format: { format: 'currency' },
        highlight: 1,
      },
      steps: [
        `Per year = ${money(monthly)} × 12 + ${money(yearly)} = ${money(perYear)}`,
        `Running = ${money(perYear)} × ${years} = ${money(running)}`,
        `Total = ${money(setup)} + ${money(running)} = ${money(total)}`,
        `Per day = ${money(total)} ÷ (${years} × 365) = ${money(perDay)}`,
      ],
    };
  },
  content: {
    formula: [
      'Per year = monthly × 12 + yearly',
      'Total = setup + per year × years',
      'Per day = total ÷ (years × 365)',
    ],
    body: [
      'Every number here is yours. Fill in what you actually expect to pay for food, vet care, insurance and supplies, and how many years you expect the pet to be with you. The calculator does not quote averages for any breed or species.',
      'The total is a floor, not a forecast. Emergency vet bills, price rises and a longer life than expected all push it up, so consider rounding your inputs up. Prices are held flat in this calculator and nothing is adjusted for inflation.',
      'It is meant for thinking before you adopt, not for talking you out of it. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How is the lifetime cost of a pet calculated?', a: 'Running costs per year (monthly costs × 12 plus yearly costs) are multiplied by the years, then setup is added. With $800 setup, $120 a month, $600 a year and 12 years: $2,040 × 12 = $24,480 + $800 = $25,280.' },
      { q: 'Does it include inflation?', a: 'No. Prices stay flat, so real costs will probably be higher. Use higher inputs to be safe.' },
      { q: 'What goes in monthly versus yearly costs?', a: 'Put regular small costs like food and litter in monthly, and lumpy ones like vet checkups, insurance and boarding in yearly.' },
      { q: 'Does it include emergency vet bills?', a: 'Only if you add an allowance to the yearly costs. Emergencies are hard to predict, so many owners set money aside or buy insurance.' },
    ],
    sources: [],
  },
  related: ['pet-food-duration', 'dog-age-human', 'sinking-fund', 'cost-per-use'],
  examples: [
    // per year = 120*12+600 = 2040; *12 = 24480; +800 = 25280; /144 = 175.5556; /4380 = 5.7717.
    { values: { setup: 800, monthly: 120, yearly: 600, years: 12 }, expect: { total: 25280, perYear: 2040, perMonth: 175.5556, perDay: 5.7717 }, tolerance: 1e-3 },
    // 0 setup, $50/mo, 0 yearly, 10y = 6000; /3650 = 1.6438.
    { values: { setup: 0, monthly: 50, yearly: 0, years: 10 }, expect: { total: 6000, perYear: 600, perDay: 1.6438 }, tolerance: 1e-3 },
  ],
});

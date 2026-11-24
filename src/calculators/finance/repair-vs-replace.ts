import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'repair-vs-replace',
  title: 'Repair or Replace an Appliance Calculator',
  category: 'finance',
  description: 'Compare the cost per year of repairing a broken appliance with replacing it, including the repair as a share of the new price and any energy savings.',
  keywords: ['repair or replace appliance', 'is it worth repairing', 'repair vs replace calculator', 'replace water heater or repair', '50 percent rule appliance'],
  updated: '2026-11-24',
  inputs: [
    { id: 'repair', label: 'Repair quote', type: 'number', prefix: '$', default: 350, min: 0, step: 10, info: 'Parts and labor to fix it.' },
    { id: 'repairYears', label: 'Extra years the repair should buy', type: 'number', suffix: 'years', default: 3, min: 0.5, max: 30, step: 0.5, info: 'Your best guess at how much longer it will last once fixed.' },
    { id: 'price', label: 'New appliance price', type: 'number', prefix: '$', default: 900, min: 0, step: 10, info: 'Including delivery and installation if you pay for them.' },
    { id: 'newYears', label: 'Years the new one should last', type: 'number', suffix: 'years', default: 10, min: 0.5, max: 40, step: 0.5, info: 'Your best guess at its lifespan.' },
    { id: 'saving', label: 'Yearly running-cost saving from the new one', type: 'number', prefix: '$', default: 30, min: 0, step: 5, optional: true, info: 'Lower energy or water bills compared with the old one. Leave blank for none.' },
  ],
  outputs: [
    { id: 'diff', label: 'Repair costs more a year', format: 'currency', primary: true, info: 'Repair per year − new per year. Negative means repairing is cheaper per year.' },
    { id: 'repairYear', label: 'Repair per year', format: 'currency', info: 'Repair quote ÷ extra years.' },
    { id: 'newYear', label: 'New appliance per year', format: 'currency', info: 'Price ÷ years − yearly saving.' },
    { id: 'pct', label: 'Repair as share of new price', format: 'percent', info: 'Repair quote ÷ new price.' },
  ],
  compute: (v) => {
    const repair = num(v.repair);
    const repairYears = num(v.repairYears);
    const price = num(v.price);
    const newYears = num(v.newYears);
    const saving = v.saving === undefined || v.saving === '' ? 0 : num(v.saving);
    if (repair === null || repairYears === null || price === null || newYears === null || saving === null) return { diff: null };
    if (repair < 0 || price < 0 || saving < 0) return { diff: null, error: 'Money amounts cannot be negative.' };
    if (repairYears <= 0 || newYears <= 0) return { diff: null, error: 'Years must be above 0.' };
    if (price === 0) return { diff: null, error: 'Enter the price of the new appliance.' };
    const repairYear = repair / repairYears;
    const newYear = price / newYears - saving;
    const diff = repairYear - newYear;
    const pct = repair / price;
    const repairWins = diff <= 0;
    return {
      diff, repairYear, newYear, pct,
      tone: repairWins ? 'good' : 'warn',
      badge: repairWins
        ? `Repairing is ${usd(-diff)} a year cheaper`
        : `Replacing is ${usd(diff)} a year cheaper`,
      chart: {
        type: 'bar',
        title: 'Cost per year',
        categories: ['Repair', 'Replace'],
        series: [{ name: 'Per year', values: [repairYear, newYear] }],
        format: { format: 'currency' },
      },
      steps: [
        `Repair per year: ${usd(repair)} ÷ ${repairYears} years = ${usd(repairYear)}`,
        `New per year: ${usd(price)} ÷ ${newYears} years − ${usd(saving)} saving = ${usd(newYear)}`,
        `Difference: ${usd(repairYear)} − ${usd(newYear)} = ${usd(diff)} a year`,
        `Repair is ${(pct * 100).toFixed(1)}% of the new price. A common rule of thumb says to replace above 50%, but it ignores lifespans.`,
      ],
      note: 'Lifespans are your own guesses. Warranty on the repair or the new unit, disposal fees and the cash you need up front are not modelled. Replacing costs the full price now, repairing only the quote.',
    };
  },
  content: {
    formula: [
      'Repair per year = repair quote ÷ extra years it buys',
      'New per year = price ÷ years it should last − yearly running-cost saving',
      'Repair as share of new price = repair quote ÷ new price',
    ],
    body: [
      'When a furnace, water heater or dryer breaks, the real question is which option costs less for each year of use. A cheap repair that buys a few years often beats a new unit, and an expensive one on an old machine often does not.',
      'This calculator divides each option by the years you expect from it. A newer appliance may also use less energy or water, so you can subtract that saving from its yearly cost.',
      'The "50% rule" says to replace when the repair is more than half the price of a new one. It is a rough rule of thumb. The share is shown here, but the per-year comparison uses your own lifespan guesses and is usually more telling.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A $350 repair that buys 3 years costs $116.67 a year. A $900 appliance that lasts 10 years with $30 a year in savings costs $60 a year. Replacing is $56.67 a year cheaper, but needs $900 up front. The repair is 38.9% of the new price.' },
      { q: 'Is the 50% rule right?', a: 'It is only a rule of thumb. It ignores how old the appliance is and how long a repair will last. Use it as a quick flag, then check the per-year figures.' },
      { q: 'How do I guess lifespans?', a: 'Ask the repair technician how long the fix should hold, and check typical lifespans for that appliance type. Try a cautious and an optimistic guess to see if the answer changes.' },
      { q: 'Does it count installation or disposal?', a: 'Not separately. Add delivery, installation and haul-away to the new price yourself.' },
    ],
    sources: [],
  },
  related: ['keep-vs-replace-car', 'energy-upgrade-payback', 'diy-vs-hire'],
  examples: [
    // repair 350/3=116.6667; new 900/10-30=60; diff 56.6667; pct 38.8889
    { values: { repair: 350, repairYears: 3, price: 900, newYears: 10, saving: 30 }, expect: { repairYear: 116.6667, newYear: 60, diff: 56.6667, pct: 0.388889 }, tolerance: 0.01 },
    // repair 500/2=250; new 800/8=100; diff 150; pct 62.5
    { values: { repair: 500, repairYears: 2, price: 800, newYears: 8, saving: 0 }, expect: { repairYear: 250, newYear: 100, diff: 150, pct: 0.625 }, tolerance: 0.01 },
  ],
});

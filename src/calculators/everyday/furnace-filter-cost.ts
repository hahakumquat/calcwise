import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'furnace-filter-cost',
  title: 'Furnace Filter Cost per Year Calculator',
  category: 'everyday',
  description: 'Work out what furnace or HVAC filters cost per year and per month from price, filters per change and days between changes, and compare two filter options.',
  keywords: ['furnace filter cost per year', 'hvac filter cost calculator', 'cheap vs expensive furnace filter', 'how much do furnace filters cost', 'air filter change cost', 'filter cost per month'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'price', label: 'Filter price', type: 'number', default: 8, min: 0, step: 0.5, prefix: '$', info: 'Price of one filter.' },
    { id: 'count', label: 'Filters per change', type: 'number', default: 1, min: 1, step: 1, info: 'How many filters you replace each time (some systems use two).' },
    { id: 'days', label: 'Days between changes', type: 'number', default: 60, min: 1, step: 5, suffix: 'days', info: 'Take this from the filter label or your HVAC advice. Nothing is built in.' },
    { id: 'priceB', label: 'Option B filter price', type: 'number', default: 22, min: 0, step: 0.5, prefix: '$', optional: true, info: 'Optional. Price of a second filter to compare. Leave blank to skip.' },
    { id: 'daysB', label: 'Option B days between changes', type: 'number', default: 180, min: 1, step: 5, suffix: 'days', optional: true, info: 'Optional. How often option B is changed.' },
  ],
  outputs: [
    { id: 'annual', label: 'Cost per year', format: 'currency', primary: true, info: 'Changes per year × filters × price.' },
    { id: 'monthly', label: 'Cost per month', format: 'currency', info: 'Yearly cost ÷ 12.' },
    { id: 'changes', label: 'Changes per year', format: 'number', precision: 2, info: '365 ÷ days between changes.' },
    { id: 'annualB', label: 'Option B per year', format: 'currency', info: 'Same calculation for option B.' },
    { id: 'diff', label: 'Option A minus B per year', format: 'currency', info: 'Positive means A costs more than B each year.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const count = num(v.count);
    const days = num(v.days);
    if (price === null || price < 0) return { annual: null, error: 'Enter the filter price.' };
    if (count === null || count < 1) return { annual: null, error: 'Enter how many filters you change at once.' };
    if (days === null || days <= 0) return { annual: null, error: 'Enter the days between changes.' };
    const changes = 365 / days;
    const annual = changes * count * price;
    const monthly = annual / 12;
    const priceB = num(v.priceB);
    const daysB = num(v.daysB);
    const hasB = priceB !== null && daysB !== null;
    if (hasB && (priceB < 0 || daysB <= 0)) return { annual: null, error: 'Option B needs a price and days above zero, or leave both blank.' };
    const changesB = hasB ? 365 / daysB : 0;
    const annualB = hasB ? changesB * count * priceB : null;
    const diff = annualB === null ? null : annual - annualB;
    const steps = [
      `Changes per year = 365 ÷ ${fmt(days, 0)} days = ${fmt(changes, 4)}`,
      `Per year = ${fmt(changes, 4)} × ${fmt(count, 0)} × $${fmt(price)} = $${fmt(annual)}; per month = $${fmt(monthly)}`,
    ];
    if (annualB !== null && diff !== null) steps.push(`Option B = ${fmt(changesB, 4)} × ${fmt(count, 0)} × $${fmt(priceB as number)} = $${fmt(annualB)}; A minus B = $${fmt(diff)}`);
    return {
      annual,
      monthly,
      changes,
      annualB,
      diff,
      tone: 'ok',
      badge: `$${fmt(annual)} a year`,
      note: diff === null
        ? 'The change interval comes from your filter label or HVAC advice. This tool only does the cost arithmetic.'
        : `${diff >= 0 ? 'Option A costs' : 'Option B costs'} $${fmt(Math.abs(diff))} more per year. Cost is only part of the picture: airflow, filtering and your system's manual matter too.`,
      chart: {
        type: 'bar' as const,
        title: 'Filter cost per year',
        categories: annualB === null ? ['Option A'] : ['Option A', 'Option B'],
        series: [{ name: 'Per year', values: annualB === null ? [annual] : [annual, annualB] }],
        format: { format: 'currency' },
      },
      steps,
    };
  },
  content: {
    formula: ['Changes per year = 365 ÷ days between changes', 'Cost per year = changes × filters per change × price', 'Cost per month = cost per year ÷ 12'],
    body: [
      'A cheap filter changed often can cost about the same as a pricier one changed rarely. The way to tell is to turn both into a cost per year. Divide 365 by the days between changes, then multiply by the number of filters and the price.',
      'Example: an $8 filter changed every 60 days is 365 ÷ 60 = 6.08 changes, or $48.67 a year ($4.06 a month). A $22 filter changed every 180 days is 2.03 changes, or $44.61 a year. In that case the cheap filter costs $4.06 more per year.',
      'How often to change a filter comes from the label or your HVAC maker, so no interval is built in. This compares cost only, not airflow or filtering quality. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much do furnace filters cost per year?', a: 'Changes per year times filters times price. An $8 filter changed every 60 days costs 6.08 × $8 = $48.67 a year.' },
      { q: 'Is a pricey filter cheaper in the long run?', a: 'Only if it lasts long enough. A $22 filter changed every 180 days costs $44.61 a year, less than an $8 filter changed every 60 days at $48.67.' },
      { q: 'How often should I change my filter?', a: 'Follow the filter label and your HVAC maker\'s advice. This calculator does not recommend an interval.' },
      { q: 'What if my system uses two filters?', a: 'Set filters per change to 2. $15 each every 90 days costs 4.06 × 2 × $15 = $121.67 a year.' },
      { q: 'Does this include energy costs?', a: 'No. It covers the filters only, not how they affect airflow or your energy bill.' },
    ],
    sources: [
      { label: 'U.S. Department of Energy: Furnaces and boilers', url: 'https://www.energy.gov/energysaver/furnaces-and-boilers' },
    ],
  },
  related: ['heating-cost', 'energy-upgrade-payback', 'electricity-cost'],
  examples: [
    // 365/60 = 6.083333; *8 = 48.666667; /12 = 4.055556; B: 365/180 = 2.027778 *22 = 44.611111; diff 4.055556
    { values: { price: 8, count: 1, days: 60, priceB: 22, daysB: 180 }, expect: { annual: 48.666667, monthly: 4.055556, changes: 6.083333, annualB: 44.611111, diff: 4.055556 }, tolerance: 1e-5 },
    // 365/90 = 4.055556 *2 *15 = 121.666667; /12 = 10.138889
    { values: { price: 15, count: 2, days: 90 }, expect: { annual: 121.666667, monthly: 10.138889, changes: 4.055556 }, tolerance: 1e-5 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const blank = (x: unknown) => x === '' || x === undefined || x === null;

export default defineCalculator({
  slug: 'price-per-square-foot',
  title: 'Price Per Square Foot Calculator',
  category: 'finance',
  description: 'Divide a home price by its square footage, compare two listings per square foot, or work out rent per square foot per month and per year.',
  keywords: ['price per square foot calculator', 'cost per square foot', 'home price per sq ft', 'rent per square foot', 'compare listings'],
  updated: '2026-11-27',
  inputs: [
    { id: 'priceA', label: 'Listing A price', type: 'number', prefix: '$', default: 450000, min: 0, step: 1000, info: 'The asking or sale price of the first home.' },
    { id: 'sqftA', label: 'Listing A size', type: 'number', suffix: 'sq ft', default: 1800, min: 0, step: 10, info: 'Living area of the first home in square feet, as stated in the listing.' },
    { id: 'priceB', label: 'Listing B price (optional)', type: 'number', prefix: '$', default: 520000, min: 0, step: 1000, optional: true, help: 'Fill in B to compare two listings.', info: 'The asking or sale price of a second home to compare. Leave blank to skip.' },
    { id: 'sqftB', label: 'Listing B size (optional)', type: 'number', suffix: 'sq ft', default: 2100, min: 0, step: 10, optional: true, info: 'Living area of the second home in square feet.' },
    { id: 'rent', label: 'Monthly rent (optional)', type: 'number', prefix: '$', min: 0, step: 50, optional: true, help: 'Fill in rent and size to see rent per square foot.', info: 'Monthly rent for the rental you want to measure. Leave blank to skip.' },
    { id: 'sqftRent', label: 'Rental size (optional)', type: 'number', suffix: 'sq ft', min: 0, step: 10, optional: true, info: 'Size of the rental in square feet.' },
  ],
  outputs: [
    { id: 'ppsfA', label: 'Listing A per sq ft', format: 'currency', primary: true, info: 'Listing A price divided by its square footage.' },
    { id: 'ppsfB', label: 'Listing B per sq ft', format: 'currency', info: 'Listing B price divided by its square footage.' },
    { id: 'diff', label: 'B minus A, per sq ft', format: 'currency', info: 'Listing B per sq ft minus listing A per sq ft. Negative means B is cheaper per square foot.' },
    { id: 'diffPct', label: 'B vs A, percent', format: 'percent', precision: 2, info: 'The difference as a share of listing A per sq ft. Negative means B is cheaper.' },
    { id: 'rentMonth', label: 'Rent per sq ft per month', format: 'currency', info: 'Monthly rent divided by square footage.' },
    { id: 'rentYear', label: 'Rent per sq ft per year', format: 'currency', info: 'Rent per sq ft per month times 12.' },
  ],
  compute: (v) => {
    const pA = num(v.priceA), sA = num(v.sqftA);
    if (pA === null || sA === null || pA < 0 || sA <= 0) return { ppsfA: null };
    const ppsfA = pA / sA;
    const out: Record<string, number> = { ppsfA };
    const steps = [`Listing A: $${fmt(pA, 0)} ÷ ${fmt(sA, 0)} sq ft = $${fmt(ppsfA)} per sq ft`];
    let note = `Listing A costs $${fmt(ppsfA)} per square foot.`;
    let badge = `$${fmt(ppsfA)}/sq ft`;
    const cats = ['Listing A'];
    const vals = [+ppsfA.toFixed(2)];

    if (!blank(v.priceB) || !blank(v.sqftB)) {
      const pB = num(v.priceB), sB = num(v.sqftB);
      if (pB !== null && sB !== null && pB >= 0 && sB > 0) {
        const ppsfB = pB / sB;
        const diff = ppsfB - ppsfA;
        out.ppsfB = ppsfB;
        out.diff = diff;
        steps.push(`Listing B: $${fmt(pB, 0)} ÷ ${fmt(sB, 0)} sq ft = $${fmt(ppsfB)} per sq ft`);
        cats.push('Listing B');
        vals.push(+ppsfB.toFixed(2));
        if (ppsfA > 0) {
          const pct = diff / ppsfA;
          out.diffPct = pct;
          steps.push(`Difference: $${fmt(ppsfB)} − $${fmt(ppsfA)} = $${fmt(diff)} (${fmt(pct * 100)}%)`);
          const word = diff < 0 ? 'cheaper' : 'more expensive';
          note = diff === 0
            ? 'Both listings cost the same per square foot.'
            : `Listing B is $${fmt(Math.abs(diff))} (${fmt(Math.abs(pct) * 100)}%) ${word} per square foot than listing A.`;
          badge = diff === 0 ? 'Same $/sq ft' : `B ${diff < 0 ? 'cheaper' : 'pricier'} by ${fmt(Math.abs(pct) * 100)}%`;
        }
      }
    }

    if (!blank(v.rent) || !blank(v.sqftRent)) {
      const r = num(v.rent), sR = num(v.sqftRent);
      if (r !== null && sR !== null && r >= 0 && sR > 0) {
        const m = r / sR;
        out.rentMonth = m;
        out.rentYear = m * 12;
        steps.push(`Rent: $${fmt(r, 0)} ÷ ${fmt(sR, 0)} sq ft = $${fmt(m)} per sq ft a month, $${fmt(m * 12)} a year`);
        note += ` Rent works out to $${fmt(m)} per square foot a month, $${fmt(m * 12)} a year.`;
      }
    }
    note += ' This number ignores location, lot size, condition and what counts as living area.';

    return {
      ...out,
      tone: 'ok',
      badge,
      note,
      chart: {
        type: 'bar' as const,
        title: 'Price per square foot',
        categories: cats,
        series: [{ name: '$ per sq ft', values: vals }],
        format: { format: 'currency' as const },
        highlight: cats.length > 1 && vals[1] < vals[0] ? 1 : 0,
      },
      steps,
    };
  },
  content: {
    formula: [
      'Price per sq ft = price ÷ square feet',
      'Difference = listing B per sq ft − listing A per sq ft; percent = difference ÷ listing A per sq ft',
      'Rent per sq ft per month = monthly rent ÷ square feet; per year = monthly figure × 12',
    ],
    body: [
      'Price per square foot is the quickest way to put homes of different sizes on the same scale. Enter the asking price and the size of listing A, add a second listing to see which is cheaper per square foot, or enter a monthly rent and size to see what a rental costs per square foot.',
      'Treat the result as a starting point, not a verdict. It ignores location, lot size, condition, age, layout and what each listing counts as living area (finished basements, garages and unpermitted additions are often counted differently). Small homes usually cost more per square foot than large ones, so compare similar sizes in the same area. For sizing a room or project, see the square footage calculator; to check a rent against your income, see the rent affordability calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How do I calculate price per square foot?', a: 'Divide the price by the square footage. For a $450,000 home with 1,800 sq ft, that is $250.00 per square foot.' },
      { q: 'Which of two listings is cheaper per square foot?', a: 'With A at $450,000 for 1,800 sq ft ($250.00) and B at $520,000 for 2,100 sq ft ($247.62), B is $2.38 (0.95%) cheaper per square foot, even though its total price is higher.' },
      { q: 'How do I work out rent per square foot?', a: 'Divide the monthly rent by the square footage, then multiply by 12 for the yearly figure. $2,100 for 900 sq ft is $2.33 per sq ft a month, or $28.00 a year.' },
      { q: 'Is a lower price per square foot always better?', a: 'No. The figure ignores location, lot, condition and what counts as living area, so a lower number can still be a worse deal.' },
    ],
    sources: [],
  },
  related: ['square-footage', 'rent-affordability'],
  examples: [
    // A 450000/1800 = 250; B 520000/2100 = 247.619048; diff -2.380952; pct -2.380952/250 = -0.0095238
    { values: { priceA: 450000, sqftA: 1800, priceB: 520000, sqftB: 2100 }, expect: { ppsfA: 250, ppsfB: 247.619048, diff: -2.380952, diffPct: -0.0095238 }, tolerance: 0.0001 },
    // rent 2100/900 = 2.333333; x12 = 28
    { values: { priceA: 450000, sqftA: 1800, rent: 2100, sqftRent: 900 }, expect: { ppsfA: 250, rentMonth: 2.333333, rentYear: 28 }, tolerance: 0.0001 },
    // A 300000/1500 = 200; B 330000/1320 = 250; diff 50; pct 0.25
    { values: { priceA: 300000, sqftA: 1500, priceB: 330000, sqftB: 1320 }, expect: { ppsfA: 200, ppsfB: 250, diff: 50, diffPct: 0.25 }, tolerance: 0.0001 },
  ],
});

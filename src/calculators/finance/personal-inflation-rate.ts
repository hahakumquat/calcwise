import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

const N = 8;

export default defineCalculator({
  slug: 'personal-inflation-rate',
  title: 'Personal Inflation Rate Calculator',
  seoTitle: 'Personal Inflation Rate Calculator',
  metaDescription: 'Find your own inflation rate from last year and this year monthly spending, and see which categories pushed your costs up the most.',
  updated: '2026-11-27',
  category: 'finance',
  description: 'Compare what you spent per month in each category last year and this year to get your own inflation rate and each category\'s share of it.',
  keywords: ['personal inflation rate calculator', 'my own inflation rate', 'personal cpi', 'how much has inflation affected me', 'household inflation calculator', 'cost of living increase'],
  popular: false,
  inputs: [
    { id: 'name1', label: 'Category 1 name', type: 'text', default: 'Rent', placeholder: 'Rent', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last1', label: 'Category 1: last year, per month', type: 'number', prefix: '$', default: 1500, min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this1', label: 'Category 1: this year, per month', type: 'number', prefix: '$', default: 1590, min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
    { id: 'name2', label: 'Category 2 name', type: 'text', default: 'Groceries', placeholder: 'Groceries', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last2', label: 'Category 2: last year, per month', type: 'number', prefix: '$', default: 400, min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this2', label: 'Category 2: this year, per month', type: 'number', prefix: '$', default: 448, min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
    { id: 'name3', label: 'Category 3 name', type: 'text', default: 'Transport', placeholder: 'Transport', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last3', label: 'Category 3: last year, per month', type: 'number', prefix: '$', default: 200, min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this3', label: 'Category 3: this year, per month', type: 'number', prefix: '$', default: 190, min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
    { id: 'name4', label: 'Category 4 name', type: 'text', placeholder: 'Category 4', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last4', label: 'Category 4: last year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this4', label: 'Category 4: this year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
    { id: 'name5', label: 'Category 5 name', type: 'text', placeholder: 'Category 5', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last5', label: 'Category 5: last year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this5', label: 'Category 5: this year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
    { id: 'name6', label: 'Category 6 name', type: 'text', placeholder: 'Category 6', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last6', label: 'Category 6: last year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this6', label: 'Category 6: this year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
    { id: 'name7', label: 'Category 7 name', type: 'text', placeholder: 'Category 7', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last7', label: 'Category 7: last year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this7', label: 'Category 7: this year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
    { id: 'name8', label: 'Category 8 name', type: 'text', placeholder: 'Category 8', optional: true, info: 'A label for this spending category, such as rent, groceries or transport. Leave the whole row blank to skip it.' },
    { id: 'last8', label: 'Category 8: last year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spent on this category in an average month last year.' },
    { id: 'this8', label: 'Category 8: this year, per month', type: 'number', prefix: '$', min: 0, step: 10, optional: true, info: 'What you spend on this category in an average month this year.' },
  ],
  outputs: [
    { id: 'inflation', label: 'Your personal inflation rate', format: 'percent', precision: 2, primary: true, info: 'This year\'s total monthly spend divided by last year\'s, minus 1.' },
    { id: 'lastTotal', label: 'Last year, per month', format: 'currency', precision: 0, info: 'The sum of your last-year monthly amounts.' },
    { id: 'thisTotal', label: 'This year, per month', format: 'currency', precision: 0, info: 'The sum of your this-year monthly amounts.' },
    { id: 'extraYear', label: 'Extra cost over a year', format: 'currency', precision: 0, info: '(This year minus last year, per month) × 12.' },
    { id: 'topDriver', label: 'Biggest driver', format: 'text', info: 'The category that added the most percentage points to your total.' },
  ],
  compute: (v) => {
    const rows: { name: string; last: number; now: number }[] = [];
    for (let i = 1; i <= N; i++) {
      const last = num(v['last' + i]);
      const now = num(v['this' + i]);
      if (last === null && now === null) continue;
      if (last === null || now === null) return { inflation: null, error: `Category ${i} needs both a last-year and a this-year amount, or leave both blank.` };
      if (last < 0 || now < 0) return { inflation: null, error: 'Amounts cannot be negative.' };
      const raw = typeof v['name' + i] === 'string' ? (v['name' + i] as string).trim() : '';
      rows.push({ name: raw || `Category ${i}`, last, now });
    }
    if (rows.length === 0) return { inflation: null };
    const lastTotal = rows.reduce((s, r) => s + r.last, 0);
    const thisTotal = rows.reduce((s, r) => s + r.now, 0);
    if (lastTotal <= 0) return { inflation: null, error: 'Last year\'s total spending must be above $0.' };

    const inflation = thisTotal / lastTotal - 1;
    const extraYear = (thisTotal - lastTotal) * 12;
    const contrib = rows.map((r) => (r.now - r.last) / lastTotal);
    let top = 0;
    contrib.forEach((c, i) => { if (c > contrib[top]) top = i; });
    const topDriver = contrib[top] > 0 ? `${rows[top].name} (${+(contrib[top] * 100).toFixed(2)} points)` : 'None, no category rose';
    const change = (r: { last: number; now: number }) => (r.last > 0 ? pct(r.now / r.last - 1, 1) : 'new spending');

    return {
      inflation,
      lastTotal,
      thisTotal,
      extraYear,
      topDriver,
      tone: inflation <= 0.03 ? 'good' : inflation <= 0.06 ? 'ok' : 'warn',
      badge: inflation <= 0 ? 'Your costs fell' : inflation <= 0.03 ? 'About typical' : inflation <= 0.06 ? 'Noticeably higher' : 'Costs are climbing fast',
      chart: {
        type: 'bar',
        title: 'Points each category added to your inflation rate',
        categories: rows.map((r) => r.name),
        series: [{ name: 'Contribution', values: contrib.map((c) => +c.toFixed(6)) }],
        format: { format: 'percent' },
        horizontal: true,
      },
      steps: [
        `Last year: ${money(lastTotal, 0)} a month. This year: ${money(thisTotal, 0)} a month.`,
        `Personal inflation = ${money(thisTotal, 0)} ÷ ${money(lastTotal, 0)} − 1 = ${pct(inflation, 2)}`,
        ...rows.map((r, i) => `${r.name}: ${money(r.last, 0)} to ${money(r.now, 0)} (${change(r)}), ${+(contrib[i] * 100).toFixed(2)} points`),
      ],
      note: `Your spending rose ${pct(inflation, 2)}, which is ${money(extraYear, 0)} more over a year. This mixes price rises with changes in how much you buy, so it is your cost increase rather than a pure price index.`,
    };
  },
  content: {
    formula: [
      'Personal inflation = total this year ÷ total last year − 1',
      'Category change = this year ÷ last year − 1',
      'Category contribution (points) = (this year − last year) ÷ total last year',
    ],
    body: [
      'Official inflation figures average a national basket. Your own bills can rise much faster or slower, depending on how much of your budget goes to rent, food, fuel and the rest. Enter your average monthly spend in each category for last year and this year, and the calculator weights each one by what you actually spend.',
      'For rent $1,500 to $1,590, groceries $400 to $448 and transport $200 to $190, monthly spending goes from $2,100 to $2,228. That is 6.10% personal inflation. Rent adds 4.29 points, groceries 2.29 points, and transport takes off 0.48.',
    ],
    sections: [
      {
        heading: 'What this does and does not measure',
        paragraphs: [
          'The result mixes price changes with lifestyle changes. If you eat out more or move somewhere bigger, your spending rises even if prices did not. To measure prices alone, compare what the same purchases cost in both years.',
          'Contributions add up to your total rate, so the biggest bar shows where the squeeze comes from. Use the inflation calculator to turn a rate into the value of money over time, or the cost of living salary calculator to compare cities.',
        ],
      },
    ],
    faq: [
      { q: 'How do I calculate my personal inflation rate?', a: 'Divide your total monthly spending this year by last year\'s total and subtract 1. For $2,228 against $2,100 that is 6.10%.' },
      { q: 'Why can it differ from the official rate?', a: 'Official figures use a national average basket. If housing is a larger share of your budget than average, a rent rise moves your rate more than it moves the headline number.' },
      { q: 'What are the points for each category?', a: 'Each category\'s points are its dollar increase divided by last year\'s total. In the default example rent adds 4.29 points of the 6.10% total.' },
      { q: 'Does it separate prices from buying more?', a: 'No. It measures how much more you spend, which includes both. Compare identical purchases in both years if you want price changes alone.' },
    ],
    sources: [{ label: 'Simple arithmetic on your own figures; no external data' }],
  },
  related: ['inflation', 'cost-of-living-salary', 'budget-50-30-20', 'raise-calculator'],
  examples: [
    // totals 1500+400+200=2100; 1590+448+190=2228; 2228/2100-1=0.0609524; extra (128)*12=1536
    { values: { name1: 'Rent', last1: 1500, this1: 1590, name2: 'Groceries', last2: 400, this2: 448, name3: 'Transport', last3: 200, this3: 190 }, expect: { inflation: 0.0609524, lastTotal: 2100, thisTotal: 2228, extraYear: 1536 }, tolerance: 1e-5 },
    // two categories: 1000->1100 and 500->500: 1600/1500-1 = 0.0666667; extra 100*12 = 1200
    { values: { name1: 'Rent', last1: 1000, this1: 1100, name2: 'Food', last2: 500, this2: 500 }, expect: { inflation: 0.0666667, lastTotal: 1500, thisTotal: 1600, extraYear: 1200 }, tolerance: 1e-5 },
  ],
});

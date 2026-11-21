import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'black-friday-deal-check',
  title: 'Black Friday Deal Check: Is the Discount Real?',
  category: 'finance',
  description: 'Compare the sale price with the "was" price and with the price you actually saw before. See the advertised discount, the real one and what you really save.',
  keywords: ['black friday deal check', 'is this discount real', 'fake sale price', 'real discount calculator', 'inflated original price', 'is black friday worth it', 'was price vs typical price'],
  updated: '2026-11-21',
  inputs: [
    { id: 'sale', label: 'Sale price', type: 'number', prefix: '$', default: 140, min: 0, step: 0.01, info: 'The price you would pay today.' },
    { id: 'was', label: '"Was" price', type: 'number', prefix: '$', default: 200, min: 0, step: 0.01, info: 'The crossed-out original price shown by the store.' },
    { id: 'typical', label: 'Typical price you saw earlier', type: 'number', prefix: '$', default: 160, min: 0, step: 0.01, help: 'From your own notes, a saved screenshot or a price-history tool.', info: 'What the item usually sold for in recent weeks or months, as you saw it. This is your own figure; the calculator cannot look prices up.' },
  ],
  outputs: [
    { id: 'realPct', label: 'Real discount vs typical price', format: 'percent', precision: 2, primary: true, info: '(Typical price − sale price) ÷ typical price. Negative means the sale price is above the typical price.' },
    { id: 'claimedPct', label: 'Advertised discount', format: 'percent', precision: 2, info: '(Was price − sale price) ÷ was price.' },
    { id: 'realSaving', label: 'Real saving in dollars', format: 'currency', info: 'Typical price − sale price. Negative means you would pay more than usual.' },
    { id: 'claimedSaving', label: 'Advertised saving in dollars', format: 'currency', info: 'Was price − sale price.' },
    { id: 'inflation', label: '"Was" price above typical', format: 'currency', info: 'Was price − typical price. A large gap means the original price may not be one you would normally have paid.' },
  ],
  compute: (v) => {
    const sale = num(v.sale);
    const was = num(v.was);
    const typical = num(v.typical);
    if (sale === null || was === null || typical === null) return { realPct: null };
    if (sale < 0 || was < 0 || typical < 0) return { realPct: null, error: 'Prices cannot be negative.' };
    if (was === 0) return { realPct: null, error: '"Was" price must be above zero.' };
    if (typical === 0) return { realPct: null, error: 'Typical price must be above zero.' };
    const claimedPct = (was - sale) / was;
    const realPct = (typical - sale) / typical;
    const claimedSaving = was - sale;
    const realSaving = typical - sale;
    const inflation = was - typical;
    const tone = realPct <= 0 ? 'bad' : realPct < claimedPct - 0.05 ? 'warn' : 'good';
    const badge =
      realPct < 0
        ? `Above the typical price by ${pct(-realPct)}`
        : realPct === 0
          ? 'No real saving: sale price equals the typical price'
          : `${pct(claimedPct)} advertised, ${pct(realPct)} real`;
    return {
      realPct,
      claimedPct,
      realSaving,
      claimedSaving,
      inflation,
      tone,
      badge,
      note: 'The result is only as good as the typical price you enter. Prices change for many reasons, so a low real discount does not by itself mean a deal is misleading. General information, not financial advice.',
      chart: {
        type: 'bar',
        title: 'What you save: advertised vs real',
        categories: ['Advertised (vs "was")', 'Real (vs typical)'],
        series: [{ name: 'Saving in dollars', values: [claimedSaving, realSaving] }],
        format: CURRENCY,
        highlight: 1,
      },
      steps: [
        `Advertised discount = (${money(was)} − ${money(sale)}) ÷ ${money(was)} = ${pct(claimedPct)}.`,
        `Real discount = (${money(typical)} − ${money(sale)}) ÷ ${money(typical)} = ${pct(realPct)}.`,
        `Real saving = ${money(typical)} − ${money(sale)} = ${money(realSaving)}; the "was" price is ${money(inflation)} above the typical price.`,
      ],
    };
  },
  content: {
    formula: [
      'Advertised discount = (was price − sale price) ÷ was price',
      'Real discount = (typical price − sale price) ÷ typical price',
      'Real saving = typical price − sale price',
    ],
    body: [
      'A "30% off" label is measured against the "was" price the store chooses to show. If that price was higher than the item usually sells for, the discount looks bigger than what you actually save.',
      'This calculator compares the sale price with two reference points: the "was" price on the tag and the typical price you saw earlier. Enter the typical price from your own notes, a saved screenshot or a price-history tool you trust. The calculator does not look up prices and makes no claim about any retailer.',
      'A real discount of zero or below means the sale price is no better than what you would normally pay. Whether a deal is worth it also depends on whether you wanted the item at all.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A jacket is marked down from $200 to $140. The advertised discount is ($200 − $140) ÷ $200 = 30%. But you saw it at $160 a few weeks ago, so the real discount is ($160 − $140) ÷ $160 = 12.5%, a real saving of $20 rather than $60.',
        ],
      },
    ],
    faq: [
      { q: 'How do I tell if a Black Friday discount is real?', a: 'Compare the sale price with the price the item usually sells for, not with the "was" price. With a $140 sale price and a $160 typical price, the real discount is 12.5% even if the tag claims 30% off.' },
      { q: 'Where do I get the typical price?', a: 'From your own records: a saved screenshot, a wishlist, an email receipt or a price-history tool you trust. The calculator uses the number you enter and does not check it.' },
      { q: 'What does a negative real discount mean?', a: 'The sale price is higher than the typical price you entered. For example, a $170 sale price against a $160 typical price is 6.25% above typical.' },
      { q: 'Is a smaller real discount always a bad deal?', a: 'No. A 12.5% saving on something you need can still be worth it. The point is to compare the real figure rather than the advertised one. This is general information, not financial advice.' },
    ],
    sources: [{ label: 'FTC: Guides Against Deceptive Pricing (16 CFR Part 233)', url: 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-233' }],
  },
  related: ['discount', 'sales-tax', 'cost-per-use', 'holiday-spending-total'],
  examples: [
    // claimed (200-140)/200 = 0.3; real (160-140)/160 = 20/160 = 0.125; savings 60 and 20; was above typical 200-160 = 40
    { values: { sale: 140, was: 200, typical: 160 }, expect: { realPct: 0.125, claimedPct: 0.3, realSaving: 20, claimedSaving: 60, inflation: 40 } },
    // sale 90, was 120, typical 80: claimed 30/120 = 0.25; real (80-90)/80 = -0.125; saving -10; inflation 40
    { values: { sale: 90, was: 120, typical: 80 }, expect: { realPct: -0.125, claimedPct: 0.25, realSaving: -10, claimedSaving: 30, inflation: 40 } },
  ],
});

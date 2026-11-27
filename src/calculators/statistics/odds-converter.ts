import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Decimal odds from a value in the chosen format, or an error message. */
function toDecimal(format: string, value: number, den: number | null): { dec: number } | { err: string } {
  if (format === 'american') {
    // +100 and -100 both mean evens (decimal 2.00). Anything strictly between -100 and +100 is not a valid American price.
    if (Math.abs(value) < 100) return { err: 'American odds must be +100 or higher, or -100 or lower. Values between -100 and +100 are not valid; +100 and -100 both mean evens.' };
    return { dec: value > 0 ? value / 100 + 1 : 100 / -value + 1 };
  }
  if (format === 'fractional') {
    if (den === null || den <= 0) return { err: 'Enter a fractional denominator greater than 0.' };
    if (value < 0) return { err: 'Fractional odds cannot be negative.' };
    return { dec: value / den + 1 };
  }
  if (value <= 1) return { err: 'Decimal odds must be greater than 1.' };
  return { dec: value };
}

/** Fractional text for decimal odds: exact a/b when a denominator up to 100 fits, else a rounded decimal ratio. */
function toFraction(dec: number): string {
  const x = dec - 1;
  for (let d = 1; d <= 100; d++) {
    const n = Math.round(x * d);
    if (n > 0 && Math.abs(x * d - n) < 1e-6) return `${n}/${d}`;
  }
  return `≈ ${fmt(x, 2)}/1`;
}

const toAmerican = (dec: number): string => {
  if (dec >= 2) return `+${Math.round((dec - 1) * 100)}`;
  return `-${Math.round(100 / (dec - 1))}`;
};

export default defineCalculator({
  slug: 'odds-converter',
  title: 'Odds Converter: American, Decimal, Fractional',
  category: 'statistics',
  description: 'Convert American, decimal and fractional odds, see the implied probability, and add a second side to find the bookmaker margin. Educational, not betting advice.',
  keywords: ['odds converter', 'american odds to decimal', 'implied probability calculator', 'fractional odds converter', 'bookmaker margin', 'overround calculator', 'vig calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'format', label: 'Odds format', type: 'select', segmented: true, default: 'american', options: [
      { value: 'american', label: 'American' },
      { value: 'decimal', label: 'Decimal' },
      { value: 'fractional', label: 'Fractional' },
    ], info: 'How the odds are written. American looks like +150 or -170, decimal like 2.50, fractional like 3/2. The second side below uses the same format.' },
    { id: 'odds', label: 'Odds (side 1)', type: 'number', default: 150, info: 'American: +150 or -170 (must be +100 or higher, or -100 or lower). Decimal: a number above 1, such as 2.50. Fractional: the top number, such as 3 in 3/2.' },
    { id: 'den', label: 'Denominator (side 1)', type: 'number', default: 1, min: 0, step: 1, showWhen: { input: 'format', is: 'fractional' }, info: 'The bottom number of fractional odds, such as 2 in 3/2. Use 1 for odds like 5/1.' },
    { id: 'odds2', label: 'Other side odds (optional)', type: 'number', optional: true, info: 'The price for the opposite outcome of a two-way line, in the same format. Fill it in to see the total implied probability and the bookmaker margin.' },
    { id: 'den2', label: 'Denominator (other side)', type: 'number', default: 1, min: 0, step: 1, showWhen: { input: 'format', is: 'fractional' }, optional: true, info: 'The bottom number of the other side in fractional odds. Ignored when the other side is blank.' },
  ],
  outputs: [
    { id: 'implied', label: 'Implied probability (side 1)', format: 'percent', precision: 2, primary: true, info: 'The chance the price implies before any margin is removed: 1 ÷ decimal odds.' },
    { id: 'decimal', label: 'Decimal odds', format: 'number', precision: 4, info: 'Total payout per 1 staked, including the stake. American +A = A ÷ 100 + 1; -A = 100 ÷ A + 1; fractional a/b = a ÷ b + 1.' },
    { id: 'american', label: 'American odds', format: 'text', info: 'Plus for decimal 2.00 or more (profit on a 100 stake), minus for less (stake needed to profit 100). Rounded to a whole number.' },
    { id: 'fractional', label: 'Fractional odds', format: 'text', info: 'Profit relative to stake, as a ratio: decimal minus 1. Shown as the simplest fraction up to a denominator of 100, otherwise a rounded ratio.' },
    { id: 'implied2', label: 'Implied probability (other side)', format: 'percent', precision: 2, info: 'The same calculation for the second price.' },
    { id: 'bookTotal', label: 'Total of both implied probabilities', format: 'percent', precision: 2, info: 'Sum of the two implied probabilities. A fair two-way line would total 100%; anything above that is built-in margin.' },
    { id: 'margin', label: 'Margin (overround)', format: 'percent', precision: 2, info: 'Total of the implied probabilities minus 100%. It is the edge built into the prices.' },
    { id: 'fair', label: 'Side 1 with margin removed', format: 'percent', precision: 2, info: 'Implied probability of side 1 divided by the total, so both sides add to 100%. A simple proportional adjustment, not the only method.' },
  ],
  compute: (v) => {
    const format = typeof v.format === 'string' ? v.format : 'american';
    const o1 = num(v.odds);
    if (o1 === null) return { implied: null };
    const r1 = toDecimal(format, o1, num(v.den));
    if ('err' in r1) return { implied: null, error: r1.err };
    const dec = r1.dec;
    const p1 = 1 / dec;

    const o2 = num(v.odds2);
    let p2: number | null = null;
    if (o2 !== null) {
      const r2 = toDecimal(format, o2, num(v.den2));
      if ('err' in r2) return { implied: null, error: `Other side: ${r2.err}` };
      p2 = 1 / r2.dec;
    }

    const out: Record<string, unknown> = {
      implied: p1,
      decimal: dec,
      american: toAmerican(dec),
      fractional: toFraction(dec),
    };
    const steps = [
      `Decimal odds: ${fmt(dec, 4)}.`,
      `Implied probability: 1 ÷ ${fmt(dec, 4)} = ${fmt(p1 * 100)}%.`,
    ];
    let note = 'Implied probability is what the price says, not a forecast. This is educational arithmetic, not betting advice.';
    let tone: 'ok' | 'warn' = 'ok';
    let chart;
    if (p2 !== null) {
      const total = p1 + p2, margin = total - 1;
      out.implied2 = p2;
      out.bookTotal = total;
      out.margin = margin;
      out.fair = p1 / total;
      steps.push(`Other side: ${fmt(p2 * 100)}%. Total: ${fmt(total * 100)}%. Margin: ${fmt(margin * 100)}%.`);
      note = `The two sides add to ${fmt(total * 100)}%, a margin of ${fmt(margin * 100)}%. This is educational arithmetic, not betting advice.`;
      tone = margin < 0 ? 'warn' : 'ok';
      chart = {
        type: 'bar' as const,
        title: 'Implied probability by side (%)',
        categories: ['Side 1', 'Other side', 'Total'],
        series: [{ name: 'Implied probability', values: [+(p1 * 100).toFixed(2), +(p2 * 100).toFixed(2), +(total * 100).toFixed(2)] }],
        format: { format: 'number' as const, suffix: '%' },
        highlight: 2,
      };
    } else {
      chart = {
        type: 'bar' as const,
        title: 'Implied probability of side 1 (%)',
        categories: ['Implied', 'Remainder'],
        series: [{ name: 'Probability', values: [+(p1 * 100).toFixed(2), +(100 - p1 * 100).toFixed(2)] }],
        format: { format: 'number' as const, suffix: '%' },
        highlight: 0,
      };
    }
    return { ...out, badge: `${fmt(p1 * 100)}% implied`, tone, note, steps, chart };
  },
  content: {
    formula: [
      'American +A: decimal = A ÷ 100 + 1. American -A: decimal = 100 ÷ A + 1',
      'Fractional a/b: decimal = a ÷ b + 1',
      'Implied probability = 1 ÷ decimal odds',
      'Margin = sum of the implied probabilities of every outcome - 1',
    ],
    body: [
      'The same price can be written three ways. American odds show profit on a 100 stake (+150) or the stake needed to win 100 (-170). Decimal odds show the total return per 1 staked, including the stake (2.50). Fractional odds show profit relative to stake (3/2). This calculator converts between all three and shows the probability the price implies.',
      'Add the opposite side of a two-way line to see the total implied probability. A fair line would add to 100%. The amount above that is the margin (also called the overround or vig), which is how the price-setter builds in an edge. The "margin removed" figure scales both sides down proportionally so they sum to 100%.',
      'Boundary rules: American +100 and -100 both mean evens, decimal 2.00. Values strictly between -100 and +100 are not valid American odds, and decimal odds must be above 1. To understand the chance and payoff maths behind prices, see the probability calculator and the expected value calculator.',
      'This tool is for education only. It does not predict outcomes and is not betting advice. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How do I convert +150 to decimal odds?', a: 'Divide by 100 and add 1: 150 ÷ 100 + 1 = 2.50. That is 3/2 in fractional odds and an implied probability of 1 ÷ 2.5 = 40%.' },
      { q: 'How do I convert -170 to decimal odds?', a: '100 ÷ 170 + 1 = 1.5882. The implied probability is 1 ÷ 1.5882 = 62.96%.' },
      { q: 'What is the margin on +150 and -170?', a: 'The implied probabilities are 40% and 62.96%. They total 102.96%, so the margin is 2.96%.' },
      { q: 'Are +100 and -100 the same?', a: 'Yes. Both mean evens: decimal 2.00, 1/1 fractional and a 50% implied probability. American odds strictly between -100 and +100 are rejected as invalid.' },
      { q: 'Does implied probability tell me who will win?', a: 'No. It is only what the price implies, including the margin. This calculator is educational and gives no betting advice.' },
    ],
    sources: [],
  },
  related: ['probability', 'expected-value'],
  examples: [
    // +150: 150/100+1=2.5; implied 0.4. -170: 100/170+1=1.588235, implied 0.629630. total 1.029630, margin 0.029630. fair 0.4/1.02963=0.388489
    { values: { format: 'american', odds: 150, odds2: -170 }, expect: { decimal: 2.5, implied: 0.4, implied2: 0.62963, bookTotal: 1.02963, margin: 0.02963, fair: 0.388489 }, tolerance: 0.0001 },
    // decimal 2.10 and 1.80: 1/2.1=0.476190, 1/1.8=0.555556, total 1.031746, margin 0.031746
    { values: { format: 'decimal', odds: 2.1, odds2: 1.8 }, expect: { decimal: 2.1, implied: 0.47619, implied2: 0.555556, bookTotal: 1.031746, margin: 0.031746 }, tolerance: 0.0001 },
    // fractional 5/2: 5/2+1=3.5, implied 0.285714
    { values: { format: 'fractional', odds: 5, den: 2 }, expect: { decimal: 3.5, implied: 0.285714 }, tolerance: 0.0001 },
  ],
});

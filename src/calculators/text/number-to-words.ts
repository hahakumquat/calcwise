import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion'];

/** Words for 1..999. */
function below1000(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h) parts.push(`${ONES[h]} hundred`);
  if (r) {
    if (r < 20) parts.push(ONES[r]);
    else parts.push(r % 10 ? `${TENS[Math.floor(r / 10)]}-${ONES[r % 10]}` : TENS[Math.floor(r / 10)]);
  }
  return parts.join(' ');
}

/** Words for a whole number from 0 up to 999,999,999,999,999. */
function wholeToWords(n: number): string {
  if (n === 0) return 'zero';
  const groups: string[] = [];
  let i = 0;
  while (n > 0) {
    const g = n % 1000;
    if (g) groups.unshift(`${below1000(g)}${SCALES[i] ? ' ' + SCALES[i] : ''}`);
    n = Math.floor(n / 1000);
    i++;
  }
  return groups.join(' ');
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default defineCalculator({
  slug: 'number-to-words',
  title: 'Number to Words for Checks',
  category: 'text',
  description: 'Write a dollar amount in words for a check. Get "One thousand two hundred thirty-four and 56/100" from 1,234.56 in one step.',
  metaDescription: 'Number to words converter for checks: turn a dollar amount into the written-out line, like "One thousand two hundred thirty-four and 56/100".',
  updated: '2026-11-27',
  keywords: ['number to words', 'write a check amount in words', 'how to write 1234.56 on a check', 'check amount in words', 'dollar amount to words', 'spell out numbers'],
  inputs: [
    { id: 'amount', label: 'Amount', type: 'number', prefix: '$', default: 1234.56, min: 0, max: 999999999999.99, step: 0.01, info: 'The dollar amount on the check. Cents are rounded to two decimals.' },
  ],
  outputs: [
    { id: 'check', label: 'Check line', format: 'text', primary: true, info: 'The legal-amount line: dollars in words, then cents as a fraction of 100.' },
    { id: 'words', label: 'Dollars and cents in words', format: 'text', info: 'The same amount spelled out with "dollars" and "cents".' },
    { id: 'numeric', label: 'Numeric form', format: 'text', info: 'The amount with commas and two decimals.' },
  ],
  compute: (v) => {
    const raw = num(v.amount);
    if (raw === null) return { check: null };
    if (raw < 0) return { check: null, error: 'Enter an amount of zero or more.' };
    if (raw > 999999999999.99) return { check: null, error: 'Amounts above $999,999,999,999.99 are not supported.' };
    const totalCents = Math.round(raw * 100);
    const dollars = Math.floor(totalCents / 100);
    const cents = totalCents % 100;
    const dWords = wholeToWords(dollars);
    const cc = String(cents).padStart(2, '0');
    const check = `${cap(dWords)} and ${cc}/100`;
    const dUnit = dollars === 1 ? 'dollar' : 'dollars';
    const cUnit = cents === 1 ? 'cent' : 'cents';
    const words = cents === 0
      ? `${cap(dWords)} ${dUnit}`
      : `${cap(dWords)} ${dUnit} and ${wholeToWords(cents)} ${cUnit}`;
    const numeric = `$${dollars.toLocaleString('en-US')}.${cc}`;
    const billions = Math.floor(dollars / 1e9) * 1e9;
    const millions = Math.floor((dollars % 1e9) / 1e6) * 1e6;
    const thousands = Math.floor((dollars % 1e6) / 1e3) * 1e3;
    const ones = dollars % 1e3;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Where the amount comes from',
      categories: ['Billions', 'Millions', 'Thousands', 'Hundreds and ones', 'Cents'],
      series: [{ name: 'Dollars', values: [billions, millions, thousands, ones, cents / 100] }],
      format: { format: 'currency' },
    };
    return {
      check, words, numeric, chart,
      steps: [
        `Split ${numeric} into ${dollars.toLocaleString('en-US')} dollars and ${cents} cents.`,
        `Dollars in words: ${dWords}.`,
        `Cents as a fraction of 100: ${cc}/100.`,
      ],
    };
  },
  content: {
    formula: [
      'Split the amount into whole dollars and cents (round to the nearest cent).',
      'Write the dollars in words, hyphenating 21 to 99 (thirty-four).',
      'Write the cents as a fraction over 100, such as 56/100, and "00/100" when there are none.',
    ],
    body: [
      'Banks ask for the amount twice on a check: in numbers in the box, and in words on the line below. If the two disagree, the written words usually win, so it is worth getting them right. This tool writes the words line for you.',
      'For example, $1,234.56 becomes "One thousand two hundred thirty-four and 56/100". A round amount such as $500 becomes "Five hundred and 00/100". Zero reads "Zero and 00/100".',
      'Draw a line from the end of the words to the word "Dollars" printed on the check so nothing can be added. Conventions vary a little by bank, and nothing here leaves your browser.',
    ],
    faq: [
      { q: 'How do you write $1,234.56 on a check?', a: 'Write "One thousand two hundred thirty-four and 56/100". The dollars are in words and the cents are a fraction over 100.' },
      { q: 'How do you write a whole-dollar amount?', a: 'Use "and 00/100" after the dollars. $500 is "Five hundred and 00/100".' },
      { q: 'Do I use "and" after "hundred"?', a: 'This tool keeps "and" for the cents only. It writes "One thousand two hundred thirty-four", not "one thousand two hundred and thirty-four", so the one "and" clearly marks where the cents start.' },
      { q: 'What is the largest amount it handles?', a: 'Up to $999,999,999,999.99, in the hundreds of billions.' },
    ],
    sources: [],
  },
  related: ['word-counter', 'case-converter'],
  examples: [
    { values: { amount: 1234.56 }, expect: { check: 'One thousand two hundred thirty-four and 56/100', words: 'One thousand two hundred thirty-four dollars and fifty-six cents', numeric: '$1,234.56' } },
    { values: { amount: 500 }, expect: { check: 'Five hundred and 00/100', words: 'Five hundred dollars', numeric: '$500.00' } },
    { values: { amount: 1000001.01 }, expect: { check: 'One million one and 01/100', words: 'One million one dollars and one cent' } },
    { values: { amount: 0 }, expect: { check: 'Zero and 00/100', words: 'Zero dollars' } },
    { values: { amount: 1.1 }, expect: { check: 'One and 10/100', words: 'One dollar and ten cents' } },
    { values: { amount: 19.99 }, expect: { check: 'Nineteen and 99/100', words: 'Nineteen dollars and ninety-nine cents' } },
  ],
});

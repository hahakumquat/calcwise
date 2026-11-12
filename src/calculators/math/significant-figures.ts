import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { str, parseDecimal, normalise, roundDigits, digitsToDecimal, mantissa, sup } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'significant-figures',
  title: 'Significant Figures Calculator',
  category: 'math',
  description: 'Count the significant figures in a number and round it to any number of sig figs.',
  keywords: ['sig figs', 'sig fig counter', 'round to significant figures', 'significant digits'],
  popular: true,
  inputs: [
    { id: 'value', info: 'Type the number exactly as written, including trailing zeros and the decimal point, because they change the count.', label: 'Number', type: 'text', default: '0.004560', placeholder: 'e.g. 1200, 0.00450, 3.010e5', help: 'Type it exactly as written — trailing zeros and decimal points matter.' },
    { id: 'n', info: 'How many significant figures to round the number to. Leave blank to just count.', label: 'Round to (sig figs)', type: 'number', default: 2, min: 1, max: 30, step: 1, optional: true },
  ],
  outputs: [
    { id: 'count', info: 'How many digits in your number are significant, i.e. carry information about precision.', label: 'Significant figures', format: 'integer', primary: true },
    { id: 'rounded', info: 'Your number rounded to the requested number of significant figures.', label: 'Rounded', format: 'text' },
    { id: 'roundedSci', info: 'The rounded number in scientific notation, which shows the precision unambiguously.', label: 'Rounded (scientific notation)', format: 'text' },
    { id: 'sigDigits', info: 'Just the digits that count as significant, in order.', label: 'Significant digits', format: 'text' },
  ],
  compute: (v) => {
    const text = str(v.value);
    if (!text) return { count: null };
    const p = parseDecimal(text);
    if (!p) return { count: null, error: 'Couldn’t read that number. Try a form like 1200, 0.0045 or 3.01e5.' };
    const nrm = normalise(p);
    if (!nrm) {
      return {
        count: p.hasPoint ? Math.max(1, p.fracPart.length) : 1,
        rounded: '0',
        roundedSci: '0',
        sigDigits: '0',
        chart: { type: 'donut', title: 'Digits in the number', slices: [{ label: 'Zero', value: 1 }], centerValue: '0' },
        note: 'Zero is a special case: conventions differ, so many teachers count only the zeros after the decimal point.',
      };
    }
    const steps: string[] = [];
    let sigDigits = nrm.digits;
    const lead = p.intPart.length + p.fracPart.length - nrm.digits.length;
    if (lead > 0) steps.push(`Leading zeros (${lead}) are never significant — they only place the decimal point`);
    let ambiguous = false;
    let trailingNS = 0;
    if (!p.hasPoint) {
      const trailing = sigDigits.length - (sigDigits.replace(/0+$/, '').length || 1);
      if (trailing > 0) {
        ambiguous = true;
        trailingNS = trailing;
        sigDigits = sigDigits.slice(0, sigDigits.length - trailing);
        steps.push(`The ${trailing} trailing zero${trailing > 1 ? 's' : ''} without a decimal point ${trailing > 1 ? 'are' : 'is'} treated as not significant (ambiguous)`);
      }
    } else if (/0$/.test(nrm.digits)) {
      steps.push('Trailing zeros after a decimal point are significant');
    }
    if (/[1-9]0+[1-9]/.test(sigDigits)) steps.push('Zeros between non-zero digits (“captive” zeros) are significant');
    steps.push(`Significant digits: ${sigDigits.split('').join(' ')} → ${sigDigits.length} sig fig${sigDigits.length > 1 ? 's' : ''}`);

    const count = sigDigits.length;
    const slices = [{ label: 'Significant', value: count }];
    if (lead > 0) slices.push({ label: 'Leading zeros', value: lead });
    if (trailingNS > 0) slices.push({ label: 'Ambiguous trailing zeros', value: trailingNS });
    const chart = { type: 'donut' as const, title: 'Digits in the number', slices, centerValue: String(count), centerLabel: count === 1 ? 'sig fig' : 'sig figs' };
    const n = num(v.n);
    let rounded: string | null = null;
    let roundedSci: string | null = null;
    if (n !== null) {
      if (!Number.isInteger(n) || n < 1 || n > 30) return { count, sigDigits, steps, chart, rounded: null, note: 'Round-to must be a whole number from 1 to 30.' };
      const r = roundDigits(nrm.digits, n);
      const e = nrm.e + r.carry;
      rounded = digitsToDecimal(r.digits, e, p.negative);
      // Mark significant trailing zeros in a whole number with a trailing decimal point.
      if (e === n - 1 && r.digits.endsWith('0')) rounded += '.';
      roundedSci = `${p.negative ? '-' : ''}${mantissa(r.digits, false)} × 10${sup(e)}`;
      steps.push(`Rounding to ${n}: look at digit ${n + 1} of ${nrm.digits} (${nrm.digits[n] ?? 'none'}) — ${Number(nrm.digits[n] ?? 0) >= 5 ? 'round up' : 'keep'}`);
      steps.push(`Result: ${rounded} = ${roundedSci}`);
      if (e > n - 1) steps.push('Scientific notation shows the precision unambiguously when a rounded whole number ends in zeros');
    }
    return {
      count,
      sigDigits,
      rounded,
      roundedSci,
      chart,
      steps,
      note: ambiguous ? 'Trailing zeros in a whole number are ambiguous. Write 1200. or 1.200 × 10³ if they were measured.' : undefined,
    };
  },
  content: {
    formula: [
      '1. Non-zero digits are always significant',
      '2. Zeros between non-zero digits are significant',
      '3. Leading zeros are never significant',
      '4. Trailing zeros count only if the number has a decimal point',
    ],
    body: [
      'Significant figures (sig figs) are the digits in a measurement that carry real information about its precision. Writing 2.50 cm instead of 2.5 cm says you measured to the nearest hundredth of a centimetre, so the trailing zero counts.',
      'The tricky part is zeros. Leading zeros, as in 0.0045, only show where the decimal point is, so they are not significant — 0.0045 has two sig figs. Zeros sandwiched between other digits, like the 0 in 305, always count. Trailing zeros count when there is a decimal point (4.500 has four), but in a whole number like 1200 they are ambiguous, and most courses treat them as not significant.',
      'To round to a given number of sig figs, keep that many digits starting from the first non-zero digit, and look at the next digit: 5 or more rounds up, less than 5 leaves it alone. Replace dropped digits to the left of the decimal point with zeros so the size of the number doesn’t change.',
    ],
    faq: [
      { q: 'How many sig figs does 100 have?', a: 'By the usual convention, one. Writing “100.” with a decimal point means three, and 1.0 × 10² means two. Scientific notation removes the ambiguity.' },
      { q: 'How do sig figs work in multiplication and division?', a: 'Round the answer to the smallest number of significant figures among the values you multiplied or divided. 2.5 × 3.14159 = 7.9 (two sig figs).' },
      { q: 'And in addition and subtraction?', a: 'There the rule is about decimal places, not sig figs: round to the fewest decimal places among the numbers. 12.11 + 0.3 = 12.4.' },
      { q: 'Do exact numbers limit sig figs?', a: 'No. Counted quantities (12 eggs) and defined constants (100 cm in a metre) are exact and have unlimited significant figures.' },
    ],
  },
  related: ['scientific-notation', 'rounding', 'percent-error'],
  examples: [
    { values: { value: '0.004560', n: 2 }, expect: { count: 4, rounded: '0.0046', roundedSci: '4.6 × 10⁻³' } },
    { values: { value: '1200', n: null }, expect: { count: 2 } },
    { values: { value: '1200.', n: 3 }, expect: { count: 4, rounded: '1200' } },
    { values: { value: '123.456', n: 4 }, expect: { count: 6, rounded: '123.5' } },
    { values: { value: '9.996', n: 3 }, expect: { count: 4, rounded: '10.0', roundedSci: '1.00 × 10¹' } },
    { values: { value: '3.050e5', n: 1 }, expect: { count: 4, rounded: '300000' } },
  ],
});

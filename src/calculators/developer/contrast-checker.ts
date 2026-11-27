import { defineCalculator } from '../../lib/types';
import { str } from '../../lib/helpers/text';

/** Parses #rgb or #rrggbb (the # is optional). Returns 0-255 channels or null. */
function parseHex(input: string): [number, number, number] | null {
  const s = input.trim().replace(/^#/, '');
  if (!/^[0-9a-f]+$/i.test(s) || ![3, 6].includes(s.length)) return null;
  const full = s.length === 3 ? Array.from(s, (c) => c + c).join('') : s;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

const lin = (u: number) => (u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255);
const hex6 = (c: [number, number, number]) => '#' + c.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
const verdict = (ratio: number, min: number) => (ratio >= min ? `Pass (needs ${min}:1)` : `Fail (needs ${min}:1)`);

export default defineCalculator({
  slug: 'contrast-checker',
  title: 'WCAG Color Contrast Checker',
  category: 'developer',
  description: 'Check the contrast ratio between a text color and a background color, with WCAG AA and AAA pass or fail for normal and large text.',
  keywords: ['contrast checker', 'wcag contrast ratio', 'color contrast calculator', 'accessible text color', 'aa aaa contrast', 'hex contrast'],
  updated: '2026-11-27',
  inputs: [
    { id: 'fg', label: 'Text color (hex)', type: 'text', default: '#767676', placeholder: '#767676 or #777', info: 'The foreground color as a 3 or 6 digit hex code. The # is optional.' },
    { id: 'bg', label: 'Background color (hex)', type: 'text', default: '#FFFFFF', placeholder: '#FFFFFF or #fff', info: 'The background color as a 3 or 6 digit hex code.' },
  ],
  outputs: [
    { id: 'ratio', label: 'Contrast ratio', format: 'number', precision: 2, primary: true, info: 'From 1 (identical colors) to 21 (black on white). Shown as a ratio to 1.' },
    { id: 'aaNormal', label: 'AA, normal text', format: 'text', info: 'WCAG level AA for body text needs 4.5:1.' },
    { id: 'aaLarge', label: 'AA, large text', format: 'text', info: 'Large text (18 pt, or 14 pt bold, and up) needs 3:1 at level AA. The same 3:1 applies to UI components and graphics.' },
    { id: 'aaaNormal', label: 'AAA, normal text', format: 'text', info: 'WCAG level AAA for body text needs 7:1.' },
    { id: 'aaaLarge', label: 'AAA, large text', format: 'text', info: 'Large text needs 4.5:1 at level AAA.' },
  ],
  compute: (v) => {
    const f = parseHex(str(v.fg));
    const b = parseHex(str(v.bg));
    if (!f || !b) return { ratio: null, error: 'Enter both colors as 3 or 6 digit hex codes, like #767676 or #fff.' };
    const lf = luminance(f);
    const lb = luminance(b);
    const hi = Math.max(lf, lb);
    const lo = Math.min(lf, lb);
    const ratio = (hi + 0.05) / (lo + 0.05);
    // WCAG does not round up: 4.499 fails 4.5, so compare the raw ratio.
    const passes = [4.5, 3, 7, 4.5].map((m) => ratio >= m).filter(Boolean).length;
    return {
      ratio,
      aaNormal: verdict(ratio, 4.5),
      aaLarge: verdict(ratio, 3),
      aaaNormal: verdict(ratio, 7),
      aaaLarge: verdict(ratio, 4.5),
      tone: ratio >= 4.5 ? 'good' : 'warn',
      badge: `${passes} of 4 WCAG checks pass`,
      chart: {
        type: 'bar',
        title: 'Contrast ratio against each threshold',
        categories: ['Your colors', 'AA large', 'AA normal', 'AAA normal'],
        series: [{ name: 'Ratio', values: [ratio, 3, 4.5, 7] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Text ${hex6(f)} has relative luminance ${lf.toFixed(4)}; background ${hex6(b)} has ${lb.toFixed(4)}`,
        `Contrast = (${hi.toFixed(4)} + 0.05) ÷ (${lo.toFixed(4)} + 0.05) = ${ratio.toFixed(2)}:1`,
      ],
      note: 'Contrast ratio is one part of accessibility. It does not check font weight, thin strokes, text over images, or how the colors look to people with color vision differences.',
    };
  },
  content: {
    formula: [
      'Each channel: c = value ÷ 255; linear = c ÷ 12.92 if c ≤ 0.04045, else ((c + 0.055) ÷ 1.055)^2.4',
      'Relative luminance L = 0.2126 R + 0.7152 G + 0.0722 B (linear values)',
      'Contrast ratio = (L lighter + 0.05) ÷ (L darker + 0.05)',
    ],
    body: [
      'Low-contrast text is hard to read for many people, so the Web Content Accessibility Guidelines (WCAG) set minimum contrast ratios between text and its background. This checker takes two hex colors, computes the ratio with the WCAG relative luminance formula, and shows whether it passes level AA and AAA for normal and large text.',
      'The thresholds are 4.5:1 for normal text at AA, 3:1 for large text at AA, 7:1 for normal text at AAA and 4.5:1 for large text at AAA. Large text means at least 18 point, or 14 point bold. The 3:1 level also applies to the borders of buttons and inputs and to meaningful icons.',
      'The ratio is compared without rounding up, so a ratio of 4.499 does not pass 4.5. Colors with transparency, text on images and gradients are not covered: flatten them to a solid color first.',
    ],
    faq: [
      { q: 'What contrast ratio do I need?', a: 'For normal text, 4.5:1 to meet AA and 7:1 to meet AAA. For large text, 3:1 for AA and 4.5:1 for AAA.' },
      { q: 'What is the result for #767676 on white?', a: 'About 4.54:1. It is the lightest gray that passes AA for normal text on a white background. #777777 gives about 4.48:1 and fails.' },
      { q: 'What is the highest and lowest possible ratio?', a: 'Black on white is 21:1. Two identical colors are 1:1.' },
      { q: 'Does it matter which color is the text?', a: 'No. The formula always divides the lighter luminance by the darker one, so swapping text and background gives the same ratio.' },
      { q: 'Does passing mean my design is accessible?', a: 'Not by itself. Contrast is one requirement. Text size, font weight, focus states and color-blind safe design matter too.' },
    ],
    sources: [{ label: 'W3C: Web Content Accessibility Guidelines 2.1, contrast (minimum) and relative luminance', url: 'https://www.w3.org/TR/WCAG21/' }],
  },
  related: ['color-converter', 'px-to-rem'],
  examples: [
    { values: { fg: '#000000', bg: '#FFFFFF' }, expect: { ratio: 21, aaNormal: 'Pass (needs 4.5:1)', aaaNormal: 'Pass (needs 7:1)' }, tolerance: 0.001 },
    // L(#767676)=0.18116; 1.05 / 0.23116 = 4.5423
    { values: { fg: '#767676', bg: '#FFFFFF' }, expect: { ratio: 4.5423, aaNormal: 'Pass (needs 4.5:1)', aaaNormal: 'Fail (needs 7:1)', aaLarge: 'Pass (needs 3:1)' }, tolerance: 0.005 },
    // #777 is 119 -> L 0.18490; 1.05 / 0.2349 = 4.4700
    { values: { fg: '#777', bg: '#fff' }, expect: { ratio: 4.47, aaNormal: 'Fail (needs 4.5:1)', aaLarge: 'Pass (needs 3:1)' }, tolerance: 0.005 },
    { values: { fg: '#123', bg: '#12' }, expect: { error: 'Enter both colors as 3 or 6 digit hex codes, like #767676 or #fff.' } },
  ],
});

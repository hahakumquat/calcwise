import { defineCalculator, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';

const f = (n: number, d = 4) => n.toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'px-to-rem',
  title: 'PX to REM Calculator',
  category: 'developer',
  description: 'Convert pixels to rem, em and points for CSS, with an editable root and parent font size, and convert a rem value back to pixels.',
  metaDescription: 'Convert px to rem, em and pt for CSS. Set the root and parent font size, see the formula, and convert a rem value back to pixels.',
  updated: '2026-11-27',
  keywords: ['px to rem', 'pixels to rem calculator', 'px to em', 'px to pt', 'rem to px', 'css unit converter', 'rem calculator'],
  inputs: [
    { id: 'px', label: 'Pixel value', type: 'number', default: 24, min: 0, step: 0.5, suffix: 'px', info: 'The size in CSS pixels that you want to convert, such as a font size, margin or width.' },
    { id: 'root', label: 'Root font size', type: 'number', default: 16, min: 0, step: 0.5, suffix: 'px', info: 'The font size of the html element, which rem units are relative to. Browsers default to 16 px.' },
    { id: 'parent', label: 'Parent font size', type: 'number', default: 16, min: 0, step: 0.5, suffix: 'px', info: 'The font size of the parent element, which em units are relative to. Use the root size if unsure.' },
    { id: 'remIn', label: 'Rem value to convert to px', type: 'number', default: 1.5, min: 0, step: 0.125, suffix: 'rem', info: 'Optional. A rem value to convert back to pixels using the root font size above.' },
  ],
  outputs: [
    { id: 'rem', label: 'Rem', format: 'number', precision: 4, suffix: 'rem', primary: true, info: 'Pixels divided by the root font size.' },
    { id: 'em', label: 'Em', format: 'number', precision: 4, suffix: 'em', info: 'Pixels divided by the parent font size.' },
    { id: 'pt', label: 'Points', format: 'number', precision: 3, suffix: 'pt', info: 'Pixels times 0.75, since CSS defines 96 px and 72 pt per inch.' },
    { id: 'remToPx', label: 'Rem value in pixels', format: 'number', precision: 3, suffix: 'px', info: 'The rem value above multiplied by the root font size.' },
  ],
  compute: (v) => {
    const px = num(v.px);
    const root = num(v.root);
    const parent = num(v.parent);
    const remIn = num(v.remIn);
    if (px === null || root === null || parent === null) return { rem: null };
    if (root <= 0) return { rem: null, error: 'Enter a root font size above zero.' };
    if (parent <= 0) return { rem: null, error: 'Enter a parent font size above zero.' };
    if (px < 0) return { rem: null, error: 'Enter a pixel value of zero or more.' };
    const rem = px / root;
    const em = px / parent;
    const pt = px * 0.75;
    const steps: string[] = [
        `rem = ${f(px)} ÷ ${f(root)} = ${f(rem)}`,
        `em = ${f(px)} ÷ ${f(parent)} = ${f(em)}`,
        `pt = ${f(px)} × 0.75 = ${f(pt)}`,
      ];
    const out: ComputeResult = {
      rem,
      em,
      pt,
      tone: 'good',
      badge: `${f(rem)} rem`,
      note: `At a ${f(root)} px root, ${f(px)} px is ${f(rem)} rem. Write it as ${f(rem)}rem in CSS.`,
      steps,
    };
    if (remIn !== null && remIn >= 0) {
      out.remToPx = remIn * root;
      steps.push(`px = ${f(remIn)} × ${f(root)} = ${f(remIn * root)}`);
    }
    return out;
  },
  content: {
    formula: ['rem = px ÷ root font size', 'em = px ÷ parent font size', 'pt = px × 0.75', 'px = rem × root font size'],
    body: [
      'Rem and em are relative CSS units. One rem equals the font size of the root html element, which browsers set to 16 px unless you change it. So 24 px at a 16 px root is 24 ÷ 16 = 1.5 rem, and 14 px is 0.875 rem.',
      'Em works the same way, but against the font size of the parent element. If the parent is 20 px, then 15 px is 15 ÷ 20 = 0.75 em. Because em compounds through nested elements, rem is easier to reason about for spacing and type scales.',
      'Points come from print. CSS defines 96 pixels per inch and 72 points per inch, so one pixel is 0.75 pt and 24 px is 18 pt. Using rem lets text scale when a visitor changes their browser font size, which pixel values do not.',
    ],
    faq: [
      { q: 'How many rem is 24 px?', a: 'At the default 16 px root font size, 24 px is 1.5 rem (24 ÷ 16).' },
      { q: 'How many rem is 14 px?', a: 'At a 16 px root, 14 px is 0.875 rem (14 ÷ 16).' },
      { q: 'How do I convert px to em?', a: 'Divide the pixel value by the parent element\'s font size. With a 20 px parent, 15 px is 0.75 em.' },
      { q: 'How many points is 24 px?', a: 'Multiply by 0.75, so 24 px is 18 pt. CSS defines 96 px and 72 pt per inch.' },
    ],
  },
  related: ['screen-ppi', 'aspect-ratio'],
  examples: [
    // 24/16 = 1.5; em 24/16 = 1.5; pt 24*0.75 = 18; 1.5 rem * 16 = 24 px
    { values: { px: 24, root: 16, parent: 16, remIn: 1.5 }, expect: { rem: 1.5, em: 1.5, pt: 18, remToPx: 24 }, tolerance: 1e-9 },
    // 14/16 = 0.875; 15 px at parent 20 -> 0.75 em; pt 11.25; 2.5 rem * 10 = 25 px
    { values: { px: 15, root: 10, parent: 20, remIn: 2.5 }, expect: { rem: 1.5, em: 0.75, pt: 11.25, remToPx: 25 }, tolerance: 1e-9 },
    { values: { px: 14, root: 16, parent: 16, remIn: 1 }, expect: { rem: 0.875, pt: 10.5, remToPx: 16 }, tolerance: 1e-9 },
  ],
});

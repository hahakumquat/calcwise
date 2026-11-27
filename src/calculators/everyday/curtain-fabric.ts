import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'curtain-fabric',
  title: 'Curtain Fabric Yardage Calculator',
  category: 'everyday',
  description: 'Work out how many yards of fabric you need for curtains from window width, curtain height, fullness, fabric width, hem allowance and pattern repeat.',
  keywords: ['curtain fabric calculator', 'how much fabric for curtains', 'curtain yardage calculator', 'drapery fabric yardage', 'curtain fullness'],
  updated: '2026-11-27',
  inputs: [
    { id: 'windowWidth', label: 'Window or rod width', type: 'number', suffix: 'in', default: 48, min: 0, step: 0.5, info: 'The width the curtains need to cover, in inches.' },
    { id: 'height', label: 'Finished curtain height', type: 'number', suffix: 'in', default: 60, min: 0, step: 0.5, info: 'From the rod or hook line down to where the curtain should end, in inches.' },
    { id: 'fullness', label: 'Fullness multiplier', type: 'number', suffix: '×', default: 2, min: 1, step: 0.25, info: 'How much wider the fabric is than the window. 2 is a common choice; 1.5 is flatter, 3 is very full.' },
    { id: 'fabricWidth', label: 'Fabric width', type: 'number', suffix: 'in', default: 54, min: 1, step: 0.5, info: 'Usable width of the bolt, printed on the end. Home decor fabric is often 54 in.' },
    { id: 'allowance', label: 'Hem and header allowance', type: 'number', suffix: 'in', default: 12, min: 0, step: 0.5, info: 'Extra length for the bottom hem and the top header, combined. 12 in is a typical figure.' },
    { id: 'repeat', label: 'Pattern repeat', type: 'number', suffix: 'in', default: 0, min: 0, step: 0.25, help: 'Leave at 0 for solid fabric.', info: 'The vertical distance before the pattern repeats. Each cut length is rounded up to a whole number of repeats so panels match.' },
  ],
  outputs: [
    { id: 'yards', label: 'Fabric needed', suffix: 'yd', precision: 2, primary: true, info: 'Panels × cut length ÷ 36 inches per yard.' },
    { id: 'buyYards', label: 'Buy (next quarter yard)', suffix: 'yd', precision: 2, info: 'The yardage rounded up to the next 1/4 yard.' },
    { id: 'panels', label: 'Fabric widths (panels)', format: 'integer', info: 'Finished width ÷ fabric width, rounded up.' },
    { id: 'cutLength', label: 'Cut length per panel', suffix: 'in', precision: 2, info: 'Height + allowance, rounded up to a multiple of the pattern repeat if there is one.' },
    { id: 'finishedWidth', label: 'Total fabric width', suffix: 'in', precision: 2, info: 'Window width × fullness.' },
  ],
  compute: (v) => {
    const w = num(v.windowWidth), h = num(v.height), f = num(v.fullness), fw = num(v.fabricWidth);
    const a = v.allowance === '' || v.allowance === undefined || v.allowance === null ? 0 : num(v.allowance);
    const r = v.repeat === '' || v.repeat === undefined || v.repeat === null ? 0 : num(v.repeat);
    if ([w, h, f, fw, a, r].some((x) => x === null)) return { yards: null };
    const W = w as number, H = h as number, F = f as number, FW = fw as number, A = a as number, R = r as number;
    if (W <= 0 || H <= 0 || F < 1 || FW <= 0 || A < 0 || R < 0) return { yards: null };
    const finishedWidth = W * F;
    const panels = Math.ceil(finishedWidth / FW - 1e-9);
    const base = H + A;
    const cutLength = R > 0 ? Math.ceil(base / R - 1e-9) * R : base;
    const totalIn = panels * cutLength;
    const yards = totalIn / 36;
    const buyYards = Math.ceil(yards * 4 - 1e-9) / 4;
    const steps = [
      `Total fabric width: ${fmt(W)} in × ${fmt(F)} = ${fmt(finishedWidth)} in`,
      `Panels: ${fmt(finishedWidth)} ÷ ${fmt(FW)} in fabric = ${fmt(finishedWidth / FW, 3)}, rounded up to ${panels}`,
      `Cut length: ${fmt(H)} + ${fmt(A)} = ${fmt(base)} in` + (R > 0 ? `, rounded up to a multiple of ${fmt(R)} in repeat = ${fmt(cutLength)} in` : ''),
      `Yards: ${panels} × ${fmt(cutLength)} in ÷ 36 = ${fmt(yards, 3)} yd, buy ${fmt(buyYards)} yd`,
    ];
    return {
      yards,
      buyYards,
      panels,
      cutLength,
      finishedWidth,
      tone: 'ok',
      badge: `Buy ${fmt(buyYards)} yd`,
      note: `You need ${panels} ${panels === 1 ? 'width' : 'widths'} of fabric cut ${fmt(cutLength)} in long, which is ${fmt(yards)} yards. Buy ${fmt(buyYards)} yards. Add a little extra if you are unsure of your measurements.`,
      chart: {
        type: 'bar' as const,
        title: 'Yards: needed vs. to buy',
        categories: ['Needed', 'Buy'],
        series: [{ name: 'Yards', values: [+yards.toFixed(2), buyYards] }],
        format: { suffix: ' yd' },
        highlight: 1,
      },
      steps,
    };
  },
  content: {
    formula: [
      'Total fabric width = window width × fullness',
      'Panels = total fabric width ÷ fabric width, rounded up',
      'Cut length = finished height + hem and header allowance (rounded up to a whole number of pattern repeats if the fabric has a pattern)',
      'Yards = panels × cut length ÷ 36',
    ],
    body: [
      'Curtains look best when they are gathered, so the fabric has to be wider than the window. Enter the width you want to cover, the finished height, and a fullness multiplier (2 is a common starting point), and this calculator works out how many widths of fabric to cut and how many yards to buy.',
      'The allowance covers the bottom hem and the top header or rod pocket, combined. If your fabric has a pattern, enter the repeat so every cut length is rounded up to a whole number of repeats; that keeps the pattern lined up across panels but uses more fabric.',
      'The buy figure is rounded up to the next quarter yard. Check the fabric width on the bolt end, and buy a little extra if you are unsure, since shrinkage and uneven cuts can use up the spare. For other room projects, see the square footage calculator or the wrapping paper calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much fabric do I need for a 48 inch window?', a: 'With the defaults (60 in height, 2× fullness, 54 in fabric, 12 in allowance), the total width is 96 in, so you need 2 panels cut 72 in long. That is 144 in, or 4.0 yards.' },
      { q: 'How does a pattern repeat change the yardage?', a: 'The cut length is rounded up to a whole number of repeats. For a 72 in window, 84 in height, 2.5× fullness, 54 in fabric, 12 in allowance and a 25 in repeat, the 96 in cut length rounds up to 100 in. With 4 panels that is 400 in, or 11.11 yards, so buy 11.25.' },
      { q: 'What fullness should I use?', a: 'A fullness of 2 is a common choice. Lighter fabric can look better at 2.5 to 3, while 1.5 gives a flatter look. It is a style choice, so change it to suit your fabric.' },
      { q: 'Why does the calculator round up to a quarter yard?', a: 'Stores usually sell fabric by the quarter yard or finer. The buy figure rounds the exact yardage up so you do not come up short, for example 11.11 yards becomes 11.25.' },
    ],
    sources: [],
  },
  related: ['square-footage', 'wrapping-paper'],
  examples: [
    // width 48*2 = 96; panels ceil(96/54)=2; cut 60+12 = 72; 2*72 = 144 in = 4.0 yd; buy 4.0
    { values: { windowWidth: 48, height: 60, fullness: 2, fabricWidth: 54, allowance: 12, repeat: 0 }, expect: { finishedWidth: 96, panels: 2, cutLength: 72, yards: 4, buyYards: 4 }, tolerance: 0.001 },
    // width 72*2.5 = 180; panels ceil(180/54 = 3.33) = 4; base 84+12 = 96; repeat 25 -> ceil(3.84)=4 -> 100; 4*100 = 400 in = 11.1111 yd; buy 11.25
    { values: { windowWidth: 72, height: 84, fullness: 2.5, fabricWidth: 54, allowance: 12, repeat: 25 }, expect: { finishedWidth: 180, panels: 4, cutLength: 100, yards: 11.1111, buyYards: 11.25 }, tolerance: 0.001 },
  ],
});

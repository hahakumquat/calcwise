import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'ribbon-length',
  title: 'Gift Ribbon Length Calculator',
  category: 'everyday',
  description: 'Work out how much ribbon to wrap a gift box, from its length, width and height, the wrap style and bow size. Totals in inches, feet and yards.',
  keywords: ['ribbon length calculator', 'how much ribbon do i need for a gift box', 'ribbon for wrapping a present', 'how much ribbon for a bow', 'gift ribbon yards needed'],
  updated: '2026-11-27',
  inputs: [
    { id: 'unit', label: 'Units', type: 'select', segmented: true, default: 'in', options: [{ value: 'in', label: 'Inches' }, { value: 'cm', label: 'Centimetres' }], info: 'Box size and bow allowance use this unit.' },
    { id: 'l', label: 'Box length', type: 'number', default: 10, min: 0, step: 0.5, info: 'The longest side of the box.' },
    { id: 'w', label: 'Box width', type: 'number', default: 8, min: 0, step: 0.5, info: 'The second side of the box.' },
    { id: 'h', label: 'Box height', type: 'number', default: 4, min: 0, step: 0.5, info: 'How tall the box is.' },
    { id: 'style', label: 'Wrap style', type: 'select', segmented: true, default: 'cross', options: [{ value: 'single', label: 'Single loop' }, { value: 'cross', label: 'Cross' }], info: 'Single loop goes once around the box. Cross goes around both ways.' },
    { id: 'bow', label: 'Bow allowance', type: 'number', default: 20, min: 0, step: 1, help: 'Extra ribbon for the knot and bow, in the unit above.', info: 'About 20 in (50 cm) makes a modest bow. Use more for a fluffy one.' },
    { id: 'n', label: 'Number of boxes', type: 'number', default: 1, min: 1, step: 1, info: 'How many gifts of this size you are wrapping.' },
  ],
  outputs: [
    { id: 'total', label: 'Total ribbon (in or cm)', format: 'number', precision: 1, primary: true, info: 'Ribbon per box times the number of boxes, in the unit you chose.' },
    { id: 'perBox', label: 'Ribbon per box (in or cm)', format: 'number', precision: 1, info: 'Wrap length plus bow allowance.' },
    { id: 'feet', label: 'Total in feet', format: 'number', precision: 1, info: 'Total ribbon in feet. Centimetres are converted at 2.54 cm per inch.' },
    { id: 'yards', label: 'Total in yards', format: 'number', precision: 2, info: 'Total ribbon in yards, the way ribbon is usually sold.' },
  ],
  compute: (v) => {
    const l = num(v.l), w = num(v.w), h = num(v.h), bow = num(v.bow), n = num(v.n);
    if ([l, w, h, bow, n].some((x) => x === null)) return { total: null };
    if (l! <= 0 || w! <= 0 || h! <= 0) return { total: null, error: 'Enter box sizes above 0.' };
    if (bow! < 0 || n! < 1) return { total: null };
    const metric = v.unit === 'cm';
    const u = metric ? 'cm' : 'in';
    const single = 2 * l! + 2 * h!;
    const cross = 2 * l! + 2 * w! + 4 * h!;
    const wrap = v.style === 'single' ? single : cross;
    const perBox = wrap + bow!;
    const total = perBox * n!;
    const inches = metric ? total / 2.54 : total;
    const feet = inches / 12;
    const yards = inches / 36;
    return {
      total,
      perBox,
      feet,
      yards,
      tone: 'ok',
      badge: `${fmt(+yards.toFixed(2))} yd of ribbon`,
      chart: {
        type: 'bar',
        title: `Ribbon per box by wrap style (${u})`,
        categories: ['Single loop', 'Cross'],
        series: [{ name: 'Ribbon per box', values: [single + bow!, cross + bow!] }],
        highlight: v.style === 'single' ? 0 : 1,
      },
      steps: [
        v.style === 'single'
          ? `Wrap = 2 × ${fmt(l!)} + 2 × ${fmt(h!)} = ${fmt(single)} ${u}`
          : `Wrap = 2 × ${fmt(l!)} + 2 × ${fmt(w!)} + 4 × ${fmt(h!)} = ${fmt(cross)} ${u}`,
        `Per box = ${fmt(wrap)} + ${fmt(bow!)} bow = ${fmt(perBox)} ${u}`,
        `Total = ${fmt(perBox)} × ${fmt(n!)} = ${fmt(total)} ${u} = ${fmt(+yards.toFixed(2))} yd`,
      ],
      note: 'Add a few extra inches if your ribbon is thick or you tie a double knot.',
    };
  },
  content: {
    formula: ['Single loop = 2 × length + 2 × height', 'Cross = 2 × length + 2 × width + 4 × height', 'Ribbon per box = wrap + bow allowance; total = per box × number of boxes'],
    body: [
      'A single loop runs once around the box, over the top, down both sides and under the bottom, which takes 2 × length + 2 × height. A cross wrap adds a second loop the other way, 2 × width + 2 × height, so the two together need 2 × length + 2 × width + 4 × height. The bow allowance is extra ribbon for the knot and loops, and is a judgement call rather than a standard.',
      'For a 10 × 8 × 4 inch box wrapped in a cross, the wrap is 20 + 16 + 16 = 52 inches. Add a 20 inch bow and each box needs 72 inches, which is 6 feet or 2 yards. Five such boxes need 360 inches, which is 30 feet or 10 yards.',
      'Round up when you buy, and add a little for trimming the ends. If you pick centimetres, the feet and yards are converted at 2.54 cm per inch.',
    ],
    faq: [
      { q: 'How much ribbon do I need for a 10 × 8 × 4 inch box?', a: 'With a cross wrap and a 20 inch bow, 72 inches (6 feet, 2 yards). With a single loop it is 28 + 20 = 48 inches (4 feet).' },
      { q: 'How much ribbon do I need for five of those boxes?', a: '360 inches, which is 30 feet or 10 yards, using a cross wrap and a 20 inch bow.' },
      { q: 'How big should the bow allowance be?', a: 'About 20 inches (50 cm) gives a modest bow. It is an estimate, so use more for a large, fluffy bow.' },
      { q: 'Does it work in centimetres?', a: 'Yes. Pick centimetres and enter the box and bow in cm. The feet and yards are converted from the total.' },
    ],
    sources: [],
  },
  related: ['wrapping-paper', 'holiday-lights', 'christmas-tree-cost'],
  examples: [
    // cross: 2*10 + 2*8 + 4*4 = 52; +20 = 72 in = 6 ft = 2 yd
    { values: { unit: 'in', l: 10, w: 8, h: 4, style: 'cross', bow: 20, n: 1 }, expect: { total: 72, perBox: 72, feet: 6, yards: 2 }, tolerance: 1e-9 },
    // 5 boxes: 360 in = 30 ft = 10 yd
    { values: { unit: 'in', l: 10, w: 8, h: 4, style: 'cross', bow: 20, n: 5 }, expect: { total: 360, feet: 30, yards: 10 }, tolerance: 1e-9 },
    // single: 2*10 + 2*4 = 28; +20 = 48 in = 4 ft = 1.3333 yd
    { values: { unit: 'in', l: 10, w: 8, h: 4, style: 'single', bow: 20, n: 1 }, expect: { perBox: 48, feet: 4, yards: 1.333333 }, tolerance: 1e-5 },
    // cm: cross 50+40+40 = 130; +50 = 180 cm = 70.866 in = 5.9055 ft = 1.9685 yd
    { values: { unit: 'cm', l: 25, w: 20, h: 10, style: 'cross', bow: 50, n: 1 }, expect: { total: 180, feet: 5.905512, yards: 1.968504 }, tolerance: 1e-5 },
  ],
});

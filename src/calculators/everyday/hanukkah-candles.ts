import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;

export default defineCalculator({
  slug: 'hanukkah-candles',
  title: 'Hanukkah Candles Calculator',
  category: 'everyday',
  description: 'Work out how many Hanukkah candles you need for 1 to 8 nights, with or without the shamash, for any number of menorahs, and how many boxes to buy.',
  keywords: ['hanukkah candles calculator', 'how many candles for hanukkah', 'chanukah candles', 'menorah candles needed', 'how many boxes of hanukkah candles', 'shamash candle'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'nights', label: 'Nights', type: 'number', default: 8, min: 1, max: 8, step: 1, suffix: 'nights', info: 'How many nights you will light, from 1 to 8. Hanukkah lasts eight nights.' },
    { id: 'menorahs', label: 'Menorahs', type: 'number', default: 1, min: 1, step: 1, info: 'How many menorahs your household lights. Many families light one each.' },
    { id: 'shamash', label: 'Count a shamash candle each night', type: 'toggle', default: true, info: 'The shamash is the helper candle used to light the others. On adds one candle per menorah per night.' },
    { id: 'box', label: 'Candles per box', type: 'number', default: 44, min: 1, step: 1, info: 'Many standard boxes hold 44, enough for eight nights with a shamash. Check your box and change this if it differs.' },
  ],
  outputs: [
    { id: 'total', label: 'Candles needed', format: 'integer', primary: true, info: 'Candles for all menorahs across all nights, including the shamash if counted.' },
    { id: 'perMenorah', label: 'Candles per menorah', format: 'integer', info: 'Candles for one menorah over your nights.' },
    { id: 'boxes', label: 'Boxes to buy', format: 'integer', info: 'Candles needed ÷ candles per box, rounded up.' },
    { id: 'spare', label: 'Spare candles', format: 'integer', info: 'Candles left over in the boxes you buy.' },
  ],
  compute: (v) => {
    const nights = num(v.nights), menorahs = num(v.menorahs), box = num(v.box);
    if ([nights, menorahs, box].some((x) => x === null)) return { total: null };
    if (!Number.isInteger(nights!) || !Number.isInteger(menorahs!) || !Number.isInteger(box!)) return { total: null };
    if (nights! < 1 || nights! > 8 || menorahs! < 1 || box! < 1) return { total: null };
    const shamash = v.shamash === 'on';
    const flames = (nights! * (nights! + 1)) / 2;
    const helper = shamash ? nights! : 0;
    const perMenorah = flames + helper;
    const total = perMenorah * menorahs!;
    const boxes = Math.ceil(total / box!);
    const spare = boxes * box! - total;
    if (![total, boxes].every(Number.isFinite)) return { total: null };
    const nightsByCount = Array.from({ length: nights! }, (_, i) => i + 1 + (shamash ? 1 : 0));
    return {
      total,
      perMenorah,
      boxes,
      spare,
      tone: 'ok',
      badge: `${plural(boxes, 'box', 'boxes')}`,
      note: `${plural(nights!, 'night', 'nights')} on ${plural(menorahs!, 'menorah', 'menorahs')}${shamash ? ' with a shamash' : ' without a shamash'} needs ${plural(total, 'candle', 'candles')}. At ${fmt(box!)} per box, buy ${plural(boxes, 'box', 'boxes')} and you will have ${plural(spare, 'candle', 'candles')} spare. Start dates change every year, so check a calendar for this year’s dates.`,
      chart: {
        type: 'bar',
        title: 'Candles lit each night (one menorah)',
        categories: nightsByCount.map((_, i) => `Night ${i + 1}`),
        series: [{ name: 'Candles', values: nightsByCount }],
        format: { format: 'integer' },
      },
      steps: [
        `Flames for one menorah = ${nights} × (${nights} + 1) ÷ 2 = ${fmt(flames)}`,
        `Shamash = ${shamash ? `1 per night × ${nights} = ${fmt(helper)}` : 'not counted = 0'}`,
        `Per menorah = ${fmt(flames)} + ${fmt(helper)} = ${fmt(perMenorah)}; × ${fmt(menorahs!)} menorahs = ${fmt(total)}`,
        `Boxes = ${fmt(total)} ÷ ${fmt(box!)}, rounded up = ${fmt(boxes)}`,
      ],
    };
  },
  content: {
    formula: [
      'Candles per menorah = nights × (nights + 1) ÷ 2, plus one per night if you use a shamash',
      'Total candles = candles per menorah × number of menorahs',
      'Boxes = total candles ÷ candles per box, rounded up',
    ],
    body: [
      'On the first night of Hanukkah one candle is lit, on the second night two, and so on up to eight. Adding those up for eight nights gives 36 candles for each menorah. If you also light a shamash, the helper candle used to light the others, that adds one more each night, so 8 more and 44 in all.',
      'Multiply by the number of menorahs your household lights, then divide by the number of candles in a box and round up to see how many boxes to buy. Many standard boxes hold 44, which covers one menorah for all eight nights with a shamash, but boxes differ, so check yours and edit the box size.',
      'Example: 3 menorahs for 8 nights with a shamash is 44 × 3 = 132 candles, which is 3 boxes of 44. Five nights without a shamash is 1 + 2 + 3 + 4 + 5 = 15 candles.',
      'Hanukkah starts on a different date each year because it follows the Hebrew calendar. This calculator does not list dates, so check a calendar for this year’s start. Some families light with oil instead of candles, which this page does not cover.',
      'Safety: never leave lit candles unattended. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How many candles do I need for all eight nights?', a: 'One menorah needs 36 candles for eight nights, or 44 if you light a shamash each night. This calculator shows 44 by default.' },
      { q: 'How many boxes should I buy?', a: 'Divide the total candles by the candles in a box and round up. With the defaults, 44 candles and 44 per box is 1 box. Three menorahs need 132 candles, or 3 boxes.' },
      { q: 'What is the shamash?', a: 'The shamash is the helper candle used to light the others. It is usually set apart from the rest of the menorah. Turn the switch off if you do not want it counted.' },
      { q: 'How many candles do I need for fewer nights?', a: 'Use the nights box. Five nights without a shamash is 1 + 2 + 3 + 4 + 5 = 15 candles for one menorah.' },
      { q: 'When does Hanukkah start?', a: 'The date changes every year because it follows the Hebrew calendar. Check a calendar for this year’s dates.' },
    ],
    sources: [],
  },
  related: ['candle-burn-time'],
  examples: [
    // 8*9/2 = 36; + 8 shamash = 44; 1 menorah = 44; ceil(44/44) = 1 box; 0 spare
    { values: { nights: 8, menorahs: 1, shamash: 'on', box: 44 }, expect: { total: 44, perMenorah: 44, boxes: 1, spare: 0 }, tolerance: 0 },
    // 44 * 3 = 132; 132/44 = 3 boxes; 0 spare
    { values: { nights: 8, menorahs: 3, shamash: 'on', box: 44 }, expect: { total: 132, perMenorah: 44, boxes: 3, spare: 0 }, tolerance: 0 },
    // 5*6/2 = 15; no shamash; 15/44 -> 1 box; 44-15 = 29 spare
    { values: { nights: 5, menorahs: 1, shamash: 'off', box: 44 }, expect: { total: 15, perMenorah: 15, boxes: 1, spare: 29 }, tolerance: 0 },
  ],
});

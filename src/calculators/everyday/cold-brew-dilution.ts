import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const r = (x: number, d = 1) => +x.toFixed(d);

export default defineCalculator({
  slug: 'cold-brew-dilution',
  title: 'Cold Brew Concentrate Dilution Calculator',
  category: 'everyday',
  description: 'Find how much cold brew concentrate and water to pour for your glass, plus the grounds needed to make a batch of concentrate. Works in ml or any unit.',
  keywords: ['cold brew dilution calculator', 'cold brew concentrate ratio', 'how much water to dilute cold brew', 'cold brew concentrate to water', 'cold brew grounds per batch', 'cold brew 1:1 dilution'],
  updated: '2026-11-27',
  inputs: [
    { id: 'final', label: 'Final drink volume', type: 'number', suffix: 'ml', default: 500, min: 0, step: 10, info: 'The total amount of drink you want in the glass or jug, concentrate plus water. Any volume unit works as long as you stay consistent.' },
    { id: 'dilution', label: 'Dilution (parts water per 1 part concentrate)', type: 'number', default: 1, min: 0, step: 0.25, info: '1 means equal parts concentrate and water (1:1). 2 means two parts water for every part concentrate. 0 means drink it undiluted.' },
    { id: 'ratio', label: 'Brew ratio (parts water per 1 part coffee, by weight)', type: 'number', default: 5, min: 0, step: 0.5, info: '5 (1:5) is a common starting point for concentrate. It is editable; many people use anything from about 4 to 8. Only used for the batch grounds figure.' },
    { id: 'batch', label: 'Batch water for making concentrate', type: 'number', suffix: 'ml', default: 1000, min: 0, step: 100, info: 'How much water you plan to steep with. Water is treated as 1 ml = 1 g.' },
  ],
  outputs: [
    { id: 'concentrate', label: 'Concentrate to pour', format: 'number', precision: 1, primary: true, info: 'Final volume divided by (1 + dilution).' },
    { id: 'water', label: 'Water to add', format: 'number', precision: 1, info: 'Final volume minus concentrate.' },
    { id: 'grounds', label: 'Grounds for the batch (g)', format: 'number', precision: 1, info: 'Batch water divided by the brew ratio number, with 1 ml of water counted as 1 g.' },
  ],
  compute: (v) => {
    const f = num(v.final);
    const d = num(v.dilution);
    if (f === null || d === null) return { concentrate: null };
    if (f <= 0) return { concentrate: null, error: 'Final drink volume must be greater than 0.' };
    if (d < 0) return { concentrate: null, error: 'Dilution cannot be negative.' };
    const concentrate = f / (1 + d);
    const water = f - concentrate;
    const ratio = num(v.ratio);
    const batch = num(v.batch);
    const haveBatch = ratio !== null && batch !== null && ratio > 0 && batch >= 0;
    const grounds = haveBatch ? batch! / ratio! : null;
    const steps = [
      `Concentrate = final ÷ (1 + dilution) = ${r(f, 2)} ÷ ${r(1 + d, 2)} = ${r(concentrate, 2)}`,
      `Water to add = final − concentrate = ${r(f, 2)} − ${r(concentrate, 2)} = ${r(water, 2)}`,
    ];
    if (haveBatch) steps.push(`Grounds = batch water ÷ ratio = ${r(batch!, 2)} ÷ ${r(ratio!, 2)} = ${r(grounds!, 2)} g`);
    return {
      concentrate,
      water,
      grounds,
      tone: 'ok',
      badge: `${r(concentrate, 1)} concentrate + ${r(water, 1)} water`,
      note: 'Your concentrate yield will be lower than the water you steeped with, because the grounds soak up some of it, so you will get back less than the batch water you started with.',
      chart: { type: 'bar', title: 'What goes in the glass', categories: ['Concentrate', 'Water'], series: [{ name: 'Volume', values: [concentrate, water] }], format: { format: 'number', precision: 0 }, highlight: 0 },
      steps,
    };
  },
  content: {
    formula: [
      'Concentrate = final volume ÷ (1 + dilution)',
      'Water to add = final volume − concentrate',
      'Grounds for a batch = batch water ÷ brew ratio number',
    ],
    body: [
      'Cold brew is usually made strong and then cut with water or milk. Enter the volume of drink you want and how many parts water go with each part of concentrate. You get how much concentrate to pour and how much water to add.',
      'This is for diluting finished cold brew concentrate. For the ratio of coffee to water when brewing hot coffee, use the coffee ratio calculator. The brew ratio box here is only for making the concentrate: 5 means 5 parts water by weight to 1 part coffee, a common starting point you can change to taste.',
      'For example, 500 ml at 1:1 is 250 ml concentrate plus 250 ml water. 600 ml at 2 parts water is 200 ml concentrate plus 400 ml water. 500 ml at 1.5 parts water is 200 ml concentrate plus 300 ml water, and a batch made with 1,000 ml of water at a 1:5 ratio needs 200 g of grounds.',
      'Concentrate yield is lower than the water you used, because the grounds absorb water and hold on to it. Plan on getting back noticeably less than you put in, and measure your own batch if you need an exact figure.',
    ],
    faq: [
      { q: 'How much concentrate and water for a 500 ml glass at 1:1?', a: '250 ml of concentrate and 250 ml of water. Concentrate = 500 ÷ (1 + 1) = 250, and water = 500 − 250 = 250.' },
      { q: 'What if I want two parts water to one part concentrate?', a: 'For a 600 ml drink, use 200 ml of concentrate and 400 ml of water (600 ÷ 3 = 200).' },
      { q: 'How many grams of coffee for 1,000 ml of water at 1:5?', a: '200 g of grounds, since 1,000 ÷ 5 = 200. You can change the ratio number to suit your taste.' },
      { q: 'Why do I get less concentrate than the water I used?', a: 'Coffee grounds absorb water as they steep, so some stays in the wet grounds after you strain. The yield is lower than the water you started with.' },
      { q: 'How is this different from the coffee ratio calculator?', a: 'The coffee ratio calculator is for brewing hot coffee at a chosen ratio. This one dilutes finished cold brew concentrate and also estimates grounds for a concentrate batch.' },
    ],
    sources: [],
  },
  related: ['coffee-ratio'],
  examples: [
    // 500 / (1 + 1) = 250; 500 - 250 = 250; grounds default 1000 / 5 = 200
    { values: { final: 500, dilution: 1, batch: 1000, ratio: 5 }, expect: { concentrate: 250, water: 250, grounds: 200 }, tolerance: 1e-9 },
    // 600 / (1 + 2) = 200; 600 - 200 = 400
    { values: { final: 600, dilution: 2 }, expect: { concentrate: 200, water: 400 }, tolerance: 1e-9 },
    // 500 / 2.5 = 200; 500 - 200 = 300; 1000 / 5 = 200 g
    { values: { final: 500, dilution: 1.5, batch: 1000, ratio: 5 }, expect: { concentrate: 200, water: 300, grounds: 200 }, tolerance: 1e-9 },
  ],
});

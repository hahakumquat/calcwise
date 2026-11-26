import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'dry-pasta-portions',
  title: 'Dry Pasta Portion Calculator',
  category: 'food',
  description: 'Work out how much dry pasta to cook for your group, how many packs to buy, and what the pasta you actually use costs per serving.',
  updated: '2026-11-26',
  keywords: ['how much pasta per person', 'dry pasta portion calculator', 'pasta per person grams', 'how much spaghetti for 6', 'pasta packs to buy', 'pasta cost per serving'],
  inputs: [
    { id: 'people', label: 'People eating', type: 'number', default: 6, min: 1, step: 1, info: 'How many portions you want to cook.' },
    { id: 'gPer', label: 'Dry grams per person (typical)', type: 'number', default: 85, min: 1, step: 5, suffix: 'g', help: '85 g (3 oz) is a typical main-course portion. Edit it to suit your group.', info: 'Dry weight, measured before cooking. Many people use 56 to 100 g depending on appetite and whether it is a starter or a main.' },
    { id: 'pack', label: 'Pack size', type: 'number', default: 500, min: 1, step: 1, suffix: 'g', info: 'Weight of one pack or box of dry pasta, in grams. A 1 lb box is 454 g.' },
    { id: 'price', label: 'Price per pack', type: 'number', default: 2, prefix: '$', min: 0, step: 0.01, info: 'What one pack costs.' },
  ],
  outputs: [
    { id: 'totalG', label: 'Dry pasta needed (grams)', format: 'number', precision: 0, primary: true, info: 'People × dry grams per person.' },
    { id: 'packs', label: 'Packs to buy', format: 'number', precision: 0, info: 'Total grams ÷ pack size, rounded up to whole packs.' },
    { id: 'costUsed', label: 'Cost of pasta used', format: 'currency', precision: 2, info: 'Total grams ÷ pack size × price. Only the part of the pack you use.' },
    { id: 'perServing', label: 'Cost per serving', format: 'currency', precision: 2, info: 'Cost of pasta used ÷ people.' },
  ],
  compute: (v) => {
    const people = num(v.people), g = num(v.gPer), pack = num(v.pack), price = num(v.price);
    if (people === null || g === null || pack === null || price === null || people < 1 || g <= 0 || pack <= 0 || price < 0) return { totalG: null };
    const totalG = people * g;
    const packs = Math.ceil(totalG / pack - 1e-9);
    const costUsed = (totalG / pack) * price;
    const perServing = costUsed / people;
    const leftover = packs * pack - totalG;
    return {
      totalG,
      packs,
      costUsed,
      perServing,
      tone: 'good',
      badge: `${packs} ${packs === 1 ? 'pack' : 'packs'} to buy`,
      note: `Leftover: about ${Math.round(leftover)} g of dry pasta.`,
      chart: {
        type: 'bar',
        title: 'Grams: what you cook vs what you buy',
        categories: ['Cook', 'Buy'],
        series: [{ name: 'Grams', values: [totalG, packs * pack] }],
        format: { format: 'number', precision: 0 },
      },
      steps: [
        `Total = ${people} × ${g} g = ${totalG} g`,
        `Packs = ${totalG} ÷ ${pack} = ${(totalG / pack).toFixed(2)}, rounded up to ${packs}`,
        `Cost used = ${totalG} ÷ ${pack} × $${price.toFixed(2)} = $${costUsed.toFixed(2)}`,
        `Per serving = $${costUsed.toFixed(2)} ÷ ${people} = $${perServing.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: ['Total dry pasta (g) = people × grams per person', 'Packs to buy = total ÷ pack size, rounded up', 'Cost used = total ÷ pack size × pack price', 'Cost per serving = cost used ÷ people'],
    body: [
      'A common rule of thumb is about 85 g (3 oz) of dry pasta per person for a main course. For 6 people that is 510 g, a little over one 500 g pack, so you would buy 2 packs. The number is a typical starting point, so change it if your group eats more or less.',
      'Cost is worked out on the pasta you actually cook, not the full packs you buy. At $2.00 for 500 g, 510 g costs $2.04, which is $0.34 per serving. The leftover pasta keeps in the cupboard, so it is not counted.',
      'This calculator uses dry weight only. It does not estimate cooked weight, which is roughly double or more depending on the shape, and it does not cover sauce, cheese or other ingredients. For a full meal cost, use the recipe cost calculator.',
    ],
    faq: [
      { q: 'How much dry pasta per person?', a: 'A typical main-course portion is about 85 g (3 oz) dry. This calculator defaults to 85 g and lets you edit it.' },
      { q: 'How much pasta do I need for 6 people?', a: 'At 85 g each, 510 g. With 500 g packs that means buying 2 packs.' },
      { q: 'How much does a serving cost?', a: 'It counts only the pasta you use. For 4 people at 100 g from a 454 g box costing $1.80, you cook 400 g, which costs about $1.59, or $0.40 per serving.' },
      { q: 'Does this give the cooked weight or include sauce?', a: 'No. It covers dry pasta weight and pasta cost only. Cooked weight and sauce are out of scope.' },
    ],
  },
  related: ['recipe-cost', 'party-food-quantity', 'recipe-scaler'],
  examples: [
    // 6 x 85 = 510 g; ceil(510/500) = 2; 510/500 x 2.00 = 2.04; 2.04/6 = 0.34
    { values: { people: 6, gPer: 85, pack: 500, price: 2 }, expect: { totalG: 510, packs: 2, costUsed: 2.04, perServing: 0.34 }, tolerance: 1e-9 },
    // 4 x 100 = 400 g; ceil(400/454) = 1; 400/454 x 1.80 = 1.5859 (about 1.59); /4 = 0.3965 (about 0.40)
    { values: { people: 4, gPer: 100, pack: 454, price: 1.8 }, expect: { totalG: 400, packs: 1, costUsed: (400 / 454) * 1.8, perServing: ((400 / 454) * 1.8) / 4 }, tolerance: 1e-9 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'ice-melt-coverage',
  title: 'Ice Melt Coverage Calculator',
  category: 'everyday',
  description: 'Work out how much ice melt your walkway needs, how many applications a bag covers and what each one costs. Use the rate printed on your product label.',
  keywords: ['ice melt calculator', 'how much ice melt do i need', 'rock salt coverage calculator', 'ice melt per square foot', 'ice melt bag coverage', 'cost to salt a driveway'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'length', label: 'Length', type: 'number', default: 40, min: 0, step: 1, suffix: 'ft', info: 'Length of the walkway or driveway section you will treat.' },
    { id: 'width', label: 'Width', type: 'number', default: 4, min: 0, step: 0.5, suffix: 'ft', info: 'Width of the area.' },
    { id: 'rate', label: 'Application rate', type: 'number', default: 10, min: 0, step: 1, suffix: 'lb per 1,000 sq ft', info: 'Use the rate printed on your product label. The 10 shown is only an example, not a standard.' },
    { id: 'bag', label: 'Bag size', type: 'number', default: 50, min: 0, step: 1, suffix: 'lb', info: 'Weight of the bag.' },
    { id: 'price', label: 'Bag price', type: 'number', prefix: '$', default: 15, min: 0, step: 0.5, info: 'What you pay for one bag.' },
  ],
  outputs: [
    { id: 'lbEach', label: 'Ice melt per application', format: 'number', precision: 2, suffix: 'lb', primary: true, info: 'Area × rate ÷ 1,000.' },
    { id: 'perBag', label: 'Applications per bag', format: 'number', precision: 2, info: 'Bag size ÷ pounds per application.' },
    { id: 'costEach', label: 'Cost per application', format: 'currency', precision: 2, info: 'Bag price ÷ applications per bag.' },
    { id: 'area', label: 'Area', format: 'number', precision: 0, suffix: 'sq ft', info: 'Length × width.' },
  ],
  compute: (v) => {
    const length = num(v.length), width = num(v.width), rate = num(v.rate), bag = num(v.bag), price = num(v.price);
    if ([length, width, rate, bag, price].some((x) => x === null)) return { lbEach: null };
    if (length! <= 0 || width! <= 0 || rate! <= 0 || bag! <= 0 || price! < 0) return { lbEach: null };
    const area = length! * width!;
    const lbEach = (area * rate!) / 1000;
    const perBag = bag! / lbEach;
    const costEach = price! / perBag;
    if (![area, lbEach, perBag, costEach].every(Number.isFinite)) return { lbEach: null };
    return {
      lbEach,
      perBag,
      costEach,
      area,
      tone: 'ok',
      badge: `${money(costEach)} per application`,
      note: `${fmt(area, 0)} sq ft at ${fmt(rate!)} lb per 1,000 sq ft takes ${fmt(lbEach)} lb each time. A ${fmt(bag!)} lb bag covers ${fmt(perBag)} applications at ${money(costEach)} each. The rate is whatever you entered from your label; surfaces, pets and plants vary, so follow the label.`,
      chart: {
        type: 'bar',
        title: 'Cost for repeated applications',
        categories: ['1', '5', '10', '20'],
        series: [{ name: 'Total cost', values: [1, 5, 10, 20].map((n) => n * costEach) }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Area = ${fmt(length!)} × ${fmt(width!)} = ${fmt(area, 0)} sq ft`,
        `Per application = ${fmt(area, 0)} × ${fmt(rate!)} ÷ 1,000 = ${fmt(lbEach)} lb`,
        `Applications per bag = ${fmt(bag!)} ÷ ${fmt(lbEach)} = ${fmt(perBag)}`,
        `Cost each = ${money(price!)} ÷ ${fmt(perBag)} = ${money(costEach)}`,
      ],
    };
  },
  content: {
    formula: [
      'Area (sq ft) = length × width',
      'Pounds per application = area × rate ÷ 1,000',
      'Applications per bag = bag size ÷ pounds per application',
      'Cost per application = bag price ÷ applications per bag',
    ],
    body: [
      'Ice melt products list how much to spread on the bag, usually as pounds per 1,000 square feet. Enter that number as your application rate, then the size of the area, and the calculator tells you how much to spread, how many times a bag lasts and what each application costs.',
      'The rate is not a standard. It differs by product and by conditions, so always use the figure from your own label. The 10 pounds per 1,000 square feet shown here is only a placeholder example. Surfaces, nearby plants and pets also vary, so follow the label directions for those too.',
      'Example: a 40 × 4 ft walkway is 160 sq ft. At 10 lb per 1,000 sq ft that is 1.6 lb per application. A 50 lb bag then covers 31.25 applications, and a $15 bag works out to $0.48 each.',
      'Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much ice melt do I need for a walkway?', a: 'Area times the label rate, divided by 1,000. A 40 × 4 ft walkway is 160 sq ft, which at 10 lb per 1,000 sq ft needs 1.6 lb. Use your own label rate.' },
      { q: 'How many applications does a bag cover?', a: 'Bag size divided by pounds per application. With the defaults, a 50 lb bag covers 31.25 applications of 1.6 lb.' },
      { q: 'How much does each application cost?', a: 'Bag price divided by applications per bag. A $15 bag at 31.25 applications is $0.48 each with the defaults.' },
      { q: 'Is 10 lb per 1,000 sq ft the right rate?', a: 'Not necessarily. It is only an example. The correct rate is on your product label and can differ by product and conditions.' },
    ],
    sources: [],
  },
  related: ['unit-price', 'wrapping-paper'],
  examples: [
    // area 40*4 = 160; lb 160*10/1000 = 1.6; bag 50/1.6 = 31.25; cost 15/31.25 = 0.48
    { values: { length: 40, width: 4, rate: 10, bag: 50, price: 15 }, expect: { lbEach: 1.6, perBag: 31.25, costEach: 0.48, area: 160 }, tolerance: 0.01 },
    // area 20*10 = 200; lb 200*5/1000 = 1.0; bag 25/1 = 25; cost 12/25 = 0.48
    { values: { length: 20, width: 10, rate: 5, bag: 25, price: 12 }, expect: { lbEach: 1, perBag: 25, costEach: 0.48, area: 200 }, tolerance: 0.01 },
  ],
});

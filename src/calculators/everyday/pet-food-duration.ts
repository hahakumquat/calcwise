import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'pet-food-duration',
  title: 'Pet Food Duration Calculator',
  category: 'everyday',
  description: 'See how many days a bag of pet food lasts, what it costs per day and per month, and when to reorder. Works for dogs and cats.',
  keywords: ['how long will a bag of dog food last', 'pet food calculator', 'dog food cost per day', 'cat food bag duration', 'how many days does a bag of dog food last', 'pet food reorder date'],
  updated: '2026-11-21',
  inputs: [
    { id: 'bagLb', label: 'Bag size', type: 'number', default: 30, min: 0.1, max: 500, step: 0.5, suffix: 'lb', info: 'Weight printed on the bag.' },
    { id: 'price', label: 'Price of the bag', type: 'number', default: 54, min: 0, max: 1000, step: 0.5, prefix: '$', info: 'What you pay for one bag.' },
    { id: 'cups', label: 'Cups fed per day (all pets)', type: 'number', default: 3, min: 0.1, max: 50, step: 0.25, suffix: 'cups', info: 'Total across all your pets, from the feeding guide or your vet.' },
    { id: 'cupOz', label: 'Weight of one cup of food', type: 'number', default: 4, min: 0.5, max: 12, step: 0.1, suffix: 'oz', info: 'Dry kibble is often 3.5 to 4.5 oz per cup. Weigh a cup on a kitchen scale for accuracy.' },
  ],
  outputs: [
    { id: 'days', label: 'The bag lasts', format: 'number', precision: 1, primary: true, suffix: ' days', info: 'Bag weight in ounces divided by ounces fed per day.' },
    { id: 'perDay', label: 'Food cost per day', format: 'currency', precision: 2, info: 'Bag price divided by days the bag lasts.' },
    { id: 'perMonth', label: 'Food cost per 30 days', format: 'currency', precision: 2, info: 'Cost per day times 30.' },
    { id: 'cupsPerBag', label: 'Cups in the bag', format: 'number', precision: 1, info: 'Bag weight in ounces divided by ounces per cup.' },
  ],
  compute: (v) => {
    const lb = num(v.bagLb), price = num(v.price), cups = num(v.cups), oz = num(v.cupOz);
    if (lb === null || price === null || cups === null || oz === null) return { days: null, note: 'Fill in every field.' };
    if (lb <= 0 || cups <= 0 || oz <= 0) return { days: null, error: 'Bag size, cups per day and cup weight must be above 0.' };
    if (price < 0) return { days: null, error: 'Price cannot be negative.' };
    const bagOz = lb * 16;
    const perDayOz = cups * oz;
    const days = bagOz / perDayOz;
    const perDay = price / days;
    return {
      days,
      perDay,
      perMonth: perDay * 30,
      cupsPerBag: bagOz / oz,
      tone: 'ok',
      badge: `Reorder in about ${Math.max(0, Math.floor(days) - 7)} days`,
      chart: {
        type: 'bar',
        title: 'Cost over time ($)',
        categories: ['1 week', '30 days', '1 year'],
        series: [{ name: 'Cost', values: [perDay * 7, perDay * 30, perDay * 365] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Bag = ${n1(lb)} lb × 16 = ${n1(bagOz)} oz`,
        `Fed per day = ${n1(cups)} cups × ${n1(oz)} oz = ${n1(perDayOz)} oz`,
        `Days = ${n1(bagOz)} ÷ ${n1(perDayOz)} = ${n1(days)}`,
        `Cost per day = ${money(price)} ÷ ${n1(days)} = ${money(perDay)}`,
      ],
    };
  },
  content: {
    formula: ['Days = (bag pounds × 16) ÷ (cups per day × ounces per cup)', 'Cost per day = bag price ÷ days the bag lasts'],
    body: [
      'Running out of food on a holiday weekend is easy to avoid if you know how long a bag really lasts. Enter the bag weight, price, how many cups you feed each day and what a cup weighs, and this calculator gives the days, the cost per day and a reorder reminder one week before it runs out.',
      'The weight of a cup varies a lot by food: dry kibble is commonly 3.5 to 4.5 ounces per cup, and some brands are lighter or heavier. Weigh one level cup on a kitchen scale for the most accurate answer.',
      'Use the cups per day from the feeding guide on the bag or the amount your vet recommends. This is arithmetic, not feeding advice.',
    ],
    faq: [
      { q: 'How long does a 30 lb bag of dog food last?', a: 'With 3 cups a day at 4 oz per cup, it lasts 40 days: 480 oz in the bag divided by 12 oz a day.' },
      { q: 'How much does a cup of kibble weigh?', a: 'It depends on the food, usually between 3.5 and 4.5 ounces. The bag or the brand\'s website often lists it, or you can weigh a cup yourself.' },
      { q: 'How do I enter multiple pets?', a: 'Add up the cups per day for every pet and enter the total.' },
      { q: 'Does it work for wet food or treats?', a: 'It works for anything you measure by volume. For cans, enter the bag size as the case weight and the cup weight as one can.' },
    ],
    sources: [
      { label: 'AVMA: Pet nutrition and feeding resources', url: 'https://www.avma.org/resources-tools/pet-owners/petcare/nutrition' },
    ],
  },
  related: ['dog-age-human', 'cost-per-use', 'unit-price'],
  examples: [
    { values: { bagLb: 30, price: 54, cups: 3, cupOz: 4 }, expect: { days: 40, perDay: 1.35, perMonth: 40.5, cupsPerBag: 120 } },
    { values: { bagLb: 15, price: 30, cups: 1.5, cupOz: 4 }, expect: { days: 40, perDay: 0.75, perMonth: 22.5 } },
    { values: { bagLb: 7, price: 21, cups: 1, cupOz: 3.5 }, expect: { days: 32, perDay: 0.65625 } },
  ],
});

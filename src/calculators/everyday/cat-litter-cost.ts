import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const WEEKS_PER_MONTH = 4.345;

export default defineCalculator({
  slug: 'cat-litter-cost',
  title: 'Cat Litter Cost Calculator',
  category: 'everyday',
  description: 'Work out what cat litter costs per month and per year from your litter boxes, full changes, top-ups, bag price and bag size, plus how many bags you will buy.',
  keywords: ['cat litter cost', 'how much does cat litter cost per month', 'cat litter cost per year', 'litter box cost calculator', 'how many bags of litter'],
  updated: '2026-11-26',
  inputs: [
    { id: 'boxes', label: 'Litter boxes', type: 'number', default: 1, min: 1, max: 20, step: 1, info: 'How many boxes you keep filled.' },
    { id: 'changes', label: 'Full changes per month', type: 'number', default: 2, min: 0, step: 1, info: 'How often you dump and refill each box in a month.' },
    { id: 'fill', label: 'Litter per full change', type: 'number', suffix: 'lb', default: 10, min: 0, step: 1, info: 'Pounds of litter in one fresh box.' },
    { id: 'topoff', label: 'Top-off litter per week', type: 'number', suffix: 'lb', default: 1, min: 0, step: 0.5, info: 'Pounds you add each week across all boxes to replace scooped litter.' },
    { id: 'price', label: 'Bag price', type: 'number', prefix: '$', default: 20, min: 0, step: 0.5, info: 'What one bag costs.' },
    { id: 'bag', label: 'Bag size', type: 'number', suffix: 'lb', default: 40, min: 1, step: 1, info: 'Pounds of litter in one bag.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Cost per month', format: 'currency', primary: true, info: 'Litter used per month × price per lb.' },
    { id: 'yearly', label: 'Cost per year', format: 'currency', info: 'Monthly cost × 12.' },
    { id: 'lbMonth', label: 'Litter per month', format: 'number', precision: 1, suffix: 'lb', info: 'Boxes × changes × lb per change + top-off × 4.345 weeks.' },
    { id: 'bagsMonth', label: 'Bags per month', format: 'number', precision: 2, info: 'Litter per month ÷ bag size.' },
  ],
  compute: (v) => {
    const boxes = num(v.boxes), changes = num(v.changes), fill = num(v.fill), top = num(v.topoff), price = num(v.price), bag = num(v.bag);
    if ([boxes, changes, fill, top, price, bag].some((x) => x === null)) return { monthly: null };
    if ((boxes as number) < 1 || (changes as number) < 0 || (fill as number) < 0 || (top as number) < 0 || (price as number) < 0 || (bag as number) < 1) return { monthly: null };
    const fullLb = (boxes as number) * (changes as number) * (fill as number);
    const topLb = (top as number) * WEEKS_PER_MONTH;
    const lbMonth = fullLb + topLb;
    const perLb = (price as number) / (bag as number);
    const monthly = lbMonth * perLb;
    const yearly = monthly * 12;
    const bagsMonth = lbMonth / (bag as number);
    return {
      monthly,
      yearly,
      lbMonth,
      bagsMonth,
      tone: 'ok',
      badge: 'Estimate',
      note: `About ${fmt(lbMonth, 1)} lb a month, or ${fmt(bagsMonth)} bags, costs ${money(monthly)} a month and ${money(yearly)} a year. Litter use depends on your cat and litter type, so adjust the changes and top-offs to match what you really buy.`,
      chart: {
        type: 'donut' as const,
        title: 'Where the litter goes each month',
        slices: [
          { label: 'Full changes', value: fullLb * perLb },
          { label: 'Top-offs', value: topLb * perLb },
        ],
        format: { format: 'currency', precision: 2 },
        centerLabel: 'per month',
        centerValue: money(monthly),
      },
      steps: [
        `Full changes: ${fmt(boxes as number, 0)} × ${fmt(changes as number, 0)} × ${fmt(fill as number)} lb = ${fmt(fullLb)} lb`,
        `Top-offs: ${fmt(top as number)} lb × ${WEEKS_PER_MONTH} weeks = ${fmt(topLb, 3)} lb`,
        `Litter a month: ${fmt(lbMonth, 3)} lb`,
        `Cost: ${fmt(lbMonth, 3)} lb × ${money(price as number)} ÷ ${fmt(bag as number)} lb = ${money(monthly)}`,
        `Year: ${money(monthly)} × 12 = ${money(yearly)}`,
      ],
    };
  },
  content: {
    formula: [
      'Litter per month (lb) = boxes × full changes × lb per change + top-off lb per week × 4.345',
      'Cost per month = litter per month × bag price ÷ bag size',
      'Cost per year = cost per month × 12',
      'Bags per month = litter per month ÷ bag size',
    ],
    body: [
      'Cat litter is a small cost that adds up quietly. Enter how many boxes you keep, how often you do a full change, how much litter goes in a fresh box and how much you top off each week, then add the bag price and size to see the monthly and yearly cost.',
      'Weeks are converted to months using 4.345 weeks a month (52.14 weeks ÷ 12). Scooping daily means you top off more and change less, while a clumping litter that you change fully every month will have a bigger first number and a smaller second one.',
      'Box hygiene and how often you should change litter are out of scope; this only turns your routine into a cost. For food costs, see the pet food duration calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does cat litter cost per month?', a: 'With the defaults of 1 box, 2 full changes of 10 lb, 1 lb of top-off a week and a $20 40 lb bag, you use 24.345 lb a month. That costs $12.17 a month.' },
      { q: 'How much is that per year?', a: 'The default monthly cost of $12.17 over 12 months is about $146.07 a year. With 2 boxes, 4 changes of 8 lb and no top-off on a $16 40 lb bag, you use 64 lb, which is $25.60 a month and $307.20 a year.' },
      { q: 'How many bags of litter will I need?', a: 'Divide litter per month by bag size. The default 24.345 lb on a 40 lb bag is about 0.61 bags a month.' },
      { q: 'Why is my real spend different?', a: 'Litter type, how many cats use each box and how thoroughly you scoop all change the amount. Compare the result to what you actually buy and adjust the top-off.' },
    ],
    sources: [],
  },
  related: ['pet-food-duration', 'pet-lifetime-cost'],
  examples: [
    // lb = 1*2*10 + 1*4.345 = 24.345; monthly = 24.345*20/40 = 12.1725; yearly = 146.07; bags = 24.345/40 = 0.608625
    { values: { boxes: 1, changes: 2, fill: 10, topoff: 1, price: 20, bag: 40 }, expect: { lbMonth: 24.345, monthly: 12.1725, yearly: 146.07, bagsMonth: 0.608625 }, tolerance: 1e-9 },
    // lb = 2*4*8 = 64; monthly = 64*16/40 = 25.60; yearly = 307.20; bags = 1.6
    { values: { boxes: 2, changes: 4, fill: 8, topoff: 0, price: 16, bag: 40 }, expect: { lbMonth: 64, monthly: 25.6, yearly: 307.2, bagsMonth: 1.6 }, tolerance: 1e-9 },
  ],
});

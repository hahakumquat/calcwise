import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const TARGETS = [30, 45, 60, 75, 90];

export default defineCalculator({
  slug: 'race-fueling-plan',
  title: 'Race Fueling Plan Calculator',
  category: 'sports',
  description: 'Plan race-day carbs: enter your finish time, carbs per hour and carbs per gel or chew to get total carbs, gels to carry, how often to take one, and fluid.',
  keywords: ['race fueling calculator', 'how many gels for a marathon', 'carbs per hour calculator', 'running gel calculator', 'marathon nutrition plan', 'endurance fueling plan'],
  updated: '2026-11-27',
  popular: false,
  inputs: [
    { id: 'hours', label: 'Expected finish time — hours', type: 'number', suffix: 'h', default: 3, min: 0, step: 1, info: 'Whole hours of your expected finish time.' },
    { id: 'minutes', label: 'Expected finish time — minutes', type: 'number', suffix: 'min', default: 30, min: 0, step: 1, info: 'Minutes of your expected finish time.' },
    { id: 'target', label: 'Target carbs per hour', type: 'number', suffix: 'g/h', default: 60, min: 1, step: 5, info: 'How many grams of carbohydrate you plan to take in each hour. Targets vary by athlete and race length.' },
    { id: 'perGel', label: 'Carbs per gel or chew pack', type: 'number', suffix: 'g', default: 22, min: 1, step: 1, info: 'Grams of carbohydrate in one gel or serving, from the label.' },
    { id: 'fluid', label: 'Fluid per hour (optional)', type: 'number', suffix: 'mL/h', default: 500, min: 0, step: 50, optional: true, info: 'Leave blank to skip. Millilitres of fluid you plan to drink each hour.' },
  ],
  outputs: [
    { id: 'gelsToCarry', label: 'Gels to carry', format: 'integer', primary: true, info: 'Gels needed, rounded up to whole gels.' },
    { id: 'totalCarbs', label: 'Total carbs', format: 'number', precision: 0, suffix: 'g', info: 'Hours times target carbs per hour.' },
    { id: 'gels', label: 'Gels needed (exact)', format: 'number', precision: 2, info: 'Total carbs divided by carbs per gel.' },
    { id: 'interval', label: 'Take one every', format: 'number', precision: 0, suffix: 'min', info: '60 times carbs per gel divided by target per hour.' },
    { id: 'actualPerHour', label: 'Actual carbs per hour with whole gels', format: 'number', precision: 1, suffix: 'g/h', info: 'Gels carried times carbs per gel, divided by hours.' },
    { id: 'fluidTotal', label: 'Total fluid', format: 'number', precision: 0, suffix: 'mL', info: 'Hours times fluid per hour. Blank if no fluid rate was entered.' },
  ],
  compute: (v) => {
    const h = num(v.hours) ?? 0;
    const m = num(v.minutes) ?? 0;
    const target = num(v.target);
    const perGel = num(v.perGel);
    const fluidRate = num(v.fluid);
    const hours = h + m / 60;
    if (h < 0 || m < 0 || hours <= 0) return { gelsToCarry: null, error: 'Enter your expected finish time.' };
    if (target === null || target <= 0) return { gelsToCarry: null, error: 'Enter your target carbs per hour.' };
    if (perGel === null || perGel <= 0) return { gelsToCarry: null, error: 'Enter the carbs in one gel or chew pack.' };
    if (fluidRate !== null && fluidRate < 0) return { gelsToCarry: null, error: 'Fluid per hour cannot be negative.' };
    const totalCarbs = hours * target;
    const gels = totalCarbs / perGel;
    const gelsToCarry = Math.ceil(gels - 1e-9);
    const interval = (60 * perGel) / target;
    const actualPerHour = (gelsToCarry * perGel) / hours;
    const fluidTotal = fluidRate !== null && fluidRate > 0 ? hours * fluidRate : null;
    const steps = [
      `Time = ${fmt(h, 0)} h + ${fmt(m, 0)} min ÷ 60 = ${fmt(hours, 3)} h`,
      `Total carbs = ${fmt(hours, 3)} × ${fmt(target, 1)} = ${fmt(totalCarbs, 1)} g`,
      `Gels = ${fmt(totalCarbs, 1)} ÷ ${fmt(perGel, 1)} = ${fmt(gels, 3)}, so carry ${gelsToCarry}`,
      `Interval = 60 × ${fmt(perGel, 1)} ÷ ${fmt(target, 1)} = ${fmt(interval, 1)} min`,
      `Carrying ${gelsToCarry} gels gives ${fmt(gelsToCarry * perGel, 1)} g ÷ ${fmt(hours, 3)} h = ${fmt(actualPerHour, 1)} g/h`,
    ];
    if (fluidTotal !== null) steps.push(`Fluid = ${fmt(hours, 3)} × ${fmt(fluidRate as number, 0)} = ${fmt(fluidTotal, 0)} mL`);
    return {
      gelsToCarry,
      totalCarbs,
      gels,
      interval,
      actualPerHour,
      fluidTotal,
      tone: 'ok',
      badge: `${gelsToCarry} gels`,
      note: `Over ${fmt(hours, 2)} h at ${fmt(target, 0)} g/h you need ${fmt(totalCarbs, 0)} g of carbs: carry ${gelsToCarry} gels and take one about every ${fmt(interval, 0)} min. This is a planning aid, not personal advice.`,
      chart: {
        type: 'bar' as const,
        title: `Gels to carry at other carb targets (${fmt(perGel, 0)} g each)`,
        categories: TARGETS.map((t) => `${t} g/h`),
        series: [{ name: 'Gels', values: TARGETS.map((t) => Math.ceil((hours * t) / perGel - 1e-9)) }],
        format: { format: 'integer' as const },
      },
      steps,
    };
  },
  content: {
    formula: [
      'Total carbs = hours × target carbs per hour',
      'Gels = total carbs ÷ carbs per gel; gels to carry = round up',
      'Interval (min) = 60 × carbs per gel ÷ target carbs per hour',
      'Fluid = hours × fluid per hour',
    ],
    body: [
      'A fuelling plan turns a carb target into something you can carry and follow. Multiply your expected finish time by the carbs you want each hour to get the total. Divide by the carbs in one gel or chew pack and round up, because you cannot carry part of a gel. The interval tells you how often to take one so the intake stays steady instead of arriving in a rush.',
      'Example: a 3.5 hour race at 60 g/h needs 3.5 × 60 = 210 g of carbs. With 22 g gels that is 210 ÷ 22 = 9.545 gels, so carry 10. One gel every 60 × 22 ÷ 60 = 22 minutes keeps you on target. Carrying 10 whole gels gives 220 g, which is 62.9 g/h over 3.5 hours. At 500 mL per hour you would drink 1,750 mL in total.',
      'Carb targets vary by athlete and by race length, and what works for one person can upset another stomach. Practise your plan in training, using the same products you will race with, well before race day. For advice that fits your body, health and goals, ask a registered dietitian or sports nutritionist. This calculator is a planning aid, not medical or nutrition advice. It runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How many gels do I need for a 3.5 hour race?', a: 'At 60 g of carbs per hour you need 210 g. With 22 g gels that is 9.545, so carry 10 gels.' },
      { q: 'How often should I take a gel?', a: 'Take one every 60 × carbs per gel ÷ target per hour minutes. For 22 g gels at 60 g/h that is every 22 minutes.' },
      { q: 'Why does the calculator round up?', a: 'You cannot carry part of a gel, so 9.545 becomes 10. Ten 22 g gels give 220 g, or 62.9 g/h over 3.5 hours, slightly above the 60 g/h target.' },
      { q: 'How much fluid should I plan for?', a: 'The calculator multiplies your finish time by the fluid per hour you enter. At 500 mL/h for 3.5 hours that is 1,750 mL. Needs vary with heat, sweat rate and the event, so adjust to your own experience.' },
      { q: 'What carb target should I use?', a: 'Targets vary by athlete and race length. Try different amounts in training and see what you tolerate. A dietitian can give personal advice.' },
    ],
    sources: [
      { label: 'Wikipedia: Sports nutrition', url: 'https://en.wikipedia.org/wiki/Sports_nutrition' },
    ],
  },
  related: ['race-time-predictor', 'pace-splits', 'pace'],
  examples: [
    // 3.5 h * 60 = 210 g; 210/22 = 9.5454...; ceil 10; 60*22/60 = 22 min; 10*22/3.5 = 62.857; 3.5*500 = 1750 mL
    { values: { hours: 3, minutes: 30, target: 60, perGel: 22, fluid: 500 }, expect: { totalCarbs: 210, gels: 9.545454545, gelsToCarry: 10, interval: 22, actualPerHour: 62.857142857, fluidTotal: 1750 }, tolerance: 1e-5 },
    // 2 h * 90 = 180 g; 180/25 = 7.2; ceil 8; 60*25/90 = 16.667 min; 8*25/2 = 100 g/h
    { values: { hours: 2, minutes: 0, target: 90, perGel: 25 }, expect: { totalCarbs: 180, gels: 7.2, gelsToCarry: 8, interval: 16.666666667, actualPerHour: 100 }, tolerance: 1e-5 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const diameterIn = (width: number, aspect: number, rim: number) => (2 * width * aspect) / 100 / 25.4 + rim;

export default defineCalculator({
  slug: 'tire-size-comparison',
  title: 'Tire Size Comparison Calculator',
  category: 'everyday',
  description: 'Compare two tire sizes (like 225/45R17 and 235/40R18): overall diameter, difference, sidewall height and the true speed behind your speedometer.',
  metaDescription: 'Compare two tire sizes by overall diameter and see how a swap changes your speedometer. Enter width, aspect ratio and rim size for each tire.',
  updated: '2026-11-26',
  keywords: ['tire size comparison', 'tire size calculator', 'tire diameter calculator', 'speedometer error new tires', 'compare tire sizes', 'tire size 225/45r17 diameter'],
  inputs: [
    { id: 'w1', label: 'Current width', type: 'number', suffix: 'mm', default: 225, min: 100, step: 5, info: 'First number on the sidewall, e.g. 225 in 225/45R17.' },
    { id: 'a1', label: 'Current aspect ratio', type: 'number', suffix: '%', default: 45, min: 10, step: 5, info: 'Second number: sidewall height as a percent of width, e.g. 45.' },
    { id: 'r1', label: 'Current rim', type: 'number', suffix: 'in', default: 17, min: 10, step: 1, info: 'Number after R: wheel diameter in inches, e.g. 17.' },
    { id: 'w2', label: 'New width', type: 'number', suffix: 'mm', default: 235, min: 100, step: 5, info: 'Width of the tire you are considering.' },
    { id: 'a2', label: 'New aspect ratio', type: 'number', suffix: '%', default: 40, min: 10, step: 5, info: 'Aspect ratio of the new tire.' },
    { id: 'r2', label: 'New rim', type: 'number', suffix: 'in', default: 18, min: 10, step: 1, info: 'Rim diameter of the new tire.' },
    { id: 'speed', label: 'Indicated speed', type: 'number', suffix: 'mph', default: 60, min: 0, step: 5, info: 'What your speedometer shows. The result is the true speed with the new tires, assuming it is accurate with the current ones.' },
  ],
  outputs: [
    { id: 'diff', label: 'Diameter change', format: 'percent', precision: 2, primary: true, info: '(New diameter − current diameter) ÷ current diameter.' },
    { id: 'd1', label: 'Current diameter', format: 'number', precision: 2, suffix: ' in', info: '2 × width × aspect ÷ 100 ÷ 25.4 + rim.' },
    { id: 'd2', label: 'New diameter', format: 'number', precision: 2, suffix: ' in', info: 'Same formula for the new tire.' },
    { id: 'trueSpeed', label: 'True speed', format: 'number', precision: 2, suffix: ' mph', info: 'Indicated speed × new diameter ÷ current diameter.' },
    { id: 'side1', label: 'Current sidewall', format: 'number', precision: 1, suffix: ' mm', info: 'Width × aspect ratio.' },
    { id: 'side2', label: 'New sidewall', format: 'number', precision: 1, suffix: ' mm', info: 'Width × aspect ratio of the new tire.' },
  ],
  compute: (v) => {
    const w1 = num(v.w1), a1 = num(v.a1), r1 = num(v.r1), w2 = num(v.w2), a2 = num(v.a2), r2 = num(v.r2), speed = num(v.speed);
    if ([w1, a1, r1, w2, a2, r2, speed].some((x) => x === null)) return { diff: null };
    if ([w1, a1, r1, w2, a2, r2].some((x) => (x as number) <= 0) || (speed as number) < 0) return { diff: null, error: 'Enter sizes above zero and a speed of zero or more.' };
    const d1 = diameterIn(w1 as number, a1 as number, r1 as number);
    const d2 = diameterIn(w2 as number, a2 as number, r2 as number);
    const ratio = d2 / d1;
    const diff = ratio - 1;
    const trueSpeed = (speed as number) * ratio;
    const side1 = ((w1 as number) * (a1 as number)) / 100;
    const side2 = ((w2 as number) * (a2 as number)) / 100;
    const big = Math.abs(diff) > 0.03;
    return {
      diff, d1, d2, trueSpeed, side1, side2,
      tone: big ? 'warn' : 'ok',
      badge: big ? 'Over 3% difference' : 'Within 3%',
      chart: {
        type: 'bar',
        title: 'Overall diameter (inches)',
        categories: ['Current', 'New'],
        series: [{ name: 'Diameter', values: [d1, d2] }],
        format: { format: 'number', precision: 2 },
      },
      steps: [
        `Current: 2 × ${w1} × ${a1}% ÷ 25.4 + ${r1} = ${d1.toFixed(2)} in`,
        `New: 2 × ${w2} × ${a2}% ÷ 25.4 + ${r2} = ${d2.toFixed(2)} in`,
        `Change: ${d2.toFixed(2)} ÷ ${d1.toFixed(2)} − 1 = ${(diff * 100).toFixed(2)}%`,
        `${speed} mph indicated is really ${trueSpeed.toFixed(2)} mph`,
      ],
      note: 'Only compares overall diameter. It does not check load index, speed rating, rim width, wheel-well clearance or manufacturer approval.',
    };
  },
  content: {
    formula: [
      'Overall diameter (in) = 2 × width (mm) × aspect ratio ÷ 100 ÷ 25.4 + rim (in)',
      'Change = new diameter ÷ current diameter − 1',
      'True speed = indicated speed × new diameter ÷ current diameter',
    ],
    body: [
      'A tire code such as 225/45R17 holds three numbers: width in millimetres, sidewall height as a percent of that width, and rim diameter in inches. The sidewall appears on both sides of the wheel, so the overall diameter is two sidewalls plus the rim.',
      'Your speedometer counts wheel turns and assumes the original tire size. A taller tire covers more road per turn, so the car goes faster than the dial says; a shorter one goes slower. Winter tire and wheel swaps are a common reason to check.',
      'A difference of around 3% or less is the usual rule of thumb for staying close to the original. This calculator only does the geometry. Check load index, speed rating, rim width and clearance with a tire shop or your owner manual.',
    ],
    faq: [
      { q: 'How big is a 225/45R17 tire?', a: 'The sidewall is 225 × 0.45 = 101.25 mm, so the overall diameter is 2 × 101.25 ÷ 25.4 + 17 = 24.97 inches.' },
      { q: 'What happens to my speedometer with 235/40R18 instead of 225/45R17?', a: 'The new tire is 25.40 in, 1.72% taller, so 60 mph on the dial is really 61.03 mph.' },
      { q: 'What about 205/55R16?', a: 'It is 24.88 in, 0.38% smaller than 225/45R17, so 60 mph indicated is 59.77 mph.' },
      { q: 'Is a bigger diameter always bad?', a: 'Not always, but large changes affect speedometer and odometer accuracy and can rub the wheel well. Many people aim for within about 3%.' },
    ],
    sources: [
      { label: 'NHTSA: Tires', url: 'https://www.nhtsa.gov/equipment/tires' },
    ],
  },
  related: ['winter-tire-cost', 'tire-pressure-cold', 'cost-per-mile'],
  examples: [
    // 225/45R17 = 24.9724; 235/40R18 = 25.4016; ratio 1.017215; true 61.0329
    { values: { w1: 225, a1: 45, r1: 17, w2: 235, a2: 40, r2: 18, speed: 60 }, expect: { d1: 24.97, d2: 25.40, trueSpeed: 61.03, side1: 101.25, side2: 94 }, tolerance: 0.001 },
    // 205/55R16 = 24.8780; ratio 0.996234; true 59.774
    { values: { w1: 225, a1: 45, r1: 17, w2: 205, a2: 55, r2: 16, speed: 60 }, expect: { d2: 24.88, trueSpeed: 59.77 }, tolerance: 0.001 },
  ],
});

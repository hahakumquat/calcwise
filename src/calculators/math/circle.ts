import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const LEN = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];
const AREA = ['cm2', 'm2', 'km2', 'in2', 'ft2', 'yd2', 'ac', 'ha', 'mi2'];
const len = { unit: 'length' as const, units: LEN, defaultUnit: 'cm' };

export default defineCalculator({
  slug: 'circle',
  title: 'Circle Calculator',
  category: 'math',
  description: 'Know the radius, diameter, circumference or area of a circle? Get all four.',
  keywords: ['area of a circle', 'circumference', 'radius', 'diameter', 'pi r squared', 'circle formula'],
  inputs: [
    {
      id: 'known', info: 'Choose which measurement of the circle you already have; the calculator works out the rest from it.',
      label: 'I know the',
      type: 'select',
      default: 'r',
      segmented: true,
      options: [
        { value: 'r', label: 'Radius' },
        { value: 'd', label: 'Diameter' },
        { value: 'c', label: 'Circumference' },
        { value: 'a', label: 'Area' },
      ],
    },
    { id: 'radiusIn', info: 'Distance from the centre of the circle to any point on its edge.', label: 'Radius (r)', type: 'number', ...len, default: 5, min: 0, showWhen: { input: 'known', is: 'r' } },
    { id: 'diameterIn', info: 'Distance straight across the circle through its centre — twice the radius.', label: 'Diameter (d)', type: 'number', ...len, default: 10, min: 0, showWhen: { input: 'known', is: 'd' } },
    { id: 'circumferenceIn', info: 'The distance around the outside of the circle (its perimeter).', label: 'Circumference (C)', type: 'number', ...len, default: 31.4159, min: 0, showWhen: { input: 'known', is: 'c' } },
    { id: 'areaIn', info: 'The flat space inside the circle, in square units.', label: 'Area (A)', type: 'number', unit: 'area', units: AREA, defaultUnit: 'cm2', default: 78.54, min: 0, showWhen: { input: 'known', is: 'a' } },
  ],
  outputs: [
    { id: 'area', info: 'The space inside the circle, A = πr². Switch units to see it in cm², m², ft² and more.', label: 'Area (A)', unit: 'area', units: AREA, defaultUnit: 'cm2', primary: true, precision: 6, showWhen: { input: 'known', is: ['r', 'd', 'c'] } },
    { id: 'radius', info: 'The radius found from the area: r = √(A ÷ π).', label: 'Radius (r)', ...len, primary: true, precision: 6, showWhen: { input: 'known', is: 'a' } },
    { id: 'radiusOut', info: 'Distance from the centre to the edge, found from the value you entered.', label: 'Radius (r)', ...len, precision: 6, showWhen: { input: 'known', is: ['d', 'c'] } },
    { id: 'diameter', info: 'Twice the radius — the widest distance across the circle.', label: 'Diameter (d)', ...len, precision: 6, showWhen: { input: 'known', is: ['r', 'c', 'a'] } },
    { id: 'circumference', info: 'The distance around the circle, C = 2πr.', label: 'Circumference (C)', ...len, precision: 6, showWhen: { input: 'known', is: ['r', 'd', 'a'] } },
  ],
  compute: (v) => {
    const k = (v.known as string) || 'r';
    const x = num(k === 'd' ? v.diameterIn : k === 'c' ? v.circumferenceIn : k === 'a' ? v.areaIn : v.radiusIn);
    if (x === null) return { area: null, radius: null };
    if (x <= 0) return { area: null, radius: null, error: 'Enter a positive value.' };
    const steps: string[] = ['Working in metres (m) and square metres (m²); switch the result units as you like.'];
    let r: number;
    if (k === 'd') {
      r = x / 2;
      steps.push(`r = d ÷ 2 = ${fmt(x)} ÷ 2 = ${fmt(r)} m`);
    } else if (k === 'c') {
      r = x / (2 * Math.PI);
      steps.push(`r = C ÷ 2π = ${fmt(x)} ÷ ${fmt(2 * Math.PI)} = ${fmt(r)} m`);
    } else if (k === 'a') {
      r = Math.sqrt(x / Math.PI);
      steps.push(`r = √(A ÷ π) = √(${fmt(x)} ÷ π) = ${fmt(r)} m`);
    } else {
      r = x;
      steps.push(`r = ${fmt(r)} m`);
    }
    const area = Math.PI * r * r;
    const C = 2 * Math.PI * r;
    if (k !== 'd') steps.push(`d = 2r = ${fmt(2 * r)} m`);
    if (k !== 'c') steps.push(`C = 2πr = 2 × π × ${fmt(r)} = ${fmt(C)} m`);
    if (k !== 'a') steps.push(`A = πr² = π × ${fmt(r)}² = ${fmt(area)} m²`);
    return {
      area,
      radius: r,
      radiusOut: r,
      diameter: 2 * r,
      circumference: C,
      chart: {
        type: 'bar',
        title: 'Lengths of the circle',
        categories: ['Radius', 'Diameter', 'Circumference'],
        series: [{ name: 'Length', values: [r, 2 * r, C] }],
        format: { unit: 'length' },
      },
      steps,
    };
  },
  content: {
    formula: ['d = 2r', 'C = 2πr = πd', 'A = πr²', 'r = C ÷ 2π = √(A ÷ π)'],
    body: [
      'Every measurement of a circle follows from its radius, the distance from the centre to the edge. The diameter is twice the radius, the circumference (the distance around) is 2π times the radius, and the area is π times the radius squared.',
      'π (pi) is the ratio of any circle’s circumference to its diameter, about 3.14159. It is irrational, so its digits never end; this calculator uses the full double-precision value. If your class says to use 3.14, your answer may differ slightly in the later decimal places.',
      'Working backwards is just as easy: divide the circumference by 2π to get the radius, or divide the area by π and take the square root. Use any consistent unit — if the radius is in centimetres, the area comes out in square centimetres.',
    ],
    faq: [
      { q: 'Why is area in square units but circumference isn’t?', a: 'Circumference is a length (a distance around), so it has the same unit as the radius. Area multiplies two lengths (r × r), so its unit is squared — cm², m², ft².' },
      { q: 'If I double the radius, what happens to the area?', a: 'It quadruples, because area depends on r². The circumference only doubles.' },
    ],
  },
  related: ['area', 'volume', 'pythagorean-theorem'],
  examples: [
    { values: { known: 'r', radiusIn: 5 }, expect: { area: 78.53981634, circumference: 31.41592654, diameter: 10 }, tolerance: 1e-9 },
    { values: { known: 'a', areaIn: Math.PI * 4 }, expect: { radius: 2 }, tolerance: 1e-12 },
    { values: { known: 'c', circumferenceIn: 10 }, expect: { radius: 1.591549431 }, tolerance: 1e-9 },
  ],
});

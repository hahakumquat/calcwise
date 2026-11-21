import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
const n2 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const ATM = 14.7; // psi, standard atmosphere used to convert gauge to absolute

export default defineCalculator({
  slug: 'tire-pressure-cold',
  title: 'Cold Weather Tire Pressure Calculator',
  category: 'everyday',
  description: 'See how much your tire pressure drops when the temperature falls. Enter your pressure and the temperatures to get the new reading in psi.',
  keywords: ['tire pressure temperature calculator', 'tire pressure cold weather', 'tire pressure drop per degree', 'why is my tire pressure light on in winter', 'tpms cold weather', 'psi per 10 degrees'],
  updated: '2026-11-21',
  inputs: [
    { id: 'psi', label: 'Tire pressure when you set it', type: 'number', default: 32, min: 1, max: 100, step: 0.5, suffix: 'psi', info: 'The gauge pressure you measured or filled to.' },
    {
      id: 'unit', label: 'Temperature unit', type: 'select', default: 'f',
      options: [{ value: 'f', label: 'Fahrenheit (°F)' }, { value: 'c', label: 'Celsius (°C)' }],
      info: 'The unit for both temperatures below.',
    },
    { id: 't1', label: 'Temperature at that time', type: 'number', default: 70, min: -60, max: 150, step: 1, info: 'The outside temperature when the pressure was set.' },
    { id: 't2', label: 'New temperature', type: 'number', default: 20, min: -60, max: 150, step: 1, info: 'The temperature you want the reading for.' },
  ],
  outputs: [
    { id: 'newPsi', label: 'Expected pressure at the new temperature', format: 'number', precision: 1, primary: true, info: 'Gauge psi from the ideal gas law at constant volume.' },
    { id: 'change', label: 'Change in pressure', format: 'number', precision: 1, info: 'New pressure minus starting pressure. Negative means it drops.' },
    { id: 'rule', label: 'Rule of thumb (1 psi per 10 °F)', format: 'number', precision: 1, info: 'A quick estimate to compare with the calculated value.' },
  ],
  compute: (v) => {
    const psi = num(v.psi), a = num(v.t1), b = num(v.t2);
    const unit = v.unit === 'c' ? 'c' : 'f';
    if (psi === null || a === null || b === null) return { newPsi: null, note: 'Enter the pressure and both temperatures.' };
    if (psi <= 0) return { newPsi: null, error: 'Use a pressure above 0 psi.' };
    const aF = unit === 'c' ? a * 1.8 + 32 : a;
    const bF = unit === 'c' ? b * 1.8 + 32 : b;
    if (aF <= -459.67 || bF <= -459.67) return { newPsi: null, error: 'Use temperatures above absolute zero.' };
    const absOld = psi + ATM;
    const absNew = (absOld * (bF + 459.67)) / (aF + 459.67);
    const newPsi = absNew - ATM;
    const change = newPsi - psi;
    const rule = psi - (aF - bF) / 10;
    const low = newPsi < psi - 0.05;
    return {
      newPsi,
      change,
      rule,
      tone: low ? 'warn' : 'ok',
      badge: low ? `Down ${n1(psi - newPsi)} psi` : change > 0.05 ? `Up ${n1(change)} psi` : 'About the same',
      chart: {
        type: 'bar',
        title: 'Tire pressure (psi)',
        categories: ['When set', 'At new temperature'],
        series: [{ name: 'psi', values: [psi, newPsi] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Absolute pressure = ${n2(psi)} + ${ATM} = ${n2(absOld)} psi`,
        `Temperatures in Rankine: ${n2(aF + 459.67)} and ${n2(bF + 459.67)} (°F + 459.67)`,
        `New absolute = ${n2(absOld)} × ${n2(bF + 459.67)} ÷ ${n2(aF + 459.67)} = ${n2(absNew)} psi`,
        `New gauge pressure = ${n2(absNew)} − ${ATM} = ${n2(newPsi)} psi`,
      ],
    };
  },
  content: {
    formula: ['Absolute pressure = gauge psi + 14.7', 'New absolute = old absolute × new temperature ÷ old temperature (both in °F + 459.67)', 'New gauge pressure = new absolute − 14.7'],
    body: [
      'Air in a tire behaves close to an ideal gas: when it cools, the pressure falls. That is why the tire pressure warning light often comes on during the first cold snap of the year, even when nothing is leaking.',
      'This calculator uses the ideal gas law at constant volume. It converts your gauge reading to absolute pressure, scales it by the ratio of the two temperatures, then converts back. The usual rule of thumb is about 1 psi for every 10 °F, and the result is shown next to it.',
      'The right pressure for your car is the cold inflation pressure on the door-jamb placard or in the owner\'s manual. Check with a real gauge when the tires are cold, and top up if they read low. This is an estimate, not a replacement for a gauge.',
    ],
    faq: [
      { q: 'How much does tire pressure drop when it gets cold?', a: 'About 1 psi for every 10 °F. For example, 32 psi set at 70 °F reads about 27.6 psi at 20 °F, a drop of 4.4 psi.' },
      { q: 'Why is the rule of thumb slightly different from the calculator?', a: 'The rule rounds the effect to 1 psi per 10 °F. The calculator uses the gas law, which depends on your starting pressure, so the two differ by a fraction of a psi.' },
      { q: 'What pressure should I inflate my tires to?', a: 'The cold inflation pressure on the placard in your driver door jamb or in the owner\'s manual, not the maximum printed on the tire sidewall.' },
      { q: 'Does driving change the reading?', a: 'Yes. Driving warms the tires and raises the pressure, so measure when they are cold, before driving or after they have sat for a few hours.' },
    ],
    sources: [
      { label: 'Tire Rack: Tire pressure and temperature', url: 'https://www.tirerack.com/winter/tech/techpage.jsp?techid=73' },
      { label: 'NHTSA: Tire safety, tire pressure', url: 'https://www.nhtsa.gov/vehicle-safety/tires' },
    ],
  },
  related: ['pressure-converter', 'gas-cost', 'commute-cost', 'wind-chill'],
  examples: [
    { values: { psi: 32, unit: 'f', t1: 70, t2: 20 }, expect: { newPsi: 27.591594766552763, change: -4.408405233447237, rule: 27 } },
    { values: { psi: 35, unit: 'f', t1: 68, t2: 32 }, expect: { newPsi: 31.60924441412246, change: -3.390755585877539, rule: 31.4 } },
    { values: { psi: 35, unit: 'c', t1: 20, t2: 0 }, expect: { newPsi: 31.60924441412246 } },
    { values: { psi: 32, unit: 'f', t1: 70, t2: 70 }, expect: { newPsi: 32, change: 0, rule: 32 } },
  ],
});

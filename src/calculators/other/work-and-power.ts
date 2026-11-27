import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const HP = 745.69987158227;

export default defineCalculator({
  slug: 'work-and-power',
  title: 'Work and Power Calculator (W = F × d)',
  category: 'other',
  description: 'Enter a force, the distance it acts over and the time taken to get the work done in joules and the power in watts and horsepower, with the working.',
  keywords: ['work and power calculator', 'work calculator physics', 'power calculator watts', 'work equals force times distance', 'joules to watts'],
  updated: '2026-11-27',
  inputs: [
    { id: 'f', label: 'Force (N)', type: 'number', default: 250, min: 0, step: 1, info: 'Force applied in the direction of movement, in newtons.' },
    { id: 'd', label: 'Distance (m)', type: 'number', default: 4, min: 0, step: 0.5, info: 'Distance the object moves along the force, in metres.' },
    { id: 't', label: 'Time (s)', type: 'number', default: 5, min: 0, step: 0.5, info: 'How long the work takes, in seconds.' },
  ],
  outputs: [
    { id: 'work', label: 'Work (J)', format: 'number', precision: 4, primary: true, info: 'Work = force × distance, in joules.' },
    { id: 'power', label: 'Power (W)', format: 'number', precision: 4, info: 'Power = work ÷ time, in watts.' },
    { id: 'hp', label: 'Power (hp)', format: 'number', precision: 4, info: 'The same power in mechanical horsepower, where 1 hp is 745.7 W.' },
  ],
  compute: (x) => {
    const f = num(x.f), d = num(x.d), t = num(x.t);
    if (f === null || d === null || t === null) return { work: null };
    if (f < 0 || d < 0) return { work: null, error: 'Force and distance cannot be negative.' };
    if (t <= 0) return { work: null, error: 'Enter a time above 0.' };
    const work = f * d;
    const power = work / t;
    const times = [0.5, 1, 2, 4].map((k) => t * k);
    return {
      work,
      power,
      hp: power / HP,
      tone: 'ok',
      badge: `${fmt(f)} N over ${fmt(d)} m`,
      chart: {
        type: 'bar',
        title: 'Power if the same work took a different time (W)',
        categories: times.map((v) => `${fmt(v)} s`),
        series: [{ name: 'Power', values: times.map((v) => work / v) }],
      },
      steps: [
        `Work = ${fmt(f)} × ${fmt(d)} = ${fmt(work)} J`,
        `Power = ${fmt(work)} ÷ ${fmt(t)} = ${fmt(power)} W`,
        `Horsepower = ${fmt(power)} ÷ ${HP} = ${fmt(power / HP)} hp`,
      ],
      note: 'Assumes the force points along the direction of movement. At an angle, only the part of the force along the movement counts.',
    };
  },
  content: {
    formula: ['W = F × d', 'P = W ÷ t', '1 hp = 745.7 W'],
    body: [
      'In physics, work is energy transferred by a force moving something. When the force points along the movement, work in joules equals force in newtons times distance in metres. Power is how fast that work is done: work divided by time, in watts (joules per second).',
      'Pushing with 250 N over 4 m does 250 × 4 = 1,000 J of work. If that takes 5 s, the power is 1,000 ÷ 5 = 200 W, about 0.268 horsepower. Doing the same work in half the time needs twice the power.',
      'Holding a weight still does no work in this sense, because nothing moves. Friction and heat are not counted here, only the force and distance you enter.',
    ],
    faq: [
      { q: 'What is the formula for work?', a: 'Work = force × distance, when the force acts along the direction of movement. The unit is the joule (newton-metre).' },
      { q: 'How do I find power from work?', a: 'Divide the work by the time taken. 1,000 J in 5 s is 200 W.' },
      { q: 'How many watts is one horsepower?', a: 'One mechanical horsepower is about 745.7 W, so 200 W is 0.268 hp.' },
      { q: 'What if the force is at an angle?', a: 'Only the component of force along the movement does work, F × cos θ × d. This calculator assumes the force is along the movement.' },
      { q: 'Is a joule the same as a watt?', a: 'No. A joule is an amount of energy; a watt is one joule per second.' },
    ],
    sources: [],
  },
  related: ['kinetic-energy', 'torque-horsepower', 'power-converter'],
  examples: [
    // 250*4=1000 J; /5=200 W; 200/745.69987=0.268204 hp
    { values: { f: 250, d: 4, t: 5 }, expect: { work: 1000, power: 200, hp: 0.268204 }, tolerance: 0.0001 },
    // 50*10=500 J; /20=25 W; 25/745.69987=0.033526 hp
    { values: { f: 50, d: 10, t: 20 }, expect: { work: 500, power: 25, hp: 0.033526 }, tolerance: 0.0001 },
  ],
});

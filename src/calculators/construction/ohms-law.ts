import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Ohm's law V = I x R and the power law P = V x I. Any two of the four known values give the other two.
export default defineCalculator({
  slug: 'ohms-law',
  title: "Ohm's Law Calculator",
  category: 'construction',
  description: "Enter any two of voltage, current, resistance and power and get the other two. Uses V = I × R and P = V × I, with the working shown.",
  keywords: ["ohm's law calculator", 'voltage current resistance calculator', 'watts volts amps ohms', 'power calculator electrical', 'V = IR', 'P = VI'],
  inputs: [
    { id: 'v', label: 'Voltage', type: 'number', optional: true, default: 12, suffix: 'V', min: 0, info: 'Electrical pressure in volts. Leave blank if you want it calculated.' },
    { id: 'i', label: 'Current', type: 'number', optional: true, default: 2, suffix: 'A', min: 0, info: 'Flow of charge in amps. Leave blank if you want it calculated.' },
    { id: 'r', label: 'Resistance', type: 'number', optional: true, suffix: 'Ω', min: 0, info: 'Opposition to current in ohms. Leave blank if you want it calculated.' },
    { id: 'p', label: 'Power', type: 'number', optional: true, suffix: 'W', min: 0, info: 'Power in watts. Leave blank if you want it calculated.' },
  ],
  outputs: [
    { id: 'rv', label: 'Voltage', format: 'number', precision: 4, suffix: ' V', primary: true, info: 'Voltage is current times resistance, V = I × R. It is the electrical pressure across the load.' },
    { id: 'ri', label: 'Current', format: 'number', precision: 4, suffix: ' A', info: 'Current is voltage divided by resistance, I = V ÷ R. It is how many amps flow.' },
    { id: 'rr', label: 'Resistance', format: 'number', precision: 4, suffix: ' Ω', info: 'Resistance is voltage divided by current, R = V ÷ I. It is measured in ohms.' },
    { id: 'rp', label: 'Power', format: 'number', precision: 4, suffix: ' W', info: 'Power is voltage times current, P = V × I. It is how many watts the load uses.' },
  ],
  compute: (v) => {
    const given: Record<string, number> = {};
    for (const k of ['v', 'i', 'r', 'p']) {
      const x = num(v[k]);
      if (x !== null) given[k] = x;
    }
    const keys = Object.keys(given);
    if (keys.length < 2) return { rv: null };
    if (keys.length > 2) return { rv: null, error: 'Fill in exactly two values and clear the others. Two are enough to find the rest.' };
    if (keys.some((k) => given[k] < 0)) return { rv: null, error: 'Values cannot be negative.' };
    const [a, b] = keys;
    const has = (x: string, y: string) => (a === x && b === y) || (a === y && b === x);
    let V: number, I: number, R: number, P: number;
    let step: string;
    if (has('v', 'i')) { V = given.v; I = given.i; R = V / I; P = V * I; step = `R = V ÷ I = ${V} ÷ ${I}; P = V × I`; }
    else if (has('v', 'r')) { V = given.v; R = given.r; I = V / R; P = V * I; step = `I = V ÷ R = ${V} ÷ ${R}; P = V × I`; }
    else if (has('i', 'r')) { I = given.i; R = given.r; V = I * R; P = V * I; step = `V = I × R = ${I} × ${R}; P = V × I`; }
    else if (has('p', 'v')) { P = given.p; V = given.v; I = P / V; R = V / I; step = `I = P ÷ V = ${P} ÷ ${V}; R = V ÷ I`; }
    else if (has('p', 'i')) { P = given.p; I = given.i; V = P / I; R = V / I; step = `V = P ÷ I = ${P} ÷ ${I}; R = V ÷ I`; }
    else { P = given.p; R = given.r; I = Math.sqrt(P / R); V = I * R; step = `I = √(P ÷ R) = √(${P} ÷ ${R}); V = I × R`; }
    if (![V, I, R, P].every(Number.isFinite)) return { rv: null, error: 'That combination divides by zero. Use a value above 0 for the one you divide by.' };
    return {
      rv: V,
      ri: I,
      rr: R,
      rp: P,
      chart: {
        type: 'bar',
        title: 'Voltage, current and power',
        categories: ['Volts', 'Amps', 'Watts'],
        series: [{ name: 'Value', values: [V, I, P] }],
        format: { format: 'number', precision: 2 },
        highlight: 0,
      },
      steps: [step],
    };
  },
  content: {
    formula: ['V = I × R', 'P = V × I', 'P = I² × R = V² ÷ R'],
    body: [
      "Ohm's law links three things in a simple circuit: voltage (V, in volts), current (I, in amps) and resistance (R, in ohms). Voltage equals current times resistance. Power (P, in watts) is voltage times current. Know any two of the four and you can work out the rest.",
      'Example: a 12 V supply pushing 2 A through a load. Resistance is 12 ÷ 2 = 6 Ω and power is 12 × 2 = 24 W. If you only know 24 W at 12 V, current is 24 ÷ 12 = 2 A and the resistance comes out the same.',
      'This is for direct current and resistive loads. For household AC with motors or transformers, power factor matters and real power can be lower than V × I. Check ratings and local electrical rules before wiring anything; this is not a substitute for an electrician.',
    ],
    faq: [
      { q: "What is Ohm's law?", a: 'V = I × R: voltage equals current times resistance. Given 12 V and 2 A, the resistance is 6 Ω.' },
      { q: 'How do I find watts from volts and amps?', a: 'Multiply them: P = V × I. At 12 V and 2 A that is 24 W.' },
      { q: 'How many values do I need to enter?', a: 'Exactly two. Clear the other fields and the calculator fills in voltage, current, resistance and power.' },
    ],
  },
  related: ['electricity-cost', 'concrete'],
  examples: [
    { values: { v: 12, i: 2, r: null, p: null }, expect: { rv: 12, ri: 2, rr: 6, rp: 24 }, tolerance: 1e-9 },
    { values: { v: null, i: null, r: 6, p: 24 }, expect: { rv: 12, ri: 2, rr: 6, rp: 24 }, tolerance: 1e-9 },
    { values: { v: 120, i: null, r: 240, p: null }, expect: { ri: 0.5, rp: 60 }, tolerance: 1e-9 },
  ],
});

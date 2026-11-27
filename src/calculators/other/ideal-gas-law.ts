import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const R = 8.314462618; // J per (mol K), CODATA 2018 exact value
const trim = (n: number) => String(+n.toPrecision(6));

export default defineCalculator({
  slug: 'ideal-gas-law',
  title: 'Ideal Gas Law Calculator (PV = nRT)',
  category: 'other',
  description: 'Solve the ideal gas law PV = nRT for pressure, volume, moles or temperature. Pick the unknown, enter the other three in any unit, and see the steps.',
  keywords: ['ideal gas law calculator', 'pv nrt calculator', 'gas law calculator', 'ideal gas equation', 'moles of gas calculator', 'gas volume calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'solve', label: 'Solve for', type: 'select', segmented: true, default: 'v', options: [{ value: 'p', label: 'Pressure' }, { value: 'v', label: 'Volume' }, { value: 'n', label: 'Moles' }, { value: 't', label: 'Temperature' }], info: 'The quantity to find. The other three are entered below.' },
    { id: 'p', label: 'Pressure (P)', type: 'number', unit: 'pressure', defaultUnit: 'atm', default: 1, min: 0, step: 0.1, showWhen: { input: 'solve', is: ['v', 'n', 't'] }, info: 'Absolute pressure of the gas, not gauge pressure. Standard atmosphere is 1 atm (101,325 Pa).' },
    { id: 'v', label: 'Volume (V)', type: 'number', unit: 'volume', defaultUnit: 'l', default: 22.414, min: 0, step: 0.1, showWhen: { input: 'solve', is: ['p', 'n', 't'] }, info: 'The space the gas occupies.' },
    { id: 'n', label: 'Amount of gas (n)', type: 'number', suffix: 'mol', default: 1, min: 0, step: 0.1, showWhen: { input: 'solve', is: ['p', 'v', 't'] }, info: 'Moles of gas. Moles = mass in grams ÷ molar mass.' },
    { id: 't', label: 'Temperature (T)', type: 'number', unit: 'temperature', defaultUnit: 'c', default: 0, step: 1, showWhen: { input: 'solve', is: ['p', 'v', 'n'] }, info: 'Temperature of the gas. It is converted to kelvin before solving. It must be above absolute zero (−273.15 °C).' },
  ],
  outputs: [
    { id: 'pOut', label: 'Pressure', unit: 'pressure', defaultUnit: 'atm', primary: true, precision: 5, showWhen: { input: 'solve', is: 'p' }, info: 'P = nRT ÷ V.' },
    { id: 'vOut', label: 'Volume', unit: 'volume', defaultUnit: 'l', primary: true, precision: 5, showWhen: { input: 'solve', is: 'v' }, info: 'V = nRT ÷ P.' },
    { id: 'nOut', label: 'Amount of gas', format: 'number', suffix: 'mol', primary: true, precision: 5, showWhen: { input: 'solve', is: 'n' }, info: 'n = PV ÷ RT.' },
    { id: 'tOut', label: 'Temperature', unit: 'temperature', defaultUnit: 'k', primary: true, precision: 4, showWhen: { input: 'solve', is: 't' }, info: 'T = PV ÷ nR.' },
  ],
  compute: (v) => {
    const mode = String(v.solve);
    const p = num(v.p), vol = num(v.v), n = num(v.n), tc = num(v.t);
    const tk = tc === null ? null : tc + 273.15;
    const need = { p: [vol, n, tk], v: [p, n, tk], n: [p, vol, tk], t: [p, vol, n] }[mode];
    if (!need || need.some((x) => x === null)) return { pOut: null };
    const bad = (x: number | null) => x === null || x <= 0;
    if (mode !== 't' && tk !== null && tk <= 0) return { pOut: null, error: 'Temperature must be above absolute zero (−273.15 °C).' };
    if (mode === 'p' ? bad(vol) || bad(n) : mode === 'v' ? bad(p) || bad(n) : mode === 'n' ? bad(p) || bad(vol) : bad(p) || bad(vol) || bad(n)) {
      return { pOut: null, error: 'Pressure, volume and moles must be above 0.' };
    }
    let out: Record<string, number | string>;
    let steps: string[];
    let pa = p ?? 0, m3 = vol ?? 0, mol = n ?? 0, kel = tk ?? 0;
    if (mode === 'p') { pa = (mol * R * kel) / m3; out = { pOut: pa }; steps = [`P = nRT ÷ V = ${trim(mol)} × ${R} × ${trim(kel)} ÷ ${trim(m3)} = ${trim(pa)} Pa`]; }
    else if (mode === 'v') { m3 = (mol * R * kel) / pa; out = { vOut: m3 }; steps = [`V = nRT ÷ P = ${trim(mol)} × ${R} × ${trim(kel)} ÷ ${trim(pa)} = ${trim(m3)} m³`]; }
    else if (mode === 'n') { mol = (pa * m3) / (R * kel); out = { nOut: mol }; steps = [`n = PV ÷ RT = ${trim(pa)} × ${trim(m3)} ÷ (${R} × ${trim(kel)}) = ${trim(mol)} mol`]; }
    else { kel = (pa * m3) / (mol * R); out = { tOut: kel - 273.15 }; steps = [`T = PV ÷ nR = ${trim(pa)} × ${trim(m3)} ÷ (${trim(mol)} × ${R}) = ${trim(kel)} K`]; }
    steps.unshift('Inputs are converted to pascals, cubic meters, moles and kelvin first.');
    // Chart: pressure against volume at the same n and T (Boyle curve)
    const nn = mol, tt = kel;
    const vs = Array.from({ length: 12 }, (_, i) => m3 * (0.5 + (i * 1.5) / 11));
    return {
      ...out,
      chart: {
        type: 'line',
        title: 'Pressure against volume at this temperature (kPa)',
        x: vs.map((x) => Math.round(x * 1000 * 1000) / 1000),
        xLabel: 'Volume (L)',
        series: [{ name: 'Pressure (kPa)', values: vs.map((x) => (nn * R * tt) / x / 1000) }],
      },
      steps,
      note: 'Assumes an ideal gas. Real gases deviate at high pressure or low temperature, where molecules attract each other and take up space.',
    };
  },
  content: {
    formula: ['PV = nRT', 'P = pressure (Pa), V = volume (m³), n = moles, T = temperature (K), R = 8.314462618 J/(mol·K)'],
    body: [
      'The ideal gas law links the pressure, volume, amount and temperature of a gas in one equation: PV = nRT. Choose which of the four you want to find, enter the other three in whatever units you have, and the calculator converts everything to pascals, cubic meters, moles and kelvin before solving.',
      'The gas constant R is 8.314462618 joules per mole per kelvin. Temperature must be absolute, so Celsius and Fahrenheit values are converted to kelvin first, and pressure must be absolute rather than gauge pressure.',
      'The law is a model. It works well for common gases near room conditions, but real gases deviate at high pressure or low temperature.',
    ],
    faq: [
      { q: 'What volume does one mole of gas take at 0 °C and 1 atm?', a: 'About 22.414 L: V = nRT ÷ P = 8.314462618 × 273.15 ÷ 101,325 = 0.022414 m³.' },
      { q: 'Why must temperature be in kelvin?', a: 'The law is proportional to absolute temperature. A gas at 0 °C is not at zero energy, so the calculator adds 273.15 to Celsius values.' },
      { q: 'Can I use gauge pressure?', a: 'No. Use absolute pressure, which is gauge pressure plus the surrounding atmospheric pressure (about 14.7 psi at sea level).' },
      { q: 'When does the ideal gas law fail?', a: 'At high pressures and low temperatures, close to when a gas condenses, because molecules attract each other and take up space.' },
      { q: 'What value of R does it use?', a: '8.314462618 J/(mol·K), the exact value after the 2019 redefinition of the SI units.' },
    ],
    sources: [{ label: 'NIST, CODATA 2018 value of the molar gas constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r' }],
  },
  related: ['pressure-converter', 'temperature-converter'],
  examples: [
    { values: { solve: 'v', p: 101325, n: 1, t: 0 }, expect: { vOut: 0.022414 }, tolerance: 1e-6 },
    { values: { solve: 'p', v: 0.05, n: 2, t: 26.85 }, expect: { pOut: 99773.55 }, tolerance: 0.01 },
    { values: { solve: 'n', p: 100000, v: 0.025, t: 26.85 }, expect: { nOut: 2500 / (8.314462618 * 300) }, tolerance: 1e-9 },
    { values: { solve: 't', p: 101325, v: 0.0224, n: 1 }, expect: { tOut: (101325 * 0.0224) / 8.314462618 - 273.15 }, tolerance: 1e-9 },
    { values: { solve: 'v', p: 101325, n: 1, t: -300 }, expect: { error: 'Temperature must be above absolute zero (−273.15 °C).' } },
  ],
});

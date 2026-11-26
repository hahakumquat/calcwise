import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// 1 mechanical horsepower = 33,000 ft·lbf per minute, so hp = lb-ft x 2 pi x rpm / 33,000 = lb-ft x rpm / 5252.113.
const K = 33000 / (2 * Math.PI);
const LBFT_TO_NM = 1.3558179483314004;
const HP_TO_KW = 0.7456998715822702;

export default defineCalculator({
  slug: 'torque-horsepower',
  title: 'Torque to Horsepower Calculator',
  category: 'conversion',
  description: 'Convert torque and rpm to horsepower, or horsepower and rpm to torque, in lb-ft, N·m, hp and kW. Uses hp = lb-ft × rpm ÷ 5252.',
  metaDescription: 'Convert torque and rpm to horsepower, or horsepower and rpm back to torque. Results in lb-ft, N·m, hp and kW using the 5252 constant.',
  updated: '2026-11-26',
  keywords: ['torque to horsepower', 'horsepower to torque', 'hp from torque and rpm', 'lb-ft to hp calculator', 'torque rpm hp formula', '5252 torque horsepower'],
  inputs: [
    {
      id: 'mode', label: 'I know', type: 'select', segmented: true, default: 'power',
      options: [{ value: 'power', label: 'Torque' }, { value: 'torque', label: 'Horsepower' }],
      info: 'Pick what you have: torque (to find horsepower) or horsepower (to find torque).',
    },
    { id: 'torque', label: 'Torque', type: 'number', suffix: 'lb-ft', default: 400, min: 0, step: 1, info: 'Engine torque in pound-feet. For N·m, divide by 1.3558 first.', showWhen: { input: 'mode', is: ['power'] } },
    { id: 'power', label: 'Power', type: 'number', suffix: 'hp', default: 250, min: 0, step: 1, info: 'Mechanical horsepower (1 hp = 745.7 W).', showWhen: { input: 'mode', is: ['torque'] } },
    { id: 'rpm', label: 'Engine speed', type: 'number', suffix: 'rpm', default: 4000, min: 1, step: 100, info: 'Crankshaft revolutions per minute at which the torque or power was measured.' },
  ],
  outputs: [
    { id: 'hp', label: 'Horsepower', format: 'number', precision: 2, suffix: ' hp', primary: true, showWhen: { input: 'mode', is: ['power'] }, info: 'Torque in lb-ft × rpm ÷ 5252.113.' },
    { id: 'lbft', label: 'Torque', format: 'number', precision: 2, suffix: ' lb-ft', primary: true, showWhen: { input: 'mode', is: ['torque'] }, info: 'Horsepower × 5252.113 ÷ rpm.' },
    { id: 'nm', label: 'Torque in N·m', format: 'number', precision: 2, suffix: ' N·m', info: 'Pound-feet × 1.355818.' },
    { id: 'kw', label: 'Power in kW', format: 'number', precision: 2, suffix: ' kW', info: 'Horsepower × 0.7457.' },
    { id: 'hpOut', label: 'Power in hp', format: 'number', precision: 2, suffix: ' hp', showWhen: { input: 'mode', is: ['torque'] }, info: 'The horsepower you entered.' },
    { id: 'lbftOut', label: 'Torque in lb-ft', format: 'number', precision: 2, suffix: ' lb-ft', showWhen: { input: 'mode', is: ['power'] }, info: 'The torque you entered.' },
  ],
  compute: (v) => {
    const rpm = num(v.rpm);
    const fromTorque = v.mode !== 'torque';
    const x = num(fromTorque ? v.torque : v.power);
    if (x === null || rpm === null) return { hp: null, lbft: null };
    if (x < 0 || rpm <= 0) return { hp: null, lbft: null, error: 'Enter zero or more, and an engine speed above zero.' };
    const lbft = fromTorque ? x : (x * K) / rpm;
    const hp = fromTorque ? (x * rpm) / K : x;
    const nm = lbft * LBFT_TO_NM;
    const kw = hp * HP_TO_KW;
    const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
    // Curve: power and torque across rpm for constant torque, showing where hp and lb-ft cross at 5252 rpm.
    const rpms = [1000, 2000, 3000, 4000, 5000, 6000, 7000];
    return {
      hp, lbft, nm, kw, hpOut: hp, lbftOut: lbft,
      tone: 'ok',
      badge: `${fmt(hp)} hp at ${fmt(rpm)} rpm`,
      chart: {
        type: 'line',
        title: fromTorque ? 'Horsepower if this torque held at each rpm' : 'Torque needed for this horsepower at each rpm',
        x: rpms,
        xLabel: 'rpm',
        yLabel: fromTorque ? 'hp' : 'lb-ft',
        series: [{ name: fromTorque ? 'hp' : 'lb-ft', values: rpms.map((r) => (fromTorque ? (x * r) / K : (x * K) / r)) }],
        markers: rpm >= 1000 && rpm <= 7000 ? [{ x: rpm, label: `${fmt(rpm)} rpm` }] : undefined,
      },
      steps: fromTorque
        ? [`Horsepower: ${fmt(x)} lb-ft × ${fmt(rpm)} rpm ÷ 5252.113 = ${fmt(hp)} hp`, `Metric: ${fmt(x)} lb-ft × 1.355818 = ${fmt(nm)} N·m; ${fmt(hp)} hp × 0.7457 = ${fmt(kw)} kW`]
        : [`Torque: ${fmt(x)} hp × 5252.113 ÷ ${fmt(rpm)} rpm = ${fmt(lbft)} lb-ft`, `Metric: ${fmt(lbft)} lb-ft × 1.355818 = ${fmt(nm)} N·m; ${fmt(x)} hp × 0.7457 = ${fmt(kw)} kW`],
      note: 'Assumes mechanical horsepower and a single rpm. Real engines make different torque at different rpm, so use the figure measured at that speed.',
    };
  },
  content: {
    formula: ['hp = torque (lb-ft) × rpm ÷ 5252.113', 'torque (lb-ft) = hp × 5252.113 ÷ rpm', 'kW = N·m × rpm × 2π ÷ 60 ÷ 1000'],
    body: [
      'Torque is the twisting force an engine or motor delivers. Horsepower is the rate of doing work, which depends on torque and how fast the shaft turns. Spec sheets often quote torque at one rpm and power at another, so this calculator links them at a single speed.',
      'The constant 5252.113 is not a measured value. One mechanical horsepower is 33,000 foot-pounds per minute, and one revolution is 2π radians, so 33,000 ÷ 2π gives 5252.113. It is also why the horsepower and lb-ft curves on a dyno chart always cross at 5,252 rpm.',
      'Enter torque and rpm to get horsepower, or switch to horsepower to find the torque that figure implies at that speed. Results are also shown in N·m and kW. Horsepower here means mechanical horsepower (745.7 W); metric horsepower (PS) is about 1.4% smaller.',
    ],
    faq: [
      { q: 'How much horsepower is 400 lb-ft at 4,000 rpm?', a: '400 × 4,000 ÷ 5252.113 = 304.64 hp. In metric that is 542.33 N·m and 227.17 kW.' },
      { q: 'Why do torque and horsepower cross at 5,252 rpm?', a: 'At 5,252.113 rpm the formula becomes hp = lb-ft × 1, so the two numbers are equal. 300 lb-ft at that speed is exactly 300 hp.' },
      { q: 'How do I find torque from horsepower?', a: 'Rearrange the formula: lb-ft = hp × 5252.113 ÷ rpm. 250 hp at 6,000 rpm is 218.84 lb-ft.' },
      { q: 'Does it work for electric motors?', a: 'Yes. The relationship is the same for any rotating shaft as long as torque and rpm are measured at the same moment.' },
    ],
    sources: [
      { label: 'NIST SP 811: Guide for the Use of the International System of Units', url: 'https://www.nist.gov/pml/special-publication-811' },
    ],
  },
  related: ['power-converter', 'energy-converter', 'fuel-economy-converter'],
  examples: [
    // 400*4000/5252.113 = 304.6362; Nm 542.3272; kW 227.1700
    { values: { mode: 'power', torque: 400, rpm: 4000 }, expect: { hp: 304.64, nm: 542.33, kw: 227.17 }, tolerance: 0.001 },
    // 300 lb-ft at 5252.113 rpm = 300 hp
    { values: { mode: 'power', torque: 300, rpm: 5252.113 }, expect: { hp: 300 }, tolerance: 0.001 },
    // 250*5252.113/6000 = 218.8380
    { values: { mode: 'torque', power: 250, rpm: 6000 }, expect: { lbft: 218.84 }, tolerance: 0.001 },
  ],
});

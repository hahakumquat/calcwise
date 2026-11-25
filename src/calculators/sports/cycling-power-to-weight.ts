import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'cycling-power-to-weight',
  title: 'Cycling Power to Weight (W/kg) and FTP',
  category: 'sports',
  description: 'Work out your cycling watts per kilogram and estimate FTP from a 20-minute test. Enter your power and body weight in kg or lb, and edit the test factor.',
  keywords: ['cycling watts per kg', 'power to weight ratio cycling', 'ftp calculator', 'ftp from 20 minute test', 'w/kg calculator', 'indoor trainer ftp'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'mode', label: 'My power number is', type: 'select', default: 'test', options: [{ value: 'test', label: '20-minute test average' }, { value: 'ftp', label: 'My FTP already' }], info: 'Pick the 20-minute option to estimate FTP from a test, or enter an FTP you already have.' },
    { id: 'power', label: 'Power', type: 'number', default: 260, min: 1, step: 1, suffix: 'W', info: 'Your 20-minute average power from the test, or your FTP, in watts.' },
    { id: 'factor', label: 'Test factor', type: 'number', default: 95, min: 50, max: 100, step: 1, suffix: '%', info: 'FTP is commonly taken as 95% of a 20-minute average. Edit it if your coach or app uses another figure. Ignored if you entered an FTP.' },
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'kg', default: 75, min: 1, info: 'Your body weight. Switch to lb if you prefer; it is converted to kilograms.' },
  ],
  outputs: [
    { id: 'wkg', label: 'Power to weight', format: 'number', precision: 2, suffix: 'W/kg', primary: true, info: 'FTP divided by body weight in kilograms.' },
    { id: 'ftp', label: 'FTP', format: 'number', precision: 0, suffix: 'W', info: 'Test average × test factor, or the FTP you entered.' },
  ],
  compute: (v) => {
    const p = num(v.power);
    const f = num(v.factor);
    const kg = num(v.weight);
    if (p === null || p <= 0) return { wkg: null, error: 'Enter your power in watts.' };
    if (kg === null || kg <= 0) return { wkg: null, error: 'Enter your body weight.' };
    const test = v.mode !== 'ftp';
    if (test && (f === null || f <= 0 || f > 100)) return { wkg: null, error: 'Enter a test factor between 1 and 100.' };
    const ftp = test ? p * (f! / 100) : p;
    const wkg = ftp / kg;
    const factors = [90, 95, 100];
    return {
      wkg,
      ftp,
      tone: 'ok',
      badge: `${fmt(wkg)} W/kg`,
      note: `${fmt(ftp, 0)} W at ${fmt(kg, 1)} kg is ${fmt(wkg)} W/kg. A 20-minute test is only an estimate of FTP, and the factor you choose changes the answer.`,
      chart: {
        type: 'bar' as const,
        title: 'W/kg at other test factors',
        categories: factors.map((x) => `${x}%`),
        series: [{ name: 'W/kg', values: factors.map((x) => (test ? p * (x / 100) : p) / kg) }],
        format: { suffix: 'W/kg', precision: 2 },
      },
      steps: [
        test ? `FTP = ${fmt(p, 0)} W × ${fmt(f!, 0)}% = ${fmt(ftp, 1)} W` : `FTP = ${fmt(p, 0)} W (entered)`,
        `Body weight = ${fmt(kg, 2)} kg`,
        `W/kg = ${fmt(ftp, 1)} ÷ ${fmt(kg, 2)} = ${fmt(wkg)}`,
      ],
    };
  },
  content: {
    formula: ['FTP = 20-minute average × test factor (often 95%)', 'W/kg = FTP ÷ body weight in kg'],
    body: [
      'Power to weight is how many watts you can hold for each kilogram you carry. It matters most on climbs, where gravity does much of the work against you. FTP, or functional threshold power, is the power you could hold for about an hour. Many riders estimate it from a hard 20-minute effort.',
      'Example: you average 260 W for 20 minutes and weigh 75 kg. At a 95% factor your FTP is 260 × 0.95 = 247 W, which is 247 ÷ 75 = 3.29 W/kg. If you already know your FTP is 250 W, then 250 ÷ 75 = 3.33 W/kg.',
      'The 95% factor is a convention, not a law. Some coaches and apps use other values, so it is an input here. The chart shows how much the answer moves at 90%, 95% and 100%. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate watts per kilogram?', a: 'Divide your power in watts by your body weight in kilograms. 247 W at 75 kg is 3.29 W/kg.' },
      { q: 'How do I estimate FTP from a 20-minute test?', a: 'Multiply your 20-minute average power by 0.95. A 260 W average gives an FTP of 247 W.' },
      { q: 'Can I use pounds?', a: 'Yes. Switch the weight unit to lb and it is converted to kilograms first (1 lb = 0.45359 kg).' },
      { q: 'Why is the test factor editable?', a: 'Different coaches and apps use different factors. Edit it to match your own method; the calculator does not claim one is right.' },
      { q: 'What if I already know my FTP?', a: 'Choose "My FTP already" and enter it. The test factor is then ignored and W/kg is simply FTP ÷ weight.' },
    ],
    sources: [
      { label: 'Wikipedia: Functional threshold power', url: 'https://en.wikipedia.org/wiki/Functional_threshold_power' },
    ],
  },
  related: ['heart-rate-zones', 'race-time-predictor', 'pace'],
  examples: [
    // FTP 260*0.95 = 247; 247/75 = 3.29333
    { values: { mode: 'test', power: 260, factor: 95, weight: 75 }, expect: { ftp: 247, wkg: 3.293333 }, tolerance: 1e-5 },
    // direct FTP 250 / 75 = 3.33333
    { values: { mode: 'ftp', power: 250, factor: 95, weight: 75 }, expect: { ftp: 250, wkg: 3.333333 }, tolerance: 1e-5 },
  ],
});

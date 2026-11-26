import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Unit inputs arrive in SI base units: mass in kg, volume in m³, time in seconds.
const L_PER_M3 = 1000;
const VOL = ['l', 'ml', 'floz'];
const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'sweat-rate',
  title: 'Sweat Rate Calculator',
  category: 'health',
  description: 'Work out your sweat rate per hour from a before and after weigh-in, the fluid you drank and any bathroom stop. Works in lb, kg, oz or mL.',
  keywords: ['sweat rate calculator', 'how much do i sweat', 'sweat loss per hour', 'sweat test weigh in', 'fluid loss during exercise', 'hydration calculator runners'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'before', label: 'Weight before', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', default: 154, min: 0, step: 0.1, info: 'Weigh yourself before the session, ideally after using the bathroom, wearing as little as possible and dry.' },
    { id: 'after', label: 'Weight after', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', default: 152, min: 0, step: 0.1, info: 'Towel off, then weigh yourself in the same clothes (or none) on the same scale straight after the session.' },
    { id: 'drunk', label: 'Fluid drunk during the session', type: 'number', unit: 'volume', units: ['floz', 'ml', 'l'], defaultUnit: 'floz', default: 16, min: 0, step: 1, info: 'Everything you drank between the two weigh-ins. A 16.9 fl oz bottle is 500 mL. Enter 0 if you drank nothing.' },
    { id: 'urine', label: 'Urine passed during the session', type: 'number', unit: 'volume', units: ['floz', 'ml', 'l'], defaultUnit: 'floz', default: 0, min: 0, step: 1, info: 'Volume of urine passed between the weigh-ins, if you measured it. Leave at 0 if you did not go.' },
    { id: 'time', label: 'Session length', type: 'number', unit: 'time', units: ['min', 'h'], defaultUnit: 'min', default: 60, min: 0, step: 1, info: 'How long the session lasted, from first weigh-in to second.' },
  ],
  outputs: [
    { id: 'rate', label: 'Sweat rate per hour', primary: true, unit: 'volume', units: VOL, defaultUnit: 'l', precision: 2, info: 'Total sweat loss scaled to one hour: sweat loss ÷ hours.' },
    { id: 'sweat', label: 'Total sweat loss', unit: 'volume', units: VOL, defaultUnit: 'l', precision: 2, info: 'Weight lost + fluid drunk − urine passed, counting 1 kg of weight as 1 L.' },
    { id: 'pct', label: 'Body mass lost', format: 'percent', precision: 2, info: 'Weight lost ÷ weight before. This is the net drop on the scale, before adding back the fluid you drank.' },
  ],
  compute: (v) => {
    const before = num(v.before);
    const after = num(v.after);
    const drunk = num(v.drunk) ?? 0;
    const urine = num(v.urine) ?? 0;
    const secs = num(v.time);
    if (before === null || after === null || secs === null || before <= 0 || after <= 0 || secs <= 0 || drunk < 0 || urine < 0) return { rate: null };
    const lostL = before - after; // 1 kg of weight lost ≈ 1 L
    const drunkL = drunk * L_PER_M3;
    const urineL = urine * L_PER_M3;
    const sweatL = lostL + drunkL - urineL;
    if (sweatL < 0) {
      return { rate: null, note: 'Your inputs give a negative sweat loss. Check that the weights, fluid drunk and urine are right, and that you used the same scale and clothes both times.' };
    }
    const hours = secs / 3600;
    const rateL = sweatL / hours;
    const pct = lostL / before;
    return {
      rate: rateL / L_PER_M3,
      sweat: sweatL / L_PER_M3,
      pct,
      tone: 'ok',
      badge: `${fmt(rateL)} L/h`,
      note: `About ${fmt(sweatL)} L of sweat over ${fmt(hours, 2)} h is ${fmt(rateL)} L an hour (${fmt(rateL * 33.814, 1)} US fl oz an hour). This is an estimate from a weigh-in, not medical advice.`,
      chart: {
        type: 'bar',
        title: 'How the sweat loss adds up (litres)',
        categories: ['Weight lost', '+ Drunk', '− Urine', 'Sweat loss'],
        series: [{ name: 'Litres', values: [Math.max(lostL, 0), drunkL, urineL, sweatL] }],
        format: { format: 'number', precision: 2 },
        highlight: 3,
      },
      steps: [
        `Weight lost = before − after = ${fmt(lostL, 2)} kg, counted as ${fmt(lostL, 2)} L`,
        `Sweat loss = ${fmt(lostL, 2)} + ${fmt(drunkL, 2)} drunk − ${fmt(urineL, 2)} urine = ${fmt(sweatL, 2)} L`,
        `Rate = ${fmt(sweatL, 2)} L ÷ ${fmt(hours, 2)} h = ${fmt(rateL, 2)} L/h`,
        `Body mass lost = ${fmt(lostL, 2)} ÷ ${fmt(before, 2)} kg × 100 = ${fmt(pct * 100, 2)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Sweat loss (L) = (weight before − weight after, in kg) + fluid drunk (L) − urine (L)',
      'Sweat rate (L/h) = sweat loss ÷ hours',
      'Body mass lost (%) = (weight before − weight after) ÷ weight before × 100',
    ],
    body: [
      'A sweat test is a weigh-in before and after a session. Each kilogram you lose is about a litre of fluid, so the drop on the scale, plus anything you drank, minus anything you passed as urine, estimates how much you sweated. Dividing by the hours gives a rate you can compare between sessions and conditions.',
      'Example: you weigh 70.0 kg before and 69.0 kg after a 60-minute run, and you drank 0.5 L with no bathroom stop. Sweat loss is 1.0 + 0.5 − 0 = 1.5 L, so the rate is 1.5 L an hour. Body mass lost is 1.0 ÷ 70 = 1.43%.',
      'Pounds and ounces are converted for you: 1 lb is 0.45359237 kg and 1 US fl oz is 29.5735 mL. For a fair test, weigh on the same scale, towel off, and wear the same clothes both times. Sweat rate changes with heat, humidity, pace and fitness, so one test only describes that day.',
      'This is an estimate for general interest. It also ignores small losses such as breath and the weight of fuel burned. It is not medical advice and does not tell you how much to drink; for that, talk to a doctor or a sports dietitian. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate my sweat rate?', a: 'Subtract your weight after from your weight before, add the fluid you drank, subtract any urine, then divide by the hours. 70.0 kg to 69.0 kg with 0.5 L drunk over 60 minutes is (1.0 + 0.5) ÷ 1 = 1.5 L an hour.' },
      { q: 'Why does 1 kg count as 1 litre?', a: 'Sweat is mostly water, and a litre of water weighs about 1 kg. Sweat is slightly saltier, so the real figure is close to, but not exactly, 1 kg per litre.' },
      { q: 'What if I did not drink or pass urine?', a: 'Enter 0 for both. Then sweat loss is simply the weight you lost. 80 kg to 79 kg in 60 minutes with nothing to drink is 1.0 L an hour.' },
      { q: 'What does body mass lost mean?', a: 'It is the weight you lost as a share of your starting weight, before adding back the fluid you drank. 80.0 kg to 78.4 kg is 1.6 ÷ 80 = 2.0%.' },
      { q: 'Is this medical advice?', a: 'No. It is arithmetic on your own numbers and is only an estimate. For advice on hydration, ask a doctor or sports dietitian.' },
    ],
    sources: [
      { label: 'Sawka MN et al. (2007). American College of Sports Medicine position stand: Exercise and fluid replacement. Medicine & Science in Sports & Exercise 39(2):377-390', url: 'https://pubmed.ncbi.nlm.nih.gov/17277604/' },
    ],
  },
  related: ['water-intake', 'calories-burned', 'weight-change-rate', 'bmi'],
  examples: [
    // 1.0 kg lost + 0.0005 m³ (0.5 L) drunk - 0 urine = 1.5 L = 0.0015 m³; 3600 s = 1 h -> 0.0015 m³/h; pct 1/70 = 0.0142857
    { values: { before: 70, after: 69, drunk: 0.0005, urine: 0, time: 3600 }, expect: { sweat: 0.0015, rate: 0.0015, pct: 0.0142857 }, tolerance: 1e-6 },
    // 1.6 kg lost + 0.3 L - 0.1 L = 1.8 L = 0.0018 m³; 5400 s = 1.5 h -> 1.2 L/h = 0.0012 m³/h; pct 1.6/80 = 0.02
    { values: { before: 80, after: 78.4, drunk: 0.0003, urine: 0.0001, time: 5400 }, expect: { sweat: 0.0018, rate: 0.0012, pct: 0.02 }, tolerance: 1e-6 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const ML_PER_GAL = 3785.41;

export default defineCalculator({
  slug: 'faucet-drip-cost',
  title: 'Faucet Drip Cost Calculator',
  category: 'everyday',
  description: 'Estimate the water and sewer cost of a dripping or trickling faucet from drips or gallons a minute, hours a day, days and your price per 1,000 gallons.',
  keywords: ['faucet drip cost', 'cost of dripping faucet overnight', 'drip faucet to prevent frozen pipes cost', 'how much water does a dripping faucet use', 'leaky faucet cost'],
  updated: '2026-11-26',
  inputs: [
    { id: 'mode', label: 'Measure the flow as', type: 'select', default: 'drip', options: [{ value: 'drip', label: 'Drips a minute' }, { value: 'trickle', label: 'Gallons a minute' }], info: 'Pick drips for a slow drip, or gallons a minute for a thin steady trickle.' },
    { id: 'drips', label: 'Drips a minute', type: 'number', default: 60, min: 0, step: 5, showWhen: { input: 'mode', is: 'drip' }, info: 'Count the drips in one minute.' },
    { id: 'ml', label: 'Volume of one drip', type: 'number', suffix: 'mL', default: 0.05, min: 0, step: 0.01, showWhen: { input: 'mode', is: 'drip' }, info: 'A common rule of thumb is about 0.05 mL, but drip size varies. Catch 20 drips in a measuring cup to check yours.' },
    { id: 'gpm', label: 'Gallons a minute', type: 'number', suffix: 'gal/min', default: 0.25, min: 0, step: 0.05, showWhen: { input: 'mode', is: 'trickle' }, info: 'Time how long a container takes to fill from the trickle and divide.' },
    { id: 'hours', label: 'Hours per day', type: 'number', suffix: 'h', default: 24, min: 0, max: 24, step: 0.5, info: 'Hours each day the faucet runs. Use 8 for an overnight drip.' },
    { id: 'days', label: 'Days', type: 'number', default: 30, min: 1, max: 366, step: 1, info: 'Number of days or nights it runs.' },
    { id: 'price', label: 'Water and sewer price', type: 'number', prefix: '$', suffix: '/1,000 gal', default: 10, min: 0, step: 0.5, info: 'From your water bill. Include the sewer charge if it is billed by water used.' },
  ],
  outputs: [
    { id: 'cost', label: 'Estimated water cost', format: 'currency', primary: true, info: 'Total gallons ÷ 1,000 × price per 1,000 gallons.' },
    { id: 'gallons', label: 'Total water used', format: 'number', precision: 1, suffix: 'gal', info: 'Gallons per day × days.' },
    { id: 'galDay', label: 'Water used per day', format: 'number', precision: 2, suffix: 'gal', info: 'Flow per minute × 60 × hours per day.' },
  ],
  compute: (v) => {
    const mode = v.mode === 'trickle' ? 'trickle' : 'drip';
    const hours = num(v.hours), days = num(v.days), price = num(v.price);
    if ([hours, days, price].some((x) => x === null)) return { cost: null };
    if ((hours as number) < 0 || (hours as number) > 24 || (days as number) < 1 || (price as number) < 0) return { cost: null };
    let galMin: number;
    let flowStep: string;
    if (mode === 'drip') {
      const drips = num(v.drips), ml = num(v.ml);
      if (drips === null || ml === null || drips < 0 || ml < 0) return { cost: null };
      galMin = (drips * ml) / ML_PER_GAL;
      flowStep = `${fmt(drips, 0)} drips × ${fmt(ml, 3)} mL ÷ 3,785.41 = ${fmt(galMin, 5)} gal a minute`;
    } else {
      const gpm = num(v.gpm);
      if (gpm === null || gpm < 0) return { cost: null };
      galMin = gpm;
      flowStep = `${fmt(gpm, 3)} gal a minute`;
    }
    const galDay = galMin * 60 * (hours as number);
    const gallons = galDay * (days as number);
    const cost = (gallons / 1000) * (price as number);
    return {
      cost,
      gallons,
      galDay,
      tone: 'ok',
      badge: 'Estimate',
      note: 'This is an estimate: drip size and flow vary. Whether to let a faucet drip in cold weather is a plumbing question, so check local advice. The cost of a burst pipe is not calculated here.',
      chart: {
        type: 'bar' as const,
        title: 'Water cost by period',
        categories: ['One day', 'All days'],
        series: [{ name: 'Cost', values: [(galDay / 1000) * (price as number), cost] }],
        format: CURRENCY,
        highlight: 1,
      },
      steps: [
        flowStep,
        `Per day = ${fmt(galMin, 5)} × 60 × ${fmt(hours as number)} h = ${fmt(galDay, 3)} gal`,
        `Total = ${fmt(galDay, 3)} × ${fmt(days as number, 0)} days = ${fmt(gallons, 2)} gal`,
        `Cost = ${fmt(gallons, 2)} ÷ 1,000 × ${money(price as number)} = ${money(cost)}`,
      ],
    };
  },
  content: {
    formula: [
      'Drip mode: gallons a minute = drips a minute × mL per drip ÷ 3,785.41',
      'Gallons a day = gallons a minute × 60 × hours per day',
      'Cost = gallons a day × days ÷ 1,000 × price per 1,000 gallons',
    ],
    body: [
      'A dripping faucet looks wasteful, but the bill is usually small. Enter how fast it drips, how long it runs and what your utility charges per 1,000 gallons to see the cost in dollars.',
      'The size of a drip is the soft spot. The default of 0.05 mL is a rule of thumb, and your drip may be bigger or smaller. For a thin steady stream, switch to gallons a minute and time how long a container takes to fill.',
      'Whether to drip a faucet during a cold snap is a plumbing and local-advice question, and this calculator does not answer it. It also does not estimate the cost of a burst pipe. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does a dripping faucet cost?', a: 'With the defaults, 60 drips a minute at 0.05 mL is about 1.14 gallons a day. Over 30 days that is about 34.2 gallons, or about $0.34 at $10 per 1,000 gallons. This is an estimate.' },
      { q: 'What about a thin trickle?', a: 'At 0.25 gallons a minute for 8 hours, that is 120 gallons a night. Over 5 nights it is 600 gallons, or $6.00 at $10 per 1,000 gallons.' },
      { q: 'How big is one drip?', a: 'It varies. 0.05 mL is a common rule of thumb, so measure your own by catching 20 drips and dividing the volume by 20.' },
      { q: 'Should I drip my faucet in freezing weather?', a: 'That is a plumbing question and depends on your home and local advice. This calculator only works out the water cost.' },
    ],
    sources: [],
  },
  related: ['shower-cost', 'water-heater-cost', 'heating-cost', 'electricity-cost'],
  examples: [
    // gal/min = 60*0.05/3785.41; day = *1440 = 4320/3785.41 = 1.1412238; 30 d = 34.236714; cost = 0.34236714
    { values: { mode: 'drip', drips: 60, ml: 0.05, hours: 24, days: 30, price: 10 }, expect: { galDay: 1.1412238, gallons: 34.236714, cost: 0.34236714 }, tolerance: 1e-6 },
    // 0.25 gpm * 60 * 8 h = 120 gal a night; 5 nights = 600; 600/1000*10 = 6.00
    { values: { mode: 'trickle', gpm: 0.25, hours: 8, days: 5, price: 10 }, expect: { galDay: 120, gallons: 600, cost: 6 }, tolerance: 1e-9 },
    // 30*0.05*1440 = 2160 mL a day / 3785.41 = 0.5706119; 7 d = 3.9942833; cost = 3.9942833/1000*12 = 0.0479314
    { values: { mode: 'drip', drips: 30, ml: 0.05, hours: 24, days: 7, price: 12 }, expect: { galDay: 0.5706119, gallons: 3.9942833, cost: 0.0479314 }, tolerance: 1e-6 },
  ],
});

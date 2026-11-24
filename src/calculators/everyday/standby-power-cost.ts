import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const names = ['Device 1', 'Device 2', 'Device 3', 'Device 4', 'Device 5'];
const defaults = [15, 10, 1.5, 3, 2];

export default defineCalculator({
  slug: 'standby-power-cost',
  title: 'Standby Power Cost Calculator',
  category: 'everyday',
  description: 'Add up what your idle devices cost a year in standby power. Enter the watts each one draws when off or idle, your hours and your electricity rate.',
  keywords: ['standby power cost', 'vampire power calculator', 'phantom load cost', 'how much do idle devices cost', 'cost of leaving devices plugged in'],
  updated: '2026-11-24',
  inputs: [
    ...names.map((n, i) => ({ id: 'w' + (i + 1), label: `${n}: watts when idle`, type: 'number' as const, suffix: 'W', default: defaults[i], min: 0, step: 0.1, optional: true, info: 'Read it from a plug-in power meter. Leave at 0 if you have fewer devices.' })),
    { id: 'hours', label: 'Hours a day they sit idle', type: 'number', suffix: 'h', default: 20, min: 0, max: 24, step: 0.5, info: 'Hours each day the devices are plugged in but not in use.' },
    { id: 'rate', label: 'Electricity rate', type: 'number', prefix: '$', suffix: 'per kWh', default: 0.16, min: 0, step: 0.01, info: 'Find it on your bill, in dollars per kilowatt-hour.' },
  ],
  outputs: [
    { id: 'yearCost', label: 'Standby cost a year', format: 'currency', primary: true, info: 'Total watts × hours a day × 365 ÷ 1,000 × rate.' },
    { id: 'monthCost', label: 'Standby cost a month', format: 'currency', info: 'Yearly cost ÷ 12.' },
    { id: 'kwh', label: 'Energy wasted a year', format: 'number', suffix: 'kWh', precision: 1, info: 'Total watts × hours a day × 365 ÷ 1,000.' },
    { id: 'topCost', label: 'Costliest device a year', format: 'currency', info: 'Yearly cost of the single device that draws the most.' },
  ],
  compute: (v) => {
    const rate = num(v.rate);
    const hours = num(v.hours);
    if (rate === null || hours === null) return { yearCost: null };
    if (rate < 0 || hours < 0) return { yearCost: null, error: 'Rate and hours cannot be negative.' };
    if (hours > 24) return { yearCost: null, error: 'Hours a day cannot be above 24.' };
    const rows: { n: number; w: number }[] = [];
    for (let k = 1; k <= 5; k++) {
      const w = v['w' + k] === undefined || v['w' + k] === '' ? 0 : num(v['w' + k]);
      if (w === null) return { yearCost: null };
      if (w < 0) return { yearCost: null, error: 'Watts cannot be negative.' };
      if (w > 0) rows.push({ n: k, w });
    }
    if (rows.length === 0) return { yearCost: null };
    const kwhOf = (w: number) => (w * hours * 365) / 1000;
    const totalW = rows.reduce((s, r) => s + r.w, 0);
    const kwh = kwhOf(totalW);
    const yearCost = kwh * rate;
    const monthCost = yearCost / 12;
    const top = rows.reduce((a, b) => (b.w > a.w ? b : a));
    const topCost = kwhOf(top.w) * rate;
    return {
      yearCost, monthCost, kwh, topCost,
      tone: 'ok',
      badge: `${usd(yearCost)} a year doing nothing`,
      chart: {
        type: 'bar',
        title: 'Standby cost a year',
        categories: rows.map((r) => 'Device ' + r.n),
        series: [{ name: 'Per year', values: rows.map((r) => kwhOf(r.w) * rate) }],
        format: { format: 'currency' },
      },
      steps: [
        `Total idle draw: ${rows.map((r) => r.w).join(' + ')} = ${totalW} W`,
        `Energy a year: ${totalW} W × ${hours} h × 365 ÷ 1,000 = ${kwh.toFixed(1)} kWh`,
        `Cost a year: ${kwh.toFixed(1)} kWh × ${usd(rate)} = ${usd(yearCost)} (${usd(monthCost)} a month)`,
        `Biggest device: Device ${top.n} at ${usd(topCost)} a year`,
      ],
      note: 'Watts are your own meter readings, not typical figures; they vary by model and settings. Devices that actually use power while in use are not counted here. Tiered or time-of-use rates are not modelled.',
    };
  },
  content: {
    formula: [
      'Energy a year (kWh) = total idle watts × idle hours a day × 365 ÷ 1,000',
      'Cost a year = energy × rate per kWh',
      'Cost a month = cost a year ÷ 12',
    ],
    body: [
      'Many devices keep drawing a little power when they look switched off: cable boxes, consoles, soundbars, chargers. Each draw is small, but it runs for most of the day, every day.',
      'Measure each device with a plug-in power meter, enter the watts it draws when idle, and the calculator turns the total into kilowatt-hours and dollars a year.',
      'Use your own readings. Modern devices vary a lot, and a plug-in meter takes a minute to use. A smart power strip or a switch lets you cut the draw to zero for devices you do not need on.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'Devices drawing 15, 10, 1.5, 3 and 2 watts total 31.5 W. Over 20 idle hours a day that is 229.95 kWh a year, which costs $36.79 at $0.16 per kWh, or $3.07 a month. The 15 W device alone costs $17.52 a year.' },
      { q: 'How do I find the watts?', a: 'Plug the device into a plug-in power meter and read it while the device is idle or off. The label on the device shows its maximum draw, not idle draw.' },
      { q: 'Why 20 hours?', a: 'It is a default for devices used about four hours a day. Change it to match your own habits, or set 24 for devices that never switch off.' },
      { q: 'Is it worth unplugging things?', a: 'It is worth it for the biggest few devices. Compare the yearly cost above with how much effort it takes to switch them off, for example with a power strip.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'energy-converter', 'energy-upgrade-payback'],
  examples: [
    // total 31.5 W * 20 * 365 /1000 = 229.95 kWh; *0.16 = 36.792; month 3.066; top 15W -> 109.5*0.16=17.52
    { values: { w1: 15, w2: 10, w3: 1.5, w4: 3, w5: 2, hours: 20, rate: 0.16 }, expect: { kwh: 229.95, yearCost: 36.792, monthCost: 3.066, topCost: 17.52 }, tolerance: 0.01 },
    // 10 W * 24 * 365 / 1000 = 87.6 kWh; *0.20 = 17.52
    { values: { w1: 10, w2: 0, w3: 0, w4: 0, w5: 0, hours: 24, rate: 0.2 }, expect: { kwh: 87.6, yearCost: 17.52, topCost: 17.52 }, tolerance: 0.01 },
  ],
});

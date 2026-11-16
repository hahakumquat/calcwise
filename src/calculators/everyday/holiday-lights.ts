import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const VOLTS = 120; // US household branch circuit
const CONTINUOUS = 0.8; // continuous loads are kept to 80% of the breaker rating (NEC rule of thumb)

const r2 = (x: number) => Math.round(x * 100) / 100;

export default defineCalculator({
  slug: 'holiday-lights',
  title: 'Christmas Lights Cost & Circuit Calculator',
  category: 'everyday',
  description: 'What your Christmas lights cost to run for the season, plus a circuit check: how many watts your 15 or 20 amp circuit can carry safely.',
  keywords: ['christmas lights cost', 'holiday lights electricity cost', 'how much do christmas lights cost to run', 'led vs incandescent christmas lights', 'christmas lights circuit load', 'how many christmas lights on one circuit'],
  inputs: [
    { id: 'strings', label: 'Light strings', type: 'number', default: 10, min: 1, step: 1, info: 'How many strings or sets you will run.' },
    { id: 'watts', label: 'Watts per string', type: 'number', default: 40, min: 0, suffix: 'W', info: 'Read it from the box or the plug label. Try your LED and old incandescent sets side by side; the figure varies a lot by product.' },
    { id: 'hours', label: 'Hours on per day', type: 'number', default: 6, min: 0, max: 24, suffix: 'h/day', info: 'Typical evening display time.' },
    { id: 'days', label: 'Days on', type: 'number', default: 45, min: 1, step: 1, suffix: 'days', info: 'Roughly Thanksgiving to early January is about 45 days.' },
    { id: 'rate', label: 'Electricity rate', type: 'number', prefix: '$', suffix: '/kWh', default: 0.165, min: 0, step: 0.005, info: 'What you pay per kilowatt-hour; see your bill.' },
    {
      id: 'amps', label: 'Circuit breaker', type: 'select', default: '15', segmented: true,
      options: [{ value: '15', label: '15 A' }, { value: '20', label: '20 A' }],
      info: 'Printed on the breaker for the outlet your lights plug into.',
    },
    { id: 'other', label: 'Other load on that circuit', type: 'number', default: 0, min: 0, suffix: 'W', optional: true, info: 'Anything else running on the same circuit, such as an inflatable or another outlet in the room.' },
  ],
  outputs: [
    { id: 'cost', label: 'Season cost', format: 'currency', primary: true, info: 'Total kWh × your rate.' },
    { id: 'kwh', label: 'Energy used', precision: 1, suffix: 'kWh', info: 'Total watts × hours per day × days ÷ 1,000.' },
    { id: 'perDay', label: 'Cost per day', format: 'currency', precision: 2, info: 'Season cost ÷ days.' },
    { id: 'totalWatts', label: 'Lights load', precision: 0, suffix: 'W', info: 'Strings × watts per string.' },
    { id: 'limit', label: 'Safe circuit limit', precision: 0, suffix: 'W', info: '120 V × breaker amps × 80% for a load that stays on for hours.' },
    { id: 'headroom', label: 'Watts to spare', precision: 0, suffix: 'W', info: 'Safe limit minus the lights and any other load. Negative means overloaded.' },
    { id: 'maxStrings', label: 'Most strings that fit', precision: 0, info: 'How many strings of this wattage fit within the safe limit after other load.' },
  ],
  compute: (v) => {
    const strings = num(v.strings);
    const w = num(v.watts);
    const h = num(v.hours);
    const days = num(v.days);
    const rate = num(v.rate);
    const other = num(v.other) ?? 0;
    const amps = Number(v.amps) === 20 ? 20 : 15;
    if (strings === null || w === null || h === null || days === null || rate === null) return { cost: null };
    if (strings < 1 || w < 0 || h < 0 || h > 24 || days < 1 || rate < 0 || other < 0) return { cost: null, error: 'Check your entries: values cannot be negative, hours at most 24.' };

    const totalWatts = strings * w;
    const kwh = (totalWatts * h * days) / 1000;
    const cost = kwh * rate;
    const limit = VOLTS * amps * CONTINUOUS;
    const headroom = limit - other - totalWatts;
    const maxStrings = w > 0 ? Math.max(0, Math.floor((limit - other + 1e-9) / w)) : null;
    return {
      cost,
      kwh,
      perDay: cost / days,
      totalWatts,
      limit,
      headroom,
      maxStrings,
      chart: {
        type: 'bar',
        title: 'Lights cost',
        categories: ['Per day', 'Per week', 'Season'],
        series: [{ name: 'Cost', values: [cost / days, (cost / days) * 7, cost] }],
        format: { format: 'currency' },
        highlight: 2,
      },
      steps: [
        `Load = ${strings} × ${w} W = ${totalWatts} W`,
        `Energy = ${totalWatts} W × ${h} h × ${days} days ÷ 1,000 = ${r2(kwh)} kWh`,
        `Cost = ${r2(kwh)} kWh × $${rate} = $${r2(cost)}`,
        `Circuit = ${VOLTS} V × ${amps} A × 80% = ${limit} W safe limit`,
      ],
    };
  },
  content: {
    formula: ['kWh = watts × hours per day × days ÷ 1,000', 'Cost = kWh × price per kWh', 'Safe circuit load = 120 V × amps × 0.8'],
    body: [
      'Enter how many strings you run, the wattage printed on each, how many hours a night they are on and how many days, and you get the season cost. Wattage is an input on purpose: sets of the same length differ a lot, and LED sets typically draw a small fraction of what old incandescent ones do. Run the calculator twice with each wattage to see the saving for your own lights.',
      'The circuit check uses the common rule that a load running for three hours or more should stay within 80% of the breaker rating. On a 120 V, 15 A circuit that is 1,440 W; on 20 A it is 1,920 W. Remember that outlets in several rooms can share one breaker, so add anything else on it in the "other load" box.',
      'This calculator gives an estimate for planning. If a breaker trips, cords feel warm or you are unsure what is on a circuit, spread the lights across circuits or ask an electrician. Use outdoor-rated cords and lights outside.',
    ],
    faq: [
      { q: 'How much does it cost to run Christmas lights?', a: 'It depends entirely on wattage. 10 strings at 40 W for 6 hours a day over 45 days is 108 kWh, which is $17.82 at 16.5 cents per kWh. The same 10 strings at 7 W each use 18.9 kWh and cost $3.12.' },
      { q: 'How many Christmas lights can I plug into one circuit?', a: 'Keep the total under 80% of the breaker rating: 1,440 W for a 15 A, 120 V circuit. At 40 W per string that is up to 36 strings, minus whatever else is on the circuit.' },
      { q: 'Is LED really cheaper to run?', a: 'Yes, in nearly every case LED sets draw far less power, so the same hours cost much less. Check the label: the wattage differs by product, which is why this calculator asks for it.' },
    ],
    sources: [
      { label: 'US Department of Energy: Holiday lighting', url: 'https://www.energy.gov/energysaver/holiday-lighting-and-decorating' },
      { label: 'US EIA: Electricity explained, prices (average residential rate)', url: 'https://www.eia.gov/energyexplained/electricity/prices-and-factors-affecting-prices.php' },
    ],
  },
  related: ['electricity-cost', 'heating-cost', 'year-progress'],
  examples: [
    // 10 x 40 = 400 W; 400 x 6 x 45 / 1000 = 108 kWh; x 0.165 = 17.82; per day 0.396; limit 1440; headroom 1040; max strings 1440/40 = 36
    { values: { strings: 10, watts: 40, hours: 6, days: 45, rate: 0.165, amps: '15', other: 0 }, expect: { totalWatts: 400, kwh: 108, cost: 17.82, perDay: 0.396, limit: 1440, headroom: 1040, maxStrings: 36 } },
    // 10 x 7 = 70 W; 70 x 6 x 45 / 1000 = 18.9 kWh; x 0.165 = 3.1185
    { values: { strings: 10, watts: 7, hours: 6, days: 45, rate: 0.165, amps: '15', other: 0 }, expect: { kwh: 18.9, cost: 3.1185 } },
    // 3 x 7 = 21 W; 21 x 6 x 30 / 1000 = 3.78 kWh; x 0.2 = 0.756; 20 A: 120 x 20 x 0.8 = 1920; headroom 1920 - 500 - 21 = 1399; max floor(1420/7) = 202
    { values: { strings: 3, watts: 7, hours: 6, days: 30, rate: 0.2, amps: '20', other: 500 }, expect: { kwh: 3.78, cost: 0.756, limit: 1920, headroom: 1399, maxStrings: 202 } },
  ],
});

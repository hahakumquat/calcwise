import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'cook-appliance-cost',
  title: 'Oven vs Air Fryer vs Slow Cooker Cost',
  category: 'everyday',
  description: 'Compare the electricity cost of cooking one meal in an oven, an air fryer or a slow cooker, find the cheapest, and see what you save in a year.',
  keywords: ['oven vs air fryer cost', 'is an air fryer cheaper than an oven', 'slow cooker electricity cost', 'crock pot cost per hour', 'air fryer cost to run', 'cheapest way to cook'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'ovenW', label: 'Oven power', type: 'number', default: 2400, min: 0, step: 100, suffix: 'watts', info: 'Your estimate of the average draw while heating. See the data plate.' },
    { id: 'ovenMin', label: 'Oven time', type: 'number', default: 60, min: 0, step: 5, suffix: 'minutes', info: 'Including preheat.' },
    { id: 'airW', label: 'Air fryer power', type: 'number', default: 1500, min: 0, step: 100, suffix: 'watts', info: 'Your estimate of the average draw while heating. See the label.' },
    { id: 'airMin', label: 'Air fryer time', type: 'number', default: 25, min: 0, step: 1, suffix: 'minutes', info: 'Including preheat.' },
    { id: 'slowW', label: 'Slow cooker power', type: 'number', default: 200, min: 0, step: 10, suffix: 'watts', info: 'Your estimate of the average draw over the cook. It cycles to hold temperature.' },
    { id: 'slowHr', label: 'Slow cooker time', type: 'number', default: 8, min: 0, step: 0.5, suffix: 'hours', info: 'Total time on.' },
    { id: 'price', label: 'Electricity price', type: 'number', prefix: '$', default: 0.16, min: 0, step: 0.01, suffix: 'per kWh', info: 'On your electric bill.' },
    { id: 'meals', label: 'Meals per week with this recipe', type: 'number', default: 3, min: 0, step: 1, info: 'Used for the yearly saving, at 52 weeks.' },
  ],
  outputs: [
    { id: 'cheapestCost', label: 'Cheapest cost per meal', format: 'currency', precision: 2, primary: true, info: 'The lowest of the three costs per meal.' },
    { id: 'cheapest', label: 'Cheapest appliance', format: 'text', info: 'The appliance with the lowest cost per meal.' },
    { id: 'oven', label: 'Oven cost per meal', format: 'currency', precision: 2, info: 'Watts ÷ 1,000 × hours × price.' },
    { id: 'air', label: 'Air fryer cost per meal', format: 'currency', precision: 2, info: 'Watts ÷ 1,000 × hours × price.' },
    { id: 'slow', label: 'Slow cooker cost per meal', format: 'currency', precision: 2, info: 'Watts ÷ 1,000 × hours × price.' },
    { id: 'saveYear', label: 'Saving per year vs the oven', format: 'currency', precision: 2, info: '(Oven cost − cheapest cost) × meals per week × 52. Zero if the oven is cheapest.' },
  ],
  compute: (v) => {
    const ovenW = num(v.ovenW), ovenMin = num(v.ovenMin), airW = num(v.airW), airMin = num(v.airMin);
    const slowW = num(v.slowW), slowHr = num(v.slowHr), price = num(v.price), meals = num(v.meals);
    const all = [ovenW, ovenMin, airW, airMin, slowW, slowHr, price, meals];
    if (all.some((x) => x === null || x < 0)) return { cheapestCost: null };
    const ovenKwh = (ovenW! / 1000) * (ovenMin! / 60);
    const airKwh = (airW! / 1000) * (airMin! / 60);
    const slowKwh = (slowW! / 1000) * slowHr!;
    const oven = ovenKwh * price!, air = airKwh * price!, slow = slowKwh * price!;
    const list = [
      { name: 'Oven', cost: oven },
      { name: 'Air fryer', cost: air },
      { name: 'Slow cooker', cost: slow },
    ];
    const best = list.reduce((a, b) => (b.cost < a.cost ? b : a));
    const saveYear = (oven - best.cost) * meals! * 52;
    return {
      cheapestCost: best.cost,
      cheapest: best.name,
      oven,
      air,
      slow,
      saveYear,
      tone: 'ok',
      badge: `${best.name} is cheapest`,
      note: `Per meal: oven ${money(oven)}, air fryer ${money(air)}, slow cooker ${money(slow)}. ${best.name} is cheapest at ${money(best.cost)}. At ${fmt(meals!, 0)} meals a week that saves ${money(saveYear)} a year compared with the oven. Wattages are average-while-heating estimates, not measured values.`,
      chart: {
        type: 'bar',
        title: 'Electricity cost per meal',
        categories: ['Oven', 'Air fryer', 'Slow cooker'],
        series: [{ name: 'Per meal', values: [oven, air, slow] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Oven = ${fmt(ovenW!, 0)} W ÷ 1,000 × ${fmt(ovenMin! / 60)} h = ${fmt(ovenKwh, 3)} kWh × ${money(price!)} = ${money(oven)}`,
        `Air fryer = ${fmt(airW!, 0)} W ÷ 1,000 × ${fmt(airMin! / 60, 3)} h = ${fmt(airKwh, 3)} kWh × ${money(price!)} = ${money(air)}`,
        `Slow cooker = ${fmt(slowW!, 0)} W ÷ 1,000 × ${fmt(slowHr!)} h = ${fmt(slowKwh, 3)} kWh × ${money(price!)} = ${money(slow)}`,
        `Saving per year = (${money(oven)} − ${money(best.cost)}) × ${fmt(meals!, 0)} × 52 = ${money(saveYear)}`,
      ],
    };
  },
  content: {
    formula: [
      'kWh = watts ÷ 1,000 × hours',
      'Cost per meal = kWh × price per kWh',
      'Saving per year = (oven cost − cheapest cost) × meals per week × 52',
    ],
    body: [
      'Appliances differ in two things: how much power they draw and how long they run. A big oven draws a lot for a long time. An air fryer draws less and finishes sooner. A slow cooker draws very little but runs for hours.',
      'Enter your own wattage and time for each one. Wattage is the average while heating, an estimate, because ovens and slow cookers cycle on and off to hold temperature. Check the label or data plate and your electric bill for the price.',
      'Example with the defaults: the oven at 2,400 W for 60 minutes is 2.4 kWh, or $0.38 at $0.16 per kWh. The air fryer at 1,500 W for 25 minutes is 0.625 kWh, or $0.10. The slow cooker at 200 W for 8 hours is 1.6 kWh, or $0.26. Three meals a week with the air fryer instead of the oven saves about $44.30 a year.',
      'This counts electricity only. Food quality, batch size and how much you can cook at once matter too, and a full oven can feed more people than a small air fryer basket. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is an air fryer cheaper than an oven?', a: 'With the default estimates, yes. The air fryer uses 0.625 kWh, or $0.10 at $0.16 per kWh, against 2.4 kWh, or $0.38, for the oven. Your wattages and times change this.' },
      { q: 'How much does a slow cooker cost to run for 8 hours?', a: 'At the default 200 W it uses 1.6 kWh, which is $0.26 at $0.16 per kWh. It is cheaper than the oven but dearer than the air fryer here, because it runs so long.' },
      { q: 'How much could I save per year?', a: 'Cooking 3 meals a week in the air fryer instead of the oven saves $0.28 per meal, or about $44.30 a year, using the defaults. The slow cooker saves $0.13 per meal, or about $19.97 a year.' },
      { q: 'How do I find my appliance wattage?', a: 'Look on the label or data plate, or the manual. Treat it as the average draw while heating; thermostat cycling means the real average can be lower.' },
      { q: 'Does this include gas ovens?', a: 'No. It treats all three as electric. For gas, see the oven cost calculator.' },
    ],
    sources: [],
  },
  related: ['oven-cost', 'electricity-cost', 'laundry-cost', 'energy-upgrade-payback'],
  examples: [
    // oven 2.4*1=2.4kWh*.16=0.384; air 1.5*25/60=0.625*.16=0.10; slow .2*8=1.6*.16=0.256
    // save (0.384-0.10)*3*52 = 0.284*156 = 44.304
    { values: { ovenW: 2400, ovenMin: 60, airW: 1500, airMin: 25, slowW: 200, slowHr: 8, price: 0.16, meals: 3 }, expect: { cheapestCost: 0.1, oven: 0.384, air: 0.1, slow: 0.256, saveYear: 44.304 }, tolerance: 0.01 },
    // oven 2*0.5=1kWh*.25=0.25; air 1*0.5=0.5*.25=0.125; slow 0.1*4=0.4*.25=0.10 (cheapest); save (0.25-0.10)*2*52=15.60
    { values: { ovenW: 2000, ovenMin: 30, airW: 1000, airMin: 30, slowW: 100, slowHr: 4, price: 0.25, meals: 2 }, expect: { cheapestCost: 0.1, oven: 0.25, air: 0.125, slow: 0.1, saveYear: 15.6 }, tolerance: 0.01 },
  ],
});

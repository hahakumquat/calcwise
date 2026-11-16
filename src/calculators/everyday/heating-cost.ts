import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const BTU_PER_KWH = 3412;
const BTU_PER_THERM = 100000;

export default defineCalculator({
  slug: 'heating-cost',
  title: 'Space Heater vs Furnace Cost',
  category: 'everyday',
  description: 'Compare what a space heater costs to run with a gas furnace delivering the same heat, from watts, hours, electricity and gas prices.',
  keywords: ['space heater cost', 'electric heater vs gas furnace', 'heating cost calculator', 'cost per therm', 'AFUE', 'heater electricity cost'],
  inputs: [
    { id: 'watts', label: 'Heater power', type: 'number', suffix: 'W', default: 1500, min: 0, info: 'Rated wattage on the heater label. Most portable electric heaters are 1,500 W on high.' },
    { id: 'hours', label: 'Hours per day', type: 'number', suffix: 'h/day', default: 8, min: 0, max: 24, info: 'Average hours the heater runs at full power each day. A thermostat-controlled heater cycles off, so use its real running time.' },
    { id: 'rate', label: 'Electricity rate', type: 'number', prefix: '$', suffix: '/kWh', default: 0.17, min: 0, step: 0.01, info: 'Your price per kilowatt-hour; the US average is around 16–18 cents.' },
    { id: 'gas', label: 'Gas price', type: 'number', prefix: '$', suffix: '/therm', default: 1.5, min: 0, step: 0.01, info: 'Price per therm (100,000 BTU) on your gas bill. Some bills show CCF instead; a CCF is roughly 1.03 therms.' },
    { id: 'afue', label: 'Furnace efficiency (AFUE)', type: 'number', default: 0.95, min: 0.5, max: 1, step: 0.01, info: 'Annual Fuel Utilization Efficiency as a decimal: about 0.80 for a standard furnace, 0.95 for a high-efficiency one. It is printed on the furnace label.' },
  ],
  outputs: [
    { id: 'electricDay', label: 'Space heater, per day', format: 'currency', primary: true, info: 'kWh used per day × your electricity price.' },
    { id: 'gasDay', label: 'Gas furnace, same heat, per day', format: 'currency', info: 'Cost of producing the same BTU with gas: BTU ÷ 100,000 ÷ AFUE × gas price.' },
    { id: 'ratio', label: 'Electric costs this many times more', precision: 1, suffix: '×', info: 'Space heater cost divided by gas furnace cost for the same heat.' },
    { id: 'extraMonth', label: 'Extra cost per month with electric', format: 'currency', info: 'Daily difference × 365 ÷ 12.' },
    { id: 'btu', label: 'Heat delivered per day', precision: 0, suffix: 'BTU', info: 'kWh × 3,412 BTU. Electric resistance heaters turn all their power into heat.' },
  ],
  compute: (v) => {
    const w = num(v.watts);
    const h = num(v.hours);
    const rate = num(v.rate);
    const gas = num(v.gas);
    const afue = num(v.afue);
    if (w === null || h === null || rate === null || gas === null || afue === null) return { electricDay: null };
    if (w < 0 || h < 0 || h > 24 || rate < 0 || gas < 0 || afue < 0.5 || afue > 1) return { electricDay: null };
    const kwh = (w / 1000) * h;
    const btu = kwh * BTU_PER_KWH;
    const electricDay = kwh * rate;
    const therms = btu / BTU_PER_THERM / afue;
    const gasDay = therms * gas;
    const ratio = gasDay > 0 ? electricDay / gasDay : null;
    const mo = 365 / 12;
    return {
      tone: ratio === null ? 'ok' : ratio >= 3 ? 'bad' : ratio >= 1.5 ? 'warn' : 'good',
      badge: ratio === null ? 'No gas cost to compare' : ratio >= 1 ? `Electric costs ${ratio.toFixed(1)}× more than gas` : `Electric costs less than gas`,
      electricDay,
      gasDay,
      ratio,
      extraMonth: (electricDay - gasDay) * mo,
      btu,
      chart: {
        type: 'bar',
        title: 'Cost for the same heat',
        categories: ['Per day', 'Per month'],
        series: [
          { name: 'Space heater', values: [electricDay, electricDay * mo] },
          { name: 'Gas furnace', values: [gasDay, gasDay * mo] },
        ],
        format: { format: 'currency' },
      },
      steps: [
        `Energy = ${w / 1000} kW × ${h} h = ${kwh.toFixed(2)} kWh/day = ${Math.round(btu).toLocaleString('en-US')} BTU`,
        `Electric cost = ${kwh.toFixed(2)} kWh × $${rate} = $${electricDay.toFixed(2)}`,
        `Gas = ${Math.round(btu).toLocaleString('en-US')} ÷ 100,000 ÷ ${afue} = ${therms.toFixed(3)} therms × $${gas} = $${gasDay.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: ['Electric heat (BTU) = kWh × 3,412', 'Electric cost = kWh × price per kWh', 'Gas cost for the same heat = (BTU ÷ 100,000) ÷ AFUE × price per therm'],
    body: [
      'Both an electric space heater and a gas furnace turn fuel into heat, so you can compare them by the cost of delivering the same number of BTU. A resistance heater converts essentially all of its electricity into heat (1 kWh = 3,412 BTU). A furnace burns gas, and its AFUE rating says what share of the fuel ends up as heat: a 95% furnace wastes about 5%.',
      'With prices of $0.17 per kWh and $1.50 per therm, a 1,500 W heater running 8 hours (12 kWh, 40,944 BTU) costs about $2.04 a day. A 95% furnace makes the same heat for about $0.65, so electric is roughly 3.2 times more expensive. Your ratio depends on your local prices, so enter your own.',
      'This does not mean a space heater is a bad idea. It only saves money if it lets you lower the thermostat for the whole house and heat just the room you are in. Run it in a room the furnace is already heating and you pay for the heat twice. A heat pump, which delivers 2–3 times more heat per kWh, is a different comparison and is not modelled here.',
    ],
    faq: [
      { q: 'Is a space heater cheaper than a furnace?', a: 'Per unit of heat, usually not: at $0.17/kWh and $1.50/therm with a 95% furnace, the heater costs about 3.2 times as much. It can still cut your bill if you lower the thermostat and heat only one occupied room.' },
      { q: 'How much does a 1,500 W space heater cost per day?', a: 'Running 8 hours it uses 12 kWh, which is $2.04 a day at $0.17/kWh, or about $62 a month. A thermostat-controlled heater that cycles off costs less.' },
      { q: 'How many BTU is a kWh?', a: 'One kilowatt-hour equals 3,412 BTU. A 1,500 W heater therefore gives off about 5,118 BTU per hour.' },
      { q: 'What is AFUE?', a: 'Annual Fuel Utilization Efficiency: the share of fuel energy a furnace turns into heat. At 0.95, the gas for 40,944 BTU is 40,944 ÷ 100,000 ÷ 0.95 = 0.431 therms, or $0.65 at $1.50 per therm.' },
    ],
    sources: [
      { label: 'US DOE Energy Saver: Estimating appliance and home electronic energy use', url: 'https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use' },
      { label: 'US DOE Energy Saver: Furnaces and boilers (AFUE)', url: 'https://www.energy.gov/energysaver/furnaces-and-boilers' },
      { label: 'US EIA: Units and calculators explained (BTU, therm, kWh)', url: 'https://www.eia.gov/energyexplained/units-and-calculators/' },
    ],
  },
  related: ['electricity-cost', 'gas-cost', 'energy-converter'],
  examples: [
    // 1.5 kW x 8 h = 12 kWh; x 3412 = 40,944 BTU; 12 x 0.17 = $2.04.
    // Gas: 40,944 / 100,000 / 0.95 = 0.430989 therms x 1.5 = 0.646484; ratio 2.04 / 0.646484 = 3.1556.
    // Extra per month: (2.04 - 0.646484) x 365/12 = 42.3862.
    { values: { watts: 1500, hours: 8, rate: 0.17, gas: 1.5, afue: 0.95 }, tolerance: 1e-4, expect: { btu: 40944, electricDay: 2.04, gasDay: 0.646484, ratio: 3.1556, extraMonth: 42.3862 } },
    // 1 kW x 10 h = 10 kWh = 34,120 BTU; $2.00. Gas: 0.3412 / 0.8 = 0.4265 therms x 2 = $0.853; ratio 2.3447.
    { values: { watts: 1000, hours: 10, rate: 0.2, gas: 2, afue: 0.8 }, tolerance: 1e-4, expect: { btu: 34120, electricDay: 2, gasDay: 0.853, ratio: 2.3447 } },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Approximate energy content, BTU per unit (editable assumptions, shown to the user).
const BTU_KWH = 3412;
const BTU_THERM = 100000;
const BTU_PROPANE_GAL = 91500;
const BTU_OIL_GAL = 138500;

export default defineCalculator({
  slug: 'heating-fuel-cost',
  title: 'Heating Fuel Cost Comparison',
  category: 'everyday',
  description: 'Compare electricity, natural gas, propane and heating oil on one scale: dollars per million BTU of heat delivered, plus your yearly heating bill.',
  keywords: ['heating fuel cost comparison', 'cost per million btu', 'electric vs gas vs propane vs oil heating', 'cheapest way to heat a home', 'heat pump vs furnace cost', 'propane vs heating oil cost'],
  updated: '2026-11-24',
  inputs: [
    { id: 'elec', label: 'Electricity price', type: 'number', prefix: '$', suffix: '/kWh', default: 0.17, min: 0, step: 0.01, info: 'From your bill.' },
    { id: 'cop', label: 'Electric heating efficiency (COP)', type: 'number', default: 1, min: 0.5, max: 6, step: 0.1, info: '1 for resistance heat such as baseboard or a space heater. A heat pump delivers more heat than the electricity it uses; enter its seasonal COP (for example 3).' },
    { id: 'gas', label: 'Natural gas price', type: 'number', prefix: '$', suffix: '/therm', default: 1.5, min: 0, step: 0.01, info: 'Per therm (100,000 BTU). If your bill shows CCF, a CCF is roughly 1.03 therms.' },
    { id: 'gasEff', label: 'Gas furnace efficiency', type: 'number', suffix: '%', default: 95, min: 50, max: 100, step: 1, info: 'AFUE on the furnace label.' },
    { id: 'propane', label: 'Propane price', type: 'number', prefix: '$', suffix: '/gal', default: 3, min: 0, step: 0.01, info: 'Per US gallon.' },
    { id: 'propaneEff', label: 'Propane furnace efficiency', type: 'number', suffix: '%', default: 90, min: 50, max: 100, step: 1, info: 'AFUE on the furnace label.' },
    { id: 'oil', label: 'Heating oil price', type: 'number', prefix: '$', suffix: '/gal', default: 4, min: 0, step: 0.01, info: 'Per US gallon.' },
    { id: 'oilEff', label: 'Oil furnace efficiency', type: 'number', suffix: '%', default: 85, min: 50, max: 100, step: 1, info: 'AFUE on the furnace or boiler label.' },
    { id: 'need', label: 'Heat your home needs per year', type: 'number', suffix: 'MMBtu', default: 60, min: 0, step: 1, info: 'Million BTU of heat delivered in a year. 60 is only an example; estimate from past fuel use × efficiency.' },
  ],
  outputs: [
    { id: 'cheapest', label: 'Cheapest fuel, per million BTU', format: 'currency', primary: true, info: 'The lowest of the four costs below.' },
    { id: 'electric', label: 'Electricity, per million BTU', format: 'currency', info: 'Price ÷ (3,412 × COP) × 1,000,000.' },
    { id: 'natgas', label: 'Natural gas, per million BTU', format: 'currency', info: 'Price ÷ (100,000 × efficiency) × 1,000,000.' },
    { id: 'prop', label: 'Propane, per million BTU', format: 'currency', info: 'Price ÷ (91,500 × efficiency) × 1,000,000.' },
    { id: 'heatingOil', label: 'Heating oil, per million BTU', format: 'currency', info: 'Price ÷ (138,500 × efficiency) × 1,000,000.' },
    { id: 'yearlyCheapest', label: 'Yearly bill, cheapest fuel', format: 'currency', info: 'Cheapest cost per MMBtu × heat needed.' },
  ],
  compute: (v) => {
    const elec = num(v.elec), cop = num(v.cop), gas = num(v.gas), gasEff = num(v.gasEff), propane = num(v.propane), propaneEff = num(v.propaneEff), oil = num(v.oil), oilEff = num(v.oilEff), need = num(v.need);
    const all = [elec, cop, gas, gasEff, propane, propaneEff, oil, oilEff, need];
    if (all.some((x) => x === null)) return { cheapest: null };
    if (all.some((x) => (x as number) < 0)) return { cheapest: null, error: 'Values cannot be negative.' };
    if ((cop as number) < 0.5 || [gasEff, propaneEff, oilEff].some((e) => (e as number) < 50 || (e as number) > 100)) {
      return { cheapest: null, error: 'Efficiency should be 50–100% (COP 0.5 or more).' };
    }
    const electric = ((elec as number) / (BTU_KWH * (cop as number))) * 1e6;
    const natgas = ((gas as number) / (BTU_THERM * ((gasEff as number) / 100))) * 1e6;
    const prop = ((propane as number) / (BTU_PROPANE_GAL * ((propaneEff as number) / 100))) * 1e6;
    const heatingOil = ((oil as number) / (BTU_OIL_GAL * ((oilEff as number) / 100))) * 1e6;
    const cheapest = Math.min(electric, natgas, prop, heatingOil);
    const yearlyCheapest = cheapest * (need as number);
    const names = ['Electricity', 'Natural gas', 'Propane', 'Heating oil'];
    const costs = [electric, natgas, prop, heatingOil];
    return {
      cheapest, electric, natgas, prop, heatingOil, yearlyCheapest,
      tone: 'ok',
      badge: `${names[costs.indexOf(cheapest)]} is cheapest on these prices`,
      chart: {
        type: 'bar',
        title: 'Cost per million BTU of heat',
        categories: names,
        series: [{ name: 'Cost', values: costs }],
        format: { format: 'currency' },
      },
      steps: [
        `Electricity: ${usd(elec as number)} ÷ (${BTU_KWH} × ${cop}) × 1,000,000 = ${usd(electric)}`,
        `Natural gas: ${usd(gas as number)} ÷ (${BTU_THERM.toLocaleString('en-US')} × ${gasEff}%) × 1,000,000 = ${usd(natgas)}`,
        `Propane: ${usd(propane as number)} ÷ (${BTU_PROPANE_GAL.toLocaleString('en-US')} × ${propaneEff}%) × 1,000,000 = ${usd(prop)}`,
        `Heating oil: ${usd(oil as number)} ÷ (${BTU_OIL_GAL.toLocaleString('en-US')} × ${oilEff}%) × 1,000,000 = ${usd(heatingOil)}`,
      ],
      note: 'Fuel prices and efficiencies are yours; energy contents are standard approximations. Equipment cost and your local rates are not included.',
    };
  },
  content: {
    formula: [
      'Cost per million BTU = price ÷ (BTU per unit × efficiency) × 1,000,000',
      'BTU per unit: electricity 3,412 per kWh (times COP), natural gas 100,000 per therm, propane about 91,500 per gallon, heating oil about 138,500 per gallon',
      'Yearly bill = cost per million BTU × million BTU of heat needed',
    ],
    body: [
      'Electricity is sold by the kilowatt-hour, gas by the therm, propane and oil by the gallon, so their prices cannot be compared directly. Converting each to dollars per million BTU of delivered heat puts them on one scale.',
      'Efficiency matters as much as price. A 95% gas furnace delivers 95% of the fuel energy as heat; a heat pump with a COP of 3 delivers three times the energy it uses.',
      'It compares running cost only. It does not include equipment, installation, delivery fees or taxes, and the energy contents are approximations.',
    ],
    faq: [
      { q: 'What are the results in the example?', a: 'Electricity at $0.17/kWh with COP 1 is $49.82 per million BTU. Gas at $1.50/therm and 95% is $15.79, propane at $3.00 and 90% is $36.43, and oil at $4.00 and 85% is $33.98. Gas is cheapest, so 60 MMBtu costs $947.37 a year.' },
      { q: 'How do I include a heat pump?', a: 'Set the electric heating efficiency (COP) to your heat pump’s seasonal figure. At COP 3 electricity in the example costs $16.61 per million BTU.' },
      { q: 'What is a million BTU?', a: 'A unit of heat. One kWh is 3,412 BTU and one therm of gas is 100,000 BTU, so a million BTU is about 293 kWh or 10 therms.' },
      { q: 'Are the BTU values exact?', a: 'They are standard approximations and vary a little by fuel grade. Electricity and gas are fixed by definition; propane and oil are rounded.' },
    ],
    sources: [],
  },
  related: ['heating-cost', 'fuel-tank-runtime', 'thermostat-setback'],
  examples: [
    // elec .17/3412*1e6=49.8241; gas 1.5/95000*1e6=15.7895; prop 3/82350*1e6=36.4299; oil 4/117725*1e6=33.9775; yearly 15.7895*60=947.368
    { values: { elec: 0.17, cop: 1, gas: 1.5, gasEff: 95, propane: 3, propaneEff: 90, oil: 4, oilEff: 85, need: 60 }, expect: { electric: 49.8241, natgas: 15.7895, prop: 36.4299, heatingOil: 33.9775, cheapest: 15.7895, yearlyCheapest: 947.368 }, tolerance: 0.01 },
    // COP 3: .17/10236*1e6 = 16.6080 -> cheapest 15.7895 still gas; set gas high so HP wins
    { values: { elec: 0.17, cop: 3, gas: 2, gasEff: 95, propane: 3, propaneEff: 90, oil: 4, oilEff: 85, need: 10 }, expect: { electric: 16.608, natgas: 21.0526, cheapest: 16.608, yearlyCheapest: 166.08 }, tolerance: 0.01 },
  ],
});

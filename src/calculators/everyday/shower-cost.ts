import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'shower-cost',
  title: 'Shower Cost Calculator',
  category: 'everyday',
  description: 'Find what each shower costs in water and water heating, and what your showers add up to per year. Enter flow rate, minutes and your utility prices.',
  keywords: ['shower cost calculator', 'how much does a shower cost', 'cost of a hot shower', 'water heating cost', 'shower water usage', 'cost of long showers'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'gpm', label: 'Showerhead flow', type: 'number', default: 2.1, min: 0, step: 0.1, suffix: 'gal/min', info: 'Often printed on the showerhead. Many are 1.5 to 2.5.' },
    { id: 'minutes', label: 'Minutes per shower', type: 'number', default: 8, min: 0, step: 1, suffix: 'min', info: 'Time with the water running.' },
    { id: 'perWeek', label: 'Showers per week', type: 'number', default: 7, min: 0, step: 1, info: 'All showers in the household, counted together.' },
    { id: 'coldF', label: 'Incoming water temperature', type: 'number', default: 55, step: 1, suffix: '°F', info: 'Cold supply temperature. Often 40 to 70 °F depending on season.' },
    { id: 'hotF', label: 'Heater output temperature', type: 'number', default: 115, step: 1, suffix: '°F', info: 'Temperature the water is heated to.' },
    { id: 'eff', label: 'Heater efficiency', type: 'number', default: 100, min: 1, max: 100, step: 1, suffix: '%', info: 'About 100 for electric resistance. Gas heaters are lower, check the label.' },
    { id: 'energy', label: 'Energy price', type: 'number', prefix: '$', default: 0.16, min: 0, step: 0.01, suffix: 'per kWh', info: 'For gas, convert: 1 therm = 29.3 kWh, so divide the price per therm by 29.3.' },
    { id: 'water', label: 'Water and sewer price', type: 'number', prefix: '$', default: 6, min: 0, step: 0.1, suffix: 'per 1,000 gal', info: 'On your water bill. Combined water and sewer if billed.' },
  ],
  outputs: [
    { id: 'perShower', label: 'Cost per shower', format: 'currency', precision: 2, primary: true, info: 'Heating plus water for one shower.' },
    { id: 'perYear', label: 'Cost per year', format: 'currency', precision: 2, info: 'Cost per shower × showers per week × 52.' },
    { id: 'gallons', label: 'Water per shower', format: 'number', precision: 1, suffix: 'gal', info: 'Flow × minutes.' },
    { id: 'kwh', label: 'Heating energy per shower', format: 'number', precision: 2, suffix: 'kWh', info: 'Gallons × 8.34 × temperature rise ÷ 3,412 ÷ efficiency.' },
  ],
  compute: (v) => {
    const gpm = num(v.gpm), minutes = num(v.minutes), perWeek = num(v.perWeek);
    const coldF = num(v.coldF), hotF = num(v.hotF), eff = num(v.eff);
    const energy = num(v.energy), water = num(v.water);
    if ([gpm, minutes, perWeek, coldF, hotF, eff, energy, water].some((x) => x === null)) return { perShower: null };
    if (gpm! < 0 || minutes! < 0 || perWeek! < 0 || energy! < 0 || water! < 0) return { perShower: null };
    if (eff! <= 0 || eff! > 100) return { perShower: null, error: 'Heater efficiency must be between 1 and 100%.' };
    const rise = Math.max(0, hotF! - coldF!);
    const gallons = gpm! * minutes!;
    const kwh = (gallons * 8.34 * rise) / 3412 / (eff! / 100);
    const heat = kwh * energy!;
    const waterCost = (gallons / 1000) * water!;
    const perShower = heat + waterCost;
    const showers = perWeek! * 52;
    const perYear = perShower * showers;
    return {
      perShower,
      perYear,
      gallons,
      kwh,
      tone: 'ok',
      badge: `${money(perYear)} a year`,
      note: `Each ${fmt(minutes!, 0)}-minute shower uses ${fmt(gallons, 1)} gallons and ${fmt(kwh)} kWh of heat. That is ${money(heat)} for heating plus ${money(waterCost)} for water, ${money(perShower)} a shower and ${money(perYear)} over ${fmt(showers, 0)} showers a year.`,
      chart: {
        type: 'bar',
        title: 'Yearly cost by shower length',
        categories: ['5 min', '8 min', '10 min', '15 min'],
        series: [{
          name: 'Per year',
          values: [5, 8, 10, 15].map((m) => {
            const g = gpm! * m;
            return (((g * 8.34 * rise) / 3412 / (eff! / 100)) * energy! + (g / 1000) * water!) * showers;
          }),
        }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Gallons = ${fmt(gpm!)} × ${fmt(minutes!, 0)} = ${fmt(gallons, 1)}`,
        `Heat = ${fmt(gallons, 1)} × 8.34 × ${fmt(rise, 0)} ÷ 3,412 ÷ ${fmt(eff! / 100)} = ${fmt(kwh)} kWh`,
        `Per shower = ${fmt(kwh)} × ${money(energy!)} + ${fmt(gallons, 1)} ÷ 1,000 × ${money(water!)} = ${money(perShower)}`,
        `Per year = ${money(perShower)} × ${fmt(perWeek!, 0)} × 52 = ${money(perYear)}`,
      ],
    };
  },
  content: {
    formula: [
      'Gallons = flow (gal/min) × minutes',
      'kWh to heat = gallons × 8.34 lb per gallon × temperature rise (°F) ÷ 3,412 BTU per kWh ÷ efficiency',
      'Cost per shower = kWh × energy price + gallons ÷ 1,000 × water and sewer price',
      'Cost per year = cost per shower × showers per week × 52',
    ],
    body: [
      'A shower costs two things: the water itself and the energy to heat it. Heating is usually the bigger part. One gallon of water weighs 8.34 pounds, and each pound needs 1 BTU to rise 1 °F, so heating is weight × temperature rise, converted to kWh at 3,412 BTU per kWh.',
      'Example: a 2.1 gal/min showerhead for 8 minutes uses 16.8 gallons. Heating from 55 °F to 115 °F in an electric heater at $0.16 per kWh takes 16.8 × 8.34 × 60 ÷ 3,412 = 2.46 kWh, or $0.39. Water at $6 per 1,000 gallons adds $0.10, so a shower is about $0.50. Seven a week, 364 a year, comes to $180.19.',
      'This ignores heater standby losses and pipe heat loss, so real costs run a little higher. The temperature rise is the difference between supply and heater setting, not the temperature at the tap. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does a shower cost?', a: 'With the default numbers, about $0.50: 16.8 gallons of water and 2.46 kWh of electric heating for an 8-minute shower. Your prices and flow rate change this.' },
      { q: 'How much does a year of showers cost?', a: 'At one shower a day in the example, 364 showers cost $180.19 a year. Cutting each shower from 8 to 5 minutes would save about 37.5% of that.' },
      { q: 'How do I use a gas water heater?', a: 'Enter its efficiency, often 60 to 80%, and convert your gas price to dollars per kWh by dividing the price per therm by 29.3.' },
      { q: 'Does a low-flow showerhead save money?', a: 'Yes. Cost scales with flow rate, so a 1.5 gal/min head costs about 29% less than a 2.1 gal/min head at the same time and temperature.' },
    ],
    sources: [],
  },
  related: ['energy-upgrade-payback', 'electricity-cost', 'heating-cost', 'gas-cost'],
  examples: [
    // gal 16.8; kWh 16.8*8.34*60/3412 = 2.463775; heat 0.394204; water 0.1008; per 0.495004; year *364 = 180.1815
    { values: { gpm: 2.1, minutes: 8, perWeek: 7, coldF: 55, hotF: 115, eff: 100, energy: 0.16, water: 6 }, expect: { gallons: 16.8, kwh: 2.4638, perShower: 0.495, perYear: 180.18 }, tolerance: 0.01 },
    // gal 10; kWh 10*8.34*50/3412 = 1.222157 /0.5 = 2.444314; heat 0.2*... price 0.1 -> 0.244431; water 0.05; per 0.294431
    { values: { gpm: 2, minutes: 5, perWeek: 10, coldF: 60, hotF: 110, eff: 50, energy: 0.1, water: 5 }, expect: { gallons: 10, kwh: 2.4443, perShower: 0.2944, perYear: 153.1 }, tolerance: 0.01 },
  ],
});

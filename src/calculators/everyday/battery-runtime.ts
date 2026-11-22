import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'battery-runtime',
  title: 'Battery Runtime Calculator',
  category: 'everyday',
  description: 'Convert mAh to watt-hours, then see how long a power bank or battery runs a device and how many phone charges it gives, after conversion losses.',
  keywords: ['battery runtime calculator', 'mah to wh calculator', 'power bank how many charges', 'how long will a battery last', 'battery capacity watt hours', 'power bank runtime'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'mah', label: 'Battery capacity', type: 'number', default: 10000, min: 0, step: 100, suffix: 'mAh', info: 'Printed on the battery or power bank.' },
    { id: 'volts', label: 'Cell voltage', type: 'number', default: 3.7, min: 0, step: 0.1, suffix: 'V', info: 'Nominal voltage of the cells. 3.7 V is typical for Li-ion; check your battery.' },
    { id: 'watts', label: 'Device draw', type: 'number', default: 5, min: 0, step: 0.5, suffix: 'W', info: 'Power the device uses. Often on its label or charger.' },
    { id: 'eff', label: 'Conversion efficiency', type: 'number', default: 85, min: 0, max: 100, step: 1, suffix: '%', info: 'An assumption: power banks lose some energy as heat when converting voltage. Change it to match your gear.' },
    { id: 'phoneWh', label: 'Phone battery', type: 'number', default: 15, min: 0, step: 0.5, suffix: 'Wh', info: 'Your phone battery size in watt-hours (an example value).' },
  ],
  outputs: [
    { id: 'hours', label: 'Runtime', format: 'number', precision: 2, suffix: 'hours', primary: true, info: 'Usable Wh ÷ device watts.' },
    { id: 'usable', label: 'Usable energy', format: 'number', precision: 2, suffix: 'Wh', info: 'Battery Wh × efficiency.' },
    { id: 'wh', label: 'Battery energy', format: 'number', precision: 2, suffix: 'Wh', info: 'mAh × volts ÷ 1,000.' },
    { id: 'charges', label: 'Phone charges', format: 'number', precision: 2, info: 'Usable Wh ÷ phone Wh.' },
  ],
  compute: (v) => {
    const mah = num(v.mah), volts = num(v.volts), watts = num(v.watts), eff = num(v.eff), phoneWh = num(v.phoneWh);
    if ([mah, volts, watts, eff, phoneWh].some((x) => x === null)) return { hours: null };
    if (mah! <= 0 || volts! <= 0 || watts! <= 0 || phoneWh! <= 0 || eff! <= 0 || eff! > 100) return { hours: null };
    const wh = (mah! * volts!) / 1000;
    const usable = wh * (eff! / 100);
    const hours = usable / watts!;
    const charges = usable / phoneWh!;
    if (![wh, usable, hours, charges].every(Number.isFinite)) return { hours: null };
    return {
      hours,
      usable,
      wh,
      charges,
      tone: 'ok',
      badge: `${fmt(hours)} h runtime`,
      note: `${fmt(mah!, 0)} mAh at ${fmt(volts!)} V is ${fmt(wh)} Wh. At an assumed ${fmt(eff!, 0)}% efficiency, ${fmt(usable)} Wh is usable, enough to run a ${fmt(watts!)} W device for about ${fmt(hours)} hours or charge a ${fmt(phoneWh!)} Wh phone ${fmt(charges)} times. Real results vary with load, age and temperature.`,
      chart: {
        type: 'bar',
        title: 'Battery energy and what is usable',
        categories: ['Battery', 'Usable'],
        series: [{ name: 'Wh', values: [wh, usable] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Energy = ${fmt(mah!, 0)} × ${fmt(volts!)} ÷ 1,000 = ${fmt(wh)} Wh`,
        `Usable = ${fmt(wh)} × ${fmt(eff!, 0)}% = ${fmt(usable)} Wh`,
        `Runtime = ${fmt(usable)} ÷ ${fmt(watts!)} = ${fmt(hours)} hours`,
        `Phone charges = ${fmt(usable)} ÷ ${fmt(phoneWh!)} = ${fmt(charges)}`,
      ],
    };
  },
  content: {
    formula: [
      'Battery Wh = mAh × volts ÷ 1,000',
      'Usable Wh = battery Wh × efficiency',
      'Runtime (hours) = usable Wh ÷ device watts',
      'Phone charges = usable Wh ÷ phone battery Wh',
    ],
    body: [
      'Battery capacity in mAh does not say how much energy there is until you know the voltage. Multiplying mAh by volts and dividing by 1,000 gives watt-hours, which you can compare with a device’s power draw in watts.',
      'Power banks lose some energy as heat when they convert voltage, so the calculator applies an efficiency percentage. The 85% default is an assumption, not a measured figure for your battery. Change it if you know better.',
      'Example: 10,000 mAh at 3.7 V is 37 Wh. At 85% efficiency, 31.45 Wh is usable. A 5 W device runs for 6.29 hours, and a 15 Wh phone gets 2.10 charges.',
      'Real runtime also depends on how the draw changes, battery age and temperature, so treat the result as an estimate.',
      'Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I convert mAh to Wh?', a: 'Multiply mAh by volts and divide by 1,000. 10,000 mAh at 3.7 V is 37 Wh.' },
      { q: 'How long will a 10,000 mAh battery run a 5 W device?', a: 'With the defaults, 37 Wh × 85% is 31.45 Wh usable, and 31.45 ÷ 5 gives about 6.29 hours.' },
      { q: 'How many phone charges does a power bank give?', a: 'Usable Wh divided by the phone battery Wh. With 31.45 Wh usable and a 15 Wh phone, that is about 2.10 charges.' },
      { q: 'Why is efficiency less than 100%?', a: 'Converting the cell voltage to the output voltage wastes some energy as heat. The 85% default is an assumption you can change.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'fuel-tank-runtime', 'energy-upgrade-payback', 'holiday-lights'],
  examples: [
    // Wh 10000*3.7/1000 = 37; usable 37*0.85 = 31.45; hours 31.45/5 = 6.29; charges 31.45/15 = 2.0967
    { values: { mah: 10000, volts: 3.7, watts: 5, eff: 85, phoneWh: 15 }, expect: { wh: 37, usable: 31.45, hours: 6.29, charges: 2.1 }, tolerance: 0.01 },
    // Wh 20000*3.6/1000 = 72; usable 72*0.9 = 64.8; hours 64.8/10 = 6.48; charges 64.8/12 = 5.4
    { values: { mah: 20000, volts: 3.6, watts: 10, eff: 90, phoneWh: 12 }, expect: { wh: 72, usable: 64.8, hours: 6.48, charges: 5.4 }, tolerance: 0.01 },
  ],
});

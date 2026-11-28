import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Uncoated stranded copper at 75 C, ohm per 1,000 ft (NEC Chapter 9, Table 8).
const GAUGES: { id: string; label: string; ohm: number }[] = [
  { id: '18', label: '18 AWG', ohm: 7.77 },
  { id: '16', label: '16 AWG', ohm: 4.89 },
  { id: '14', label: '14 AWG', ohm: 3.07 },
  { id: '12', label: '12 AWG', ohm: 1.93 },
  { id: '10', label: '10 AWG', ohm: 1.21 },
];

export default defineCalculator({
  slug: 'extension-cord-voltage-drop',
  title: 'Extension Cord Voltage Drop Calculator',
  category: 'everyday',
  description: 'See the voltage drop, volts at the device and heat in an extension cord from its gauge, length and load, plus the longest cord that stays under 3 percent.',
  keywords: ['extension cord voltage drop', 'extension cord gauge calculator', 'how long can an extension cord be', '14 gauge extension cord 50 ft', 'extension cord length vs gauge', 'voltage drop 16 awg cord'],
  updated: '2026-11-28',
  inputs: [
    { id: 'awg', label: 'Cord gauge', type: 'select', default: '14', options: GAUGES.map((g) => ({ value: g.id, label: g.label })), info: 'The AWG size printed on the cord jacket, such as 14/3. A smaller number means a thicker wire.' },
    { id: 'length', label: 'Cord length', type: 'number', suffix: 'ft', default: 50, min: 0, step: 5, info: 'Length of the cord in feet, plug to outlet end. If you chain cords, add their lengths.' },
    { id: 'mode', label: 'Enter the load as', type: 'select', default: 'watts', options: [{ value: 'watts', label: 'Watts' }, { value: 'amps', label: 'Amps' }], info: 'Use watts if the label gives watts, or amps if it gives amps.' },
    { id: 'watts', label: 'Load', type: 'number', suffix: 'W', default: 1500, min: 0, step: 50, showWhen: { input: 'mode', is: 'watts' }, info: 'Power the device draws, from its nameplate.' },
    { id: 'amps', label: 'Load', type: 'number', suffix: 'A', default: 10, min: 0, step: 0.5, showWhen: { input: 'mode', is: 'amps' }, info: 'Current the device draws, from its nameplate.' },
    { id: 'volts', label: 'Supply voltage', type: 'number', suffix: 'V', default: 120, min: 1, step: 1, info: 'Outlet voltage. Most US outlets are about 120 V.' },
  ],
  outputs: [
    { id: 'pct', label: 'Voltage drop', format: 'number', precision: 2, suffix: '%', primary: true, info: 'Volts lost in the cord divided by supply volts.' },
    { id: 'drop', label: 'Volts lost in the cord', format: 'number', precision: 2, suffix: 'V', info: 'Amps × cord resistance (out and back).' },
    { id: 'atDevice', label: 'Volts at the device', format: 'number', precision: 1, suffix: 'V', info: 'Supply voltage minus the drop.' },
    { id: 'heat', label: 'Heat in the cord', format: 'number', precision: 1, suffix: 'W', info: 'Amps² × cord resistance. This power warms the cord.' },
    { id: 'current', label: 'Current', format: 'number', precision: 2, suffix: 'A', info: 'Watts ÷ volts, or the amps you entered.' },
    { id: 'maxLen', label: 'Longest cord at 3% drop', format: 'number', precision: 1, suffix: 'ft', info: '0.03 × volts ÷ (amps × ohm per 1,000 ft × 2 ÷ 1,000), for the chosen gauge.' },
  ],
  compute: (v) => {
    const L = num(v.length), V = num(v.volts);
    const g = GAUGES.find((x) => x.id === String(v.awg));
    const byAmps = String(v.mode) === 'amps';
    const raw = byAmps ? num(v.amps) : num(v.watts);
    if (L === null || V === null || raw === null) return { pct: null };
    if (L < 0 || raw < 0) return { pct: null, error: 'Length and load cannot be negative.' };
    if (V <= 0) return { pct: null, error: 'Supply voltage must be above 0.' };
    if (!g) return { pct: null };
    const I = byAmps ? raw : raw / V;
    const rFor = (ohm: number) => (ohm * 2 * L) / 1000;
    const R = rFor(g.ohm);
    const drop = I * R;
    const pct = (drop / V) * 100;
    const heat = I * I * R;
    const perFt = (I * g.ohm * 2) / 1000;
    const maxLen = perFt > 0 ? (0.03 * V) / perFt : null;
    const r2 = (n: number) => +n.toFixed(2);
    const pctFor = (ohm: number) => ((I * rFor(ohm)) / V) * 100;
    const tone = pct <= 3 ? 'good' : pct <= 5 ? 'warn' : 'bad';
    return {
      pct, drop, atDevice: V - drop, heat, current: I, maxLen,
      chart: {
        type: 'bar',
        title: 'Voltage drop by cord gauge (%)',
        categories: GAUGES.map((x) => x.label.replace(' AWG', '')),
        series: [{ name: 'Drop %', values: GAUGES.map((x) => r2(pctFor(x.ohm))) }],
        format: { format: 'number', suffix: '%' },
        highlight: GAUGES.indexOf(g),
      },
      tone,
      badge: pct <= 3 ? 'Fine' : pct <= 5 ? 'Marginal' : 'Too long or thin',
      note: I > 15
        ? 'This load is above 15 A, the limit of a typical 15 A breaker and most household cords. Check the cord label rating. This calculator does not compute cord ampacity. Space heaters belong straight in the wall outlet.'
        : 'This calculator does not compute cord ampacity. Check the rating on the cord label, because a thin cord can overheat well before the voltage drop looks bad. Space heaters belong straight in the wall outlet.',
      steps: [
        `Current = ${byAmps ? `${r2(I)} A (entered)` : `${raw} W ÷ ${V} V = ${r2(I)} A`}`,
        `Cord resistance = ${g.ohm} Ω per 1,000 ft × 2 × ${L} ft ÷ 1,000 = ${+R.toFixed(3)} Ω`,
        `Drop = ${r2(I)} A × ${+R.toFixed(3)} Ω = ${r2(drop)} V (${r2(pct)}%)`,
        `Volts at the device = ${V} − ${r2(drop)} = ${r2(V - drop)} V; heat in the cord = ${r2(heat)} W`,
      ],
    };
  },
  content: {
    formula: [
      'Current = watts ÷ volts (or enter amps directly)',
      'Cord resistance = ohms per 1,000 ft × 2 × length ÷ 1,000 (the 2 covers the trip out and back)',
      'Voltage drop = amps × resistance; percent drop = drop ÷ supply volts × 100',
      'Heat in the cord = amps² × resistance',
      'Longest cord at 3% = 0.03 × volts ÷ (amps × ohms per 1,000 ft × 2 ÷ 1,000)',
      'Ohms per 1,000 ft (copper): 18 AWG 7.77; 16 AWG 4.89; 14 AWG 3.07; 12 AWG 1.93; 10 AWG 1.21',
    ],
    body: [
      'An extension cord is a long, thin wire, and wire resists current. The resistance eats some of the voltage on the way to your tool, so the device sees less than the outlet supplies. Thicker cords (a smaller AWG number) and shorter cords lose less. The energy lost turns into heat inside the cord.',
      'A common rule of thumb is to keep the drop to about 3 percent for one branch circuit and 5 percent in total. At 3 percent or less the result reads Fine, from 3 to 5 percent Marginal, and above 5 percent Too long or thin. Motors, compressors and saws are the most sensitive to low voltage.',
      'Assumptions: copper conductors at 75 C using the resistance values in NEC Chapter 9, Table 8 (uncoated stranded copper), a steady load, a single-phase supply, and a cord with its full length in use. Real cords run cooler than 75 C, so these values lean slightly cautious. Plug and connector resistance is ignored.',
      'Voltage drop is not the same as safety. A typical household circuit is limited to 15 A by its breaker, and this calculator does not work out how much current a cord can carry safely. Check the rating printed on the cord label, since a thin cord can overheat even when the drop looks small. Space heaters should plug straight into a wall outlet. Uncoil a cord fully when it carries a load.',
    ],
    faq: [
      { q: 'Is a 50 ft, 14 AWG cord fine for a 1,500 W load?', a: 'It is marginal. 1,500 W at 120 V is 12.5 A. The cord has 0.307 Ω, so it drops 3.84 V (3.20 percent), leaving 116.2 V at the device and about 48 W of heat in the cord. The longest 14 AWG cord at 3 percent for that load is about 46.9 ft.' },
      { q: 'What happens with a 100 ft, 16 AWG cord and a 10 A load?', a: 'It is too long and thin. The cord has 0.978 Ω, so it drops 9.78 V (8.15 percent), leaving 110.2 V at the device and about 98 W of heat. The longest 16 AWG cord at 3 percent for 10 A is about 36.8 ft.' },
      { q: 'What drop is acceptable?', a: 'About 3 percent or less is the usual rule of thumb for a branch circuit, and 5 percent in total. These are guidelines, not hard rules. Sensitive motors do better with less.' },
      { q: 'Does this check that the cord is safe for my load?', a: 'No. It only covers voltage drop. Check the amp or watt rating on the cord label, stay within a 15 A circuit, and do not run space heaters through an extension cord.' },
      { q: 'How do I reduce the drop?', a: 'Use a shorter cord, a thicker one (lower AWG number), or both. Dropping from 14 AWG to 12 AWG cuts the resistance from 3.07 to 1.93 ohms per 1,000 ft.' },
    ],
    sources: [{ label: 'NEC (NFPA 70) Chapter 9, Table 8: Conductor Properties (uncoated stranded copper, ohms per 1,000 ft)' }],
  },
  related: ['wire-voltage-drop', 'circuit-breaker-load', 'ohms-law', 'generator-size'],
  examples: [
    // 1500/120 = 12.5 A; R = 3.07*2*50/1000 = 0.307; drop = 3.8375 V = 3.19792 %; device 116.1625; heat = 156.25*0.307 = 47.96875 W
    // Lmax = 3.6 / (12.5*3.07*2/1000) = 3.6/0.07675 = 46.9055 ft
    { values: { awg: '14', length: 50, mode: 'watts', watts: 1500, volts: 120 }, expect: { current: 12.5, drop: 3.8375, pct: 3.19792, atDevice: 116.1625, heat: 47.96875, maxLen: 46.9055 }, tolerance: 1e-3 },
    // 10 A; R = 4.89*200/1000 = 0.978; drop = 9.78 V = 8.15 %; device 110.22; heat = 100*0.978 = 97.8 W; Lmax = 3.6/(10*0.00978) = 36.8098
    { values: { awg: '16', length: 100, mode: 'amps', amps: 10, volts: 120 }, expect: { drop: 9.78, pct: 8.15, atDevice: 110.22, heat: 97.8, maxLen: 36.8098 }, tolerance: 1e-3 },
  ],
});

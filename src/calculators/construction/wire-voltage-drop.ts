import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const GAUGES: { id: string; label: string; cm: number }[] = [
  { id: '14', label: '14 AWG', cm: 4110 },
  { id: '12', label: '12 AWG', cm: 6530 },
  { id: '10', label: '10 AWG', cm: 10380 },
  { id: '8', label: '8 AWG', cm: 16510 },
  { id: '6', label: '6 AWG', cm: 26240 },
  { id: '4', label: '4 AWG', cm: 41740 },
  { id: '3', label: '3 AWG', cm: 52620 },
  { id: '2', label: '2 AWG', cm: 66360 },
  { id: '1', label: '1 AWG', cm: 83690 },
  { id: '1/0', label: '1/0 AWG', cm: 105600 },
];
const K: Record<string, number> = { cu: 12.9, al: 21.2 };

export default defineCalculator({
  slug: 'wire-voltage-drop',
  title: 'Wire Voltage Drop Calculator by Gauge',
  category: 'construction',
  description: 'Find voltage drop and percent drop for a wire run from amps, one-way length, volts, AWG gauge and metal, plus the smallest gauge under 3 percent.',
  keywords: ['voltage drop calculator', 'wire size voltage drop', 'voltage drop 12 awg 100 ft', 'what wire gauge for long run', 'copper aluminum voltage drop', 'awg voltage drop chart'],
  updated: '2026-11-28',
  inputs: [
    { id: 'amps', label: 'Load current', type: 'number', suffix: 'A', default: 20, min: 0, step: 1, info: 'Amps the circuit will carry.' },
    { id: 'length', label: 'One-way run length', type: 'number', suffix: 'ft', default: 100, min: 0, step: 5, info: 'Distance from the panel to the load, one way, in feet. The formula doubles it for the round trip.' },
    { id: 'volts', label: 'System voltage', type: 'number', suffix: 'V', default: 120, min: 1, step: 1, info: 'Single-phase voltage, such as 120 or 240.' },
    { id: 'awg', label: 'Wire gauge', type: 'select', default: '12', options: GAUGES.map((g) => ({ value: g.id, label: g.label })), info: 'American Wire Gauge of the conductor. Smaller number means thicker wire.' },
    { id: 'mat', label: 'Material', type: 'select', default: 'cu', options: [{ value: 'cu', label: 'Copper' }, { value: 'al', label: 'Aluminum' }], info: 'Copper uses K = 12.9, aluminum K = 21.2 ohm-circular-mils per foot.' },
  ],
  outputs: [
    { id: 'pct', label: 'Voltage drop', format: 'number', precision: 2, suffix: '%', primary: true, info: 'Volts dropped divided by system volts.' },
    { id: 'drop', label: 'Volts dropped', format: 'number', precision: 2, suffix: 'V', info: '2 × K × amps × one-way length ÷ circular mils.' },
    { id: 'atLoad', label: 'Voltage at the load', format: 'number', precision: 1, suffix: 'V', info: 'System voltage minus the drop.' },
    { id: 'minGauge', label: 'Smallest gauge under 3%', format: 'text', info: 'Smallest listed gauge (14 to 1/0 AWG) with a drop of 3 percent or less for the same load, length, volts and material.' },
  ],
  compute: (v) => {
    const I = num(v.amps), L = num(v.length), V = num(v.volts);
    const g = GAUGES.find((x) => x.id === String(v.awg));
    const k = K[String(v.mat)];
    if (I === null || L === null || V === null) return { pct: null };
    if (I < 0 || L < 0) return { pct: null, error: 'Current and run length cannot be negative.' };
    if (V <= 0) return { pct: null, error: 'System voltage must be above 0.' };
    if (!g || !k) return { pct: null };
    const dropFor = (cm: number) => (2 * k * I * L) / cm;
    const drop = dropFor(g.cm);
    const pct = (drop / V) * 100;
    const ok = GAUGES.find((x) => (dropFor(x.cm) / V) * 100 <= 3);
    const minGauge = ok ? ok.label : 'None up to 1/0 AWG';
    const r2 = (n: number) => +n.toFixed(2);
    const matName = k === 12.9 ? 'copper' : 'aluminum';
    return {
      pct, drop, atLoad: V - drop, minGauge,
      chart: {
        type: 'bar',
        title: `Voltage drop by gauge (%, ${matName})`,
        categories: GAUGES.slice(0, 8).map((x) => x.label.replace(' AWG', '')),
        series: [{ name: 'Drop %', values: GAUGES.slice(0, 8).map((x) => r2((dropFor(x.cm) / V) * 100)) }],
        format: { format: 'number', suffix: '%' },
        highlight: Math.min(GAUGES.indexOf(g), 7),
      },
      tone: pct <= 3 ? 'good' : pct <= 5 ? 'warn' : 'bad',
      badge: pct <= 3 ? 'Within 3%' : pct <= 5 ? 'Over 3%' : 'Over 5%',
      note: 'The 3 percent (branch circuit) and 5 percent (total) figures are NEC informational recommendations, not requirements. Ampacity and breaker size are separate checks. A licensed electrician should confirm your wiring.',
      steps: [
        `Drop = 2 × ${k} × ${I} A × ${L} ft ÷ ${g.cm.toLocaleString('en-US')} cmil = ${r2(drop)} V`,
        `Percent = ${r2(drop)} ÷ ${V} V = ${r2(pct)}%`,
        `Voltage at load = ${V} − ${r2(drop)} = ${r2(V - drop)} V`,
        `Smallest gauge at or under 3%: ${minGauge}`,
      ],
    };
  },
  content: {
    formula: [
      'Voltage drop (single phase) = 2 × K × amps × one-way length ÷ circular mils',
      'K = 12.9 for copper, 21.2 for aluminum (ohm-circular-mils per foot)',
      'Percent drop = voltage drop ÷ system voltage × 100',
      'Circular mils: 14 AWG 4,110; 12 AWG 6,530; 10 AWG 10,380; 8 AWG 16,510; 6 AWG 26,240; 4 AWG 41,740; 3 AWG 52,620; 2 AWG 66,360; 1 AWG 83,690; 1/0 AWG 105,600',
    ],
    body: [
      'Wire has resistance, so a long run loses some voltage on the way to the load. The factor of 2 covers the current going out and coming back. Thicker wire (a smaller AWG number) has more circular mils and loses less. Aluminum loses more than copper at the same gauge.',
      'A common guideline is to keep the drop to about 3 percent on a branch circuit and 5 percent for feeder plus branch together. These are informational recommendations in the NEC, not hard requirements, and are quoted here from general knowledge. Excess drop can dim lights and stress motors.',
      'Voltage drop is only one check. Wire must also be rated for the current (ampacity) and protected by the right breaker, see the circuit breaker load calculator. This tool uses a single-phase, DC-style resistance estimate and ignores temperature and conduit effects. A licensed electrician should confirm any installation.',
    ],
    faq: [
      { q: 'What is the drop for 20 A over 100 ft of 12 AWG copper at 120 V?', a: '2 × 12.9 × 20 × 100 ÷ 6,530 = 7.90 V, which is 6.58 percent. That is well over 3 percent.' },
      { q: 'What about 10 AWG and 8 AWG?', a: '10 AWG drops 4.97 V (4.14 percent) and 8 AWG drops 3.13 V (2.60 percent).' },
      { q: 'Which gauge keeps that run under 3 percent?', a: '8 AWG copper is the smallest listed gauge under 3 percent for that load and length.' },
      { q: 'Is 3 percent a legal limit?', a: 'No. The 3 percent branch and 5 percent total figures are NEC informational recommendations. Check local rules and ask an electrician.' },
      { q: 'Does a thicker wire fix breaker sizing too?', a: 'No. Ampacity and breaker size are separate checks.' },
    ],
    sources: [{ label: 'NEC informational notes on voltage drop (NFPA 70), cited by name, not reviewed here' }],
  },
  related: ['ohms-law', 'generator-size', 'circuit-breaker-load'],
  examples: [
    // 2*12.9*20*100 = 51600; /6530 = 7.90199 V; /120 = 6.58499 %; at load 112.098; min gauge: 8 AWG (2.6045%) since 10 AWG is 4.14%
    { values: { amps: 20, length: 100, volts: 120, awg: '12', mat: 'cu' }, expect: { drop: 7.90199, pct: 6.58499, atLoad: 112.09801 }, tolerance: 1e-3 },
    // 10 AWG: 51600/10380 = 4.97110 V = 4.14258 %
    { values: { amps: 20, length: 100, volts: 120, awg: '10', mat: 'cu' }, expect: { drop: 4.9711, pct: 4.14258 }, tolerance: 1e-3 },
    // 8 AWG: 51600/16510 = 3.12538 V = 2.60448 %
    { values: { amps: 20, length: 100, volts: 120, awg: '8', mat: 'cu' }, expect: { drop: 3.12538, pct: 2.60448 }, tolerance: 1e-3 },
  ],
});

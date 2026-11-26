import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const r1 = (x: number) => Math.round(x * 10) / 10;
const toC = (x: number, si: boolean) => (si ? x : ((x - 32) * 5) / 9);
const fromC = (x: number, si: boolean) => (si ? x : (x * 9) / 5 + 32);

// Magnus formula, Alduchov and Eskridge (1996) constants. T in deg C, rh in percent (0-100].
const A = 17.625;
const B = 243.04;
const dewC = (t: number, rh: number) => {
  const g = Math.log(rh / 100) + (A * t) / (B + t);
  return (B * g) / (A - g);
};

export default defineCalculator({
  slug: 'dew-point',
  title: 'Dew Point Calculator',
  category: 'everyday',
  description: 'Find the dew point from air temperature and relative humidity in °F or °C, and check whether a cold window or wall will get condensation.',
  keywords: ['dew point calculator', 'window condensation calculator', 'dew point from humidity', 'dew point formula', 'condensation temperature'],
  inputs: [
    {
      id: 'unit', label: 'Units', type: 'select', default: 'us', segmented: true,
      options: [{ value: 'us', label: '°F' }, { value: 'si', label: '°C' }],
      info: 'Pick Fahrenheit or Celsius for every temperature on this page.',
    },
    { id: 'temp', label: 'Indoor air temperature', type: 'number', default: 68, step: 1, info: 'Air temperature in the room, in the units chosen above. The formula is tuned for about 0 to 60 °C (32 to 140 °F).' },
    { id: 'rh', label: 'Relative humidity', type: 'number', default: 50, min: 1, max: 100, step: 1, suffix: '%', info: 'Relative humidity from a hygrometer or weather report, between 1 and 100 percent.' },
    { id: 'surface', label: 'Window or wall surface temperature', type: 'number', optional: true, step: 1, placeholder: 'Optional', info: 'Optional. Temperature of the coldest surface, such as the inside of a window pane. Leave blank to skip the condensation check.' },
  ],
  outputs: [
    { id: 'dew', label: 'Dew point', precision: 1, primary: true, suffix: '°', info: 'Temperature at which the air is saturated and water starts to condense.' },
    { id: 'margin', label: 'Surface above dew point by', precision: 1, suffix: '°', info: 'Surface temperature minus dew point. Zero or below means condensation is expected.' },
  ],
  compute: (v) => {
    const si = v.unit === 'si';
    const t = num(v.temp);
    const rh = num(v.rh);
    const s = num(v.surface);
    if (t === null || rh === null) return { dew: null };
    if (rh <= 0 || rh > 100) return { dew: null, error: 'Relative humidity must be above 0 and at most 100%.' };
    const tc = toC(t, si);
    if (tc < -40 || tc > 60) return { dew: null, error: 'Enter an air temperature between -40 °C and 60 °C (-40 °F and 140 °F).' };
    const dc = dewC(tc, rh);
    const dew = fromC(dc, si);
    const out: Record<string, unknown> = { dew };
    const steps = [
      `Air ${r1(tc)} °C at ${rh}% humidity`,
      `γ = ln(${rh}/100) + ${A}×${r1(tc)}/(${B}+${r1(tc)}) = ${(Math.log(rh / 100) + (A * tc) / (B + tc)).toFixed(4)}`,
      `Dew point = ${B}×γ / (${A} − γ) = ${r1(dc)} °C = ${r1(fromC(dc, false))} °F`,
    ];
    let tone: 'good' | 'ok' | 'warn' | 'bad' | undefined;
    let badge: string | undefined;
    let note: string | undefined;
    if (s !== null) {
      const margin = s - dew;
      out.margin = margin;
      if (margin <= 0) {
        tone = 'bad'; badge = 'Condensation';
        note = 'The surface is at or below the dew point, so water will form on it.';
      } else if (margin <= (si ? 2 : 3.6)) {
        tone = 'warn'; badge = 'Close call';
        note = 'The surface is only just above the dew point. A small drop in temperature or rise in humidity will fog it.';
      } else {
        tone = 'good'; badge = 'No condensation';
        note = 'The surface is comfortably above the dew point.';
      }
    } else {
      out.margin = null;
      tone = 'ok'; badge = rh >= 60 ? 'Humid' : 'Comfortable';
      note = 'Add a window or wall temperature to check for condensation.';
    }
    const levels = [30, 40, 50, 60, 70, 80];
    const chart = {
      type: 'bar' as const,
      title: `Dew point at ${r1(t)}° by relative humidity (%)`,
      categories: levels.map((l) => `${l}%`),
      series: [{ name: 'Dew point', values: levels.map((l) => fromC(dewC(tc, l), si)) }],
      format: { format: 'integer' as const, suffix: '°' },
    };
    return { ...out, dew, chart, steps, note, tone, badge } as never;
  },
  content: {
    formula: [
      'γ = ln(RH/100) + a·T / (b + T)',
      'Dew point = b·γ / (a − γ)',
      'T in °C, RH in percent, a = 17.625, b = 243.04 °C (Magnus formula)',
    ],
    body: [
      'The dew point is the temperature to which air must cool before it can no longer hold its water vapour. Cool a surface below it and water condenses there: fog on a window, drips on a cold pipe, damp on an outside wall. Enter the room temperature and relative humidity to get the dew point.',
      'To check a window, measure its inside surface with an infrared thermometer and enter it as the surface temperature. If it is at or below the dew point, expect condensation. In winter a single-pane window can sit well below the room air, so lowering humidity or warming the glass are the two ways to stay above the line.',
      'The calculator uses the Magnus approximation with the Alduchov and Eskridge (1996) constants, which is accurate to a fraction of a degree between roughly 0 and 60 °C. Fahrenheit inputs are converted to Celsius, calculated, and converted back. Results are estimates; real surfaces vary across a pane and over time.',
    ],
    faq: [
      { q: 'What is the dew point at 20 °C and 50% humidity?', a: 'About 9.3 °C (48.7 °F at 68 °F). A surface cooler than 9.3 °C will collect condensation in that room.' },
      { q: 'What dew point feels muggy?', a: 'Many people find outdoor dew points above about 16 °C (60 °F) sticky and above 21 °C (70 °F) oppressive. Indoors, a dew point above the temperature of your windows is what causes fogging.' },
      { q: 'How do I stop window condensation?', a: 'Either lower the room humidity (ventilation or a dehumidifier) so the dew point drops below the glass temperature, or raise the glass temperature with better glazing or more heat. At 21 °C, going from 60% to 40% humidity lowers the dew point from about 13 °C to about 7 °C.' },
      { q: 'Is the dew point the same as relative humidity?', a: 'No. Relative humidity depends on the air temperature, while the dew point is an absolute measure of moisture. Two rooms at the same humidity but different temperatures have different dew points.' },
    ],
    sources: [
      { label: 'Alduchov and Eskridge (1996), Improved Magnus Form Approximation of Saturation Vapor Pressure, J. Applied Meteorology 35, 601-609', url: 'https://doi.org/10.1175/1520-0450(1996)035<0601:IMFAOS>2.0.CO;2' },
      { label: 'Lawrence (2005), The Relationship between Relative Humidity and the Dewpoint Temperature, BAMS 86, 225-233', url: 'https://doi.org/10.1175/BAMS-86-2-225' },
    ],
  },
  related: ['dehumidifier-cost', 'humidifier-runtime', 'wind-chill'],
  examples: [
    // 20 C, 50%: g = ln0.5 + 17.625*20/263.04 = -0.693147 + 1.340179 = 0.647032; 243.04*0.647032/(17.625-0.647032) = 9.2621
    { values: { unit: 'si', temp: 20, rh: 50 }, expect: { dew: 9.261107 } },
    // 68 F = 20 C -> 9.261107 C = 48.669992 F; surface 45 F is below it -> margin -3.669992
    { values: { unit: 'us', temp: 68, rh: 50, surface: 45 }, expect: { dew: 48.669992, margin: -3.669992 } },
    // 0 C, 80%: g = -0.223144 + 0 = -0.223144; 243.04*-0.223144/(17.625+0.223144) = -3.0386
    { values: { unit: 'si', temp: 0, rh: 80 }, expect: { dew: -3.038569 } },
  ],
});

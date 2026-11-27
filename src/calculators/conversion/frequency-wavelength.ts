import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const FREQ: Record<string, [string, number]> = { hz: ['Hz', 1], khz: ['kHz', 1e3], mhz: ['MHz', 1e6], ghz: ['GHz', 1e9], thz: ['THz', 1e12] };
const LEN: Record<string, [string, number]> = { nm: ['nm', 1e-9], um: ['µm', 1e-6], mm: ['mm', 1e-3], cm: ['cm', 1e-2], m: ['m', 1], km: ['km', 1e3] };
const SPEED: Record<string, number> = { light: 299792458, sound: 343 };

/** Scale a length in metres to the most readable unit. */
function lenText(m: number): string {
  const order: [string, number][] = [['km', 1e3], ['m', 1], ['cm', 1e-2], ['mm', 1e-3], ['µm', 1e-6], ['nm', 1e-9]];
  for (const [u, f] of order) if (m >= f) return `${fmt(m / f, 6)} ${u}`;
  return `${fmt(m / 1e-9, 6)} nm`;
}
function freqText(hz: number): string {
  const order: [string, number][] = [['THz', 1e12], ['GHz', 1e9], ['MHz', 1e6], ['kHz', 1e3], ['Hz', 1]];
  for (const [u, f] of order) if (hz >= f) return `${fmt(hz / f, 6)} ${u}`;
  return `${fmt(hz, 6)} Hz`;
}

export default defineCalculator({
  slug: 'frequency-wavelength',
  title: 'Frequency and Wavelength Calculator',
  category: 'conversion',
  description: 'Convert frequency to wavelength and back for light, radio or sound using wave speed = frequency × wavelength. Also shows the period.',
  metaDescription: 'Frequency to wavelength calculator for light, radio waves and sound. Convert either way with λ = v ÷ f, and see the period of the wave.',
  updated: '2026-11-27',
  keywords: ['frequency to wavelength calculator', 'wavelength to frequency', 'radio wavelength calculator', 'wavelength of light', 'speed of sound wavelength', 'lambda equals v over f'],
  inputs: [
    { id: 'mode', label: 'Convert', type: 'select', default: 'f2w', options: [{ value: 'f2w', label: 'Frequency to wavelength' }, { value: 'w2f', label: 'Wavelength to frequency' }], info: 'Choose which value you know. The calculator finds the other one.' },
    { id: 'freq', label: 'Frequency', type: 'number', default: 100, min: 0, step: 0.001, info: 'How many wave cycles pass per second. FM radio is around 100 MHz; middle A is 440 Hz.', showWhen: { input: 'mode', is: 'f2w' } },
    { id: 'fu', label: 'Frequency unit', type: 'select', default: 'mhz', options: Object.entries(FREQ).map(([value, [label]]) => ({ value, label })), info: 'Hz is one cycle per second; kHz, MHz, GHz and THz are thousands, millions, billions and trillions of it.', showWhen: { input: 'mode', is: 'f2w' } },
    { id: 'wl', label: 'Wavelength', type: 'number', default: 500, min: 0, step: 0.001, info: 'The distance between two matching points on the wave, such as crest to crest. Green light is about 500 to 550 nm.', showWhen: { input: 'mode', is: 'w2f' } },
    { id: 'wu', label: 'Wavelength unit', type: 'select', default: 'nm', options: Object.entries(LEN).map(([value, [label]]) => ({ value, label })), info: 'nm is a billionth of a metre and µm a millionth.', showWhen: { input: 'mode', is: 'w2f' } },
    { id: 'medium', label: 'Wave speed', type: 'select', default: 'light', options: [{ value: 'light', label: 'Light or radio (299,792,458 m/s)' }, { value: 'sound', label: 'Sound in air at 20 °C (343 m/s)' }, { value: 'custom', label: 'Custom speed' }], info: 'Light and radio waves travel at the speed of light in a vacuum, c. Sound travels much slower and depends on the material and temperature.' },
    { id: 'speed', label: 'Custom speed (m/s)', type: 'number', default: 1500, min: 0, step: 0.001, info: 'Wave speed in metres per second, for example about 1,500 m/s for sound in water.', showWhen: { input: 'medium', is: 'custom' } },
  ],
  outputs: [
    { id: 'wavelengthText', label: 'Wavelength', format: 'text', primary: true, info: 'The wavelength, shown in the most readable unit.', showWhen: { input: 'mode', is: 'f2w' } },
    { id: 'frequencyText', label: 'Frequency', format: 'text', primary: true, info: 'The frequency, shown in the most readable unit.', showWhen: { input: 'mode', is: 'w2f' } },
    { id: 'wavelength', label: 'Wavelength in metres', format: 'number', precision: 9, suffix: 'm', info: 'The wavelength in metres: speed ÷ frequency.' },
    { id: 'frequency', label: 'Frequency in hertz', format: 'number', precision: 4, suffix: 'Hz', info: 'The frequency in hertz: speed ÷ wavelength.' },
    { id: 'period', label: 'Period', format: 'text', info: 'The time for one full wave cycle: 1 ÷ frequency.' },
  ],
  compute: (v) => {
    const mode = v.mode === 'w2f' ? 'w2f' : 'f2w';
    const medium = String(v.medium ?? 'light');
    const speed = medium === 'custom' ? num(v.speed) : SPEED[medium] ?? SPEED.light;
    if (speed === null) return { wavelength: null };
    if (speed <= 0) return { wavelength: null, error: 'Enter a wave speed above 0.' };
    let hz: number;
    let m: number;
    const steps: string[] = [];
    if (mode === 'f2w') {
      const f = num(v.freq);
      if (f === null) return { wavelength: null };
      if (f <= 0) return { wavelength: null, error: 'Enter a frequency above 0.' };
      const fu = FREQ[String(v.fu)] ?? FREQ.mhz;
      hz = f * fu[1];
      m = speed / hz;
      steps.push(`Frequency = ${fmt(f)} ${fu[0]} = ${fmt(hz)} Hz`);
      steps.push(`Wavelength = speed ÷ frequency = ${fmt(speed)} ÷ ${fmt(hz)} = ${fmt(m, 6)} m`);
    } else {
      const w = num(v.wl);
      if (w === null) return { wavelength: null };
      if (w <= 0) return { wavelength: null, error: 'Enter a wavelength above 0.' };
      const wu = LEN[String(v.wu)] ?? LEN.nm;
      m = w * wu[1];
      hz = speed / m;
      steps.push(`Wavelength = ${fmt(w)} ${wu[0]} = ${fmt(m)} m`);
      steps.push(`Frequency = speed ÷ wavelength = ${fmt(speed)} ÷ ${fmt(m)} = ${fmt(hz, 6)} Hz`);
    }
    const period = 1 / hz;
    const pText = period >= 1 ? `${fmt(period, 6)} s` : period >= 1e-3 ? `${fmt(period * 1e3, 6)} ms` : period >= 1e-6 ? `${fmt(period * 1e6, 6)} µs` : period >= 1e-9 ? `${fmt(period * 1e9, 6)} ns` : `${fmt(period * 1e12, 6)} ps`;
    steps.push(`Period = 1 ÷ frequency = ${pText}`);
    return {
      wavelengthText: lenText(m),
      frequencyText: freqText(hz),
      wavelength: m,
      frequency: hz,
      period: pText,
      tone: 'ok',
      badge: mode === 'f2w' ? lenText(m) : freqText(hz),
      steps,
      chart: {
        type: 'bar',
        title: 'Frequency and wavelength trade off',
        categories: ['Frequency (Hz)', 'Wavelength (m)'],
        series: [{ name: 'Value', values: [hz, m] }],
        format: { format: 'number' },
      },
    };
  },
  content: {
    formula: ['wave speed = frequency × wavelength', 'wavelength = speed ÷ frequency', 'frequency = speed ÷ wavelength', 'period = 1 ÷ frequency'],
    body: [
      'Every wave obeys one relation: its speed equals its frequency times its wavelength. For light and radio the speed is c = 299,792,458 m/s, so a higher frequency means a shorter wavelength. For sound in air at 20 °C the speed is about 343 m/s.',
      'A 100 MHz FM radio signal has a wavelength of 299,792,458 ÷ 100,000,000 = 2.998 m. Green light of 500 nm has a frequency of 299,792,458 ÷ 0.0000005 = 5.996 × 10¹⁴ Hz, about 599.6 THz. Middle A at 440 Hz makes a sound wave 343 ÷ 440 = 0.78 m long.',
      'The period is the time for one cycle, 1 ÷ frequency. Pick a custom speed for other media, such as about 1,500 m/s for sound in water. The calculator runs in your browser and does not store anything.',
    ],
    faq: [
      { q: 'How do I convert frequency to wavelength?', a: 'Divide the wave speed by the frequency. For a 100 MHz radio wave: 299,792,458 ÷ 100,000,000 = 2.998 m.' },
      { q: 'What is the wavelength of 440 Hz sound?', a: 'In air at 20 °C, 343 ÷ 440 = 0.7795 m, or about 78 cm. Choose the sound option to see this.' },
      { q: 'What frequency is 500 nm light?', a: '299,792,458 ÷ 5 × 10⁻⁷ m = 5.996 × 10¹⁴ Hz, about 599.6 THz.' },
      { q: 'Why does the speed of sound change the answer?', a: 'The same frequency gives a much shorter wavelength in sound than in light because sound travels about a million times slower. Sound speed also shifts with temperature and material, so use the custom option for those.' },
    ],
    sources: [],
  },
  related: ['speed-converter', 'time-converter', 'energy-converter'],
  examples: [
    // 100 MHz light: 299792458 / 1e8 = 2.99792458 m; period 1e-8 s = 10 ns
    { values: { mode: 'f2w', freq: 100, fu: 'mhz', medium: 'light' }, expect: { wavelength: 2.99792458, wavelengthText: '2.99792 m', period: '10 ns' } },
    // 500 nm light: 299792458 / 5e-7 = 5.99584916e14 Hz = 599.585 THz
    { values: { mode: 'w2f', wl: 500, wu: 'nm', medium: 'light' }, expect: { frequency: 5.99584916e14, frequencyText: '599.585 THz' }, tolerance: 1e-9 },
    // 440 Hz sound: 343 / 440 = 0.7795454545 m = 77.9545 cm
    { values: { mode: 'f2w', freq: 440, fu: 'hz', medium: 'sound' }, expect: { wavelength: 0.7795454545, wavelengthText: '77.9545 cm' } },
  ],
});

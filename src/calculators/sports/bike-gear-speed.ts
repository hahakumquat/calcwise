import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const KM_PER_MILE = 1.609344;

export default defineCalculator({
  slug: 'bike-gear-speed',
  title: 'Bike Gear Speed Calculator',
  category: 'sports',
  description: 'Find your bike speed in mph and km/h from chainring teeth, cog teeth, cadence and wheel circumference, plus the gear ratio and speed at other cadences.',
  keywords: ['bike gear calculator', 'cycling speed from cadence', 'gear ratio bicycle', 'bike speed calculator', 'chainring cog speed', 'cadence to speed'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'chainring', label: 'Chainring teeth', type: 'number', default: 50, min: 1, max: 100, step: 1, info: 'Teeth on the front chainring you are using.' },
    { id: 'cog', label: 'Cog teeth', type: 'number', default: 17, min: 1, max: 60, step: 1, info: 'Teeth on the rear cog you are using.' },
    { id: 'cadence', label: 'Cadence', type: 'number', default: 90, min: 1, max: 250, step: 1, suffix: 'rpm', info: 'Pedal revolutions per minute.' },
    { id: 'circ', label: 'Wheel circumference (typical 700x25c: 2105)', type: 'number', default: 2105, min: 500, max: 3000, step: 1, suffix: 'mm', info: 'Distance the wheel rolls in one turn. 2105 mm is a typical figure for a 700x25c tyre; measure your own for best accuracy.' },
  ],
  outputs: [
    { id: 'kmh', label: 'Speed', format: 'number', precision: 1, suffix: 'km/h', primary: true, info: 'Cadence × gear ratio × circumference, converted to km/h.' },
    { id: 'mph', label: 'Speed', format: 'number', precision: 1, suffix: 'mph', info: 'km/h ÷ 1.609344.' },
    { id: 'ratio', label: 'Gear ratio', format: 'number', precision: 3, info: 'Chainring teeth ÷ cog teeth.' },
    { id: 'dev', label: 'Distance per pedal turn', format: 'number', precision: 2, suffix: 'm', info: 'Gear ratio × circumference (also called development).' },
  ],
  compute: (v) => {
    const ch = num(v.chainring), cg = num(v.cog), cad = num(v.cadence), circ = num(v.circ);
    if (ch === null || ch <= 0 || cg === null || cg <= 0) return { kmh: null, error: 'Enter the number of teeth on the chainring and cog.' };
    if (cad === null || cad <= 0) return { kmh: null, error: 'Enter a cadence above zero.' };
    if (circ === null || circ <= 0) return { kmh: null, error: 'Enter the wheel circumference in millimetres.' };
    const ratio = ch / cg;
    const dev = (ratio * circ) / 1000; // metres per pedal turn
    const mPerMin = cad * dev;
    const kmh = (mPerMin * 60) / 1000;
    const mph = kmh / KM_PER_MILE;
    const cadences = [60, 70, 80, 90, 100, 110];
    return {
      kmh,
      mph,
      ratio,
      dev,
      tone: 'ok',
      badge: `${fmt(kmh, 1)} km/h`,
      note: `A ${fmt(ch, 0)}/${fmt(cg, 0)} gear (ratio ${fmt(ratio, 3)}) at ${fmt(cad, 0)} rpm gives ${fmt(kmh, 1)} km/h, or ${fmt(mph, 1)} mph. This assumes no drivetrain slip and the circumference you entered.`,
      chart: {
        type: 'bar' as const,
        title: 'Speed at other cadences (km/h)',
        categories: cadences.map((c) => `${c} rpm`),
        series: [{ name: 'km/h', values: cadences.map((c) => (c * dev * 60) / 1000) }],
        format: { suffix: 'km/h', precision: 1 },
      },
      steps: [
        `Gear ratio = ${fmt(ch, 0)} ÷ ${fmt(cg, 0)} = ${fmt(ratio, 3)}`,
        `Distance per pedal turn = ${fmt(ratio, 3)} × ${fmt(circ, 0)} mm = ${fmt(dev, 3)} m`,
        `Speed = ${fmt(cad, 0)} rpm × ${fmt(dev, 3)} m = ${fmt(mPerMin, 1)} m/min`,
        `km/h = ${fmt(mPerMin, 1)} × 60 ÷ 1000 = ${fmt(kmh, 2)}`,
        `mph = ${fmt(kmh, 2)} ÷ ${KM_PER_MILE} = ${fmt(mph, 2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Gear ratio = chainring teeth ÷ cog teeth',
      'Distance per pedal turn = gear ratio × wheel circumference',
      'Speed (m/min) = cadence × gear ratio × circumference (m)',
      'km/h = m/min × 60 ÷ 1000; mph = km/h ÷ 1.609344',
    ],
    body: [
      'Every pedal turn moves the bike by the gear ratio times the distance the wheel rolls in one turn. Enter the teeth on the chainring and the cog you are in, your cadence and the wheel circumference, and the calculator gives your speed in km/h and mph.',
      'Example: a 50-tooth chainring with a 17-tooth cog has a ratio of 50 ÷ 17 = 2.941. With a 2105 mm wheel that is 6.191 m per pedal turn. At 90 rpm you cover 557.2 m a minute, which is 33.4 km/h or 20.8 mph.',
      'The default 2105 mm is a typical circumference for a 700x25c tyre, but real values vary with tyre model, width, pressure and rider weight, so rolling your own wheel out one full turn and measuring it is more accurate. Gear calculators such as Sheldon Brown\'s are a well-known reference for this maths. Everything here runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How fast is a 50/17 gear at 90 rpm?', a: 'The ratio is 2.941. With a 2105 mm wheel that is 33.4 km/h, or 20.8 mph.' },
      { q: 'How do I calculate bike speed from cadence?', a: 'Multiply cadence by gear ratio and by wheel circumference to get distance per minute, then convert. 90 × 2.941 × 2.105 m = 557.2 m/min, which is 33.4 km/h.' },
      { q: 'What wheel circumference should I use?', a: '2105 mm is a typical figure for a 700x25c tyre and is the default. Your tyre may differ by a few millimetres, so measure one full wheel turn for a better answer.' },
      { q: 'What does an easy gear give?', a: 'A 34/28 gear has a ratio of 1.214. At 60 rpm on a 2105 mm wheel that is 9.2 km/h, or 5.7 mph.' },
      { q: 'Does this include hills, wind or drivetrain loss?', a: 'No. It is the speed the gearing allows at that cadence on the wheel size you entered, not a prediction of how fast you can actually ride.' },
    ],
    sources: [
      { label: 'Sheldon Brown: Bicycle gear calculator (reference for gear ratio and speed formulas)', url: 'https://www.sheldonbrown.com/gears/' },
    ],
  },
  related: ['cycling-power-to-weight', 'pace', 'heart-rate-zones'],
  examples: [
    // ratio 50/17 = 2.941176; dev = 2.941176*2.105 = 6.191176 m; 90*6.191176 = 557.206 m/min; km/h = 33.4324; mph = 33.4324/1.609344 = 20.7739
    { values: { chainring: 50, cog: 17, cadence: 90, circ: 2105 }, expect: { ratio: 2.941176, dev: 6.191176, kmh: 33.43235, mph: 20.7739 }, tolerance: 1e-4 },
    // ratio 34/28 = 1.214286; dev = 2.556071 m; 60*2.556071 = 153.364 m/min; km/h = 9.20186; mph = 5.71777
    { values: { chainring: 34, cog: 28, cadence: 60, circ: 2105 }, expect: { ratio: 1.214286, kmh: 9.20186, mph: 5.71777 }, tolerance: 1e-4 },
  ],
});

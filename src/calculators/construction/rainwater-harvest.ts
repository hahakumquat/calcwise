import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const GAL_PER_FT2_IN = 7.48052 / 12; // 1 ft² x 1 in = 1/12 ft³ = 0.623377 US gal

export default defineCalculator({
  slug: 'rainwater-harvest',
  title: 'Rainwater Harvest Calculator',
  category: 'construction',
  description: 'Estimate how many gallons of rainwater your roof can collect from a given rainfall, for rain barrels, tanks and garden planning.',
  metaDescription: 'Rainwater harvest calculator: gallons of rain your roof catchment area collects for a given rainfall and efficiency, to size rain barrels and tanks.',
  keywords: ['rainwater harvesting calculator', 'rain barrel calculator', 'roof catchment', 'gallons per inch of rain', 'rain collection', 'rainwater tank size'],
  inputs: [
    { id: 'area', label: 'Roof catchment area', type: 'number', suffix: 'ft²', default: 1000, min: 0, help: 'Footprint of the roof that drains to your gutters, not the sloped surface.', info: 'The flat footprint (length × width) of the roof section that drains into your gutters and downspouts. Do not use the sloped area.' },
    { id: 'rain', label: 'Rainfall', type: 'number', suffix: 'in', default: 1, min: 0, step: 0.1, help: 'One storm, or a month or year of rain.', info: 'Rain depth in inches for the period you care about: a single storm, a month or a year. Local weather services publish these totals.' },
    { id: 'efficiency', label: 'Collection efficiency', type: 'number', suffix: '%', default: 85, min: 0, max: 100, help: '75–90% is typical after losses.', info: 'Share of the rain that actually reaches the barrel. Splash, evaporation, first-flush diverters and overflow cut this below 100%. 85% is a common planning figure.' },
  ],
  outputs: [
    { id: 'gallons', label: 'Water collected', format: 'number', suffix: 'gal', precision: 1, primary: true, info: 'US gallons collected: area × rainfall × 0.62338 × efficiency.' },
    { id: 'barrels', label: '55-gallon barrels filled', format: 'number', precision: 1, info: 'Collected gallons ÷ 55, the size of a common rain barrel.' },
    { id: 'perInch', label: 'Per inch of rain', format: 'number', suffix: 'gal', precision: 1, info: 'Gallons you collect from each inch of rain at this area and efficiency.' },
  ],
  compute: (v) => {
    const area = num(v.area);
    const rain = num(v.rain);
    const eff = num(v.efficiency);
    if (area === null || rain === null || eff === null || area <= 0 || rain <= 0 || eff <= 0) return { gallons: null };
    const e = Math.min(eff, 100) / 100;
    const perInch = area * GAL_PER_FT2_IN * e;
    const gallons = perInch * rain;
    const barrels = gallons / 55;
    return {
      gallons,
      barrels,
      perInch,
      tone: 'ok',
      badge: barrels < 1 ? 'Less than one barrel' : `About ${Math.round(barrels)} barrel${Math.round(barrels) === 1 ? '' : 's'}`,
      note: 'Rules on collecting rainwater vary by state and city, so check local regulations before you install a system.',
      chart: {
        type: 'bar',
        title: 'Gallons collected at different rainfall depths',
        categories: ['0.25 in', '0.5 in', '1 in', '2 in', '4 in'],
        series: [{ name: 'US gallons', values: [0.25, 0.5, 1, 2, 4].map((r) => perInch * r) }],
        format: { format: 'integer' },
      },
      steps: [
        `Gallons per ft² per inch = 7.48052 ÷ 12 = ${GAL_PER_FT2_IN.toFixed(5)}`,
        `Before losses = ${area} ft² × ${rain} in × ${GAL_PER_FT2_IN.toFixed(5)} = ${(area * rain * GAL_PER_FT2_IN).toFixed(1)} gal`,
        `After ${(e * 100).toFixed(0)}% efficiency = ${gallons.toFixed(1)} gal`,
      ],
    };
  },
  content: {
    formula: [
      'Gallons = roof area (ft²) × rainfall (in) × 7.48052 ÷ 12 × efficiency',
      'One inch of rain on one square foot = 1/12 ft³ = 0.62338 US gallons',
    ],
    body: [
      'An inch of rain on a square foot is a layer of water one inch deep, which is 1/12 of a cubic foot, or 0.62338 US gallons. Multiply by your roof’s footprint and the rainfall, then apply an efficiency figure for losses. A 1,000 ft² roof in 1 inch of rain sheds 623.4 gallons, and at 85% efficiency you collect about 529.9 gallons.',
      'A 1,500 ft² roof and 2 inches of rain give 1,870.1 gallons before losses. At 90% efficiency that is 1,683.1 gallons, enough to fill about 30 standard 55-gallon barrels.',
    ],
    sections: [
      {
        heading: 'Measure the footprint, not the slope',
        paragraphs: [
          'Rain falls straight down, so what counts is the flat area the roof covers, length × width of the building under that roof section, including eaves. Use only the sections that feed your gutters and downspouts.',
        ],
      },
      {
        heading: 'Why efficiency is below 100%',
        paragraphs: [
          'Some water splashes over gutters, evaporates, soaks into the roof surface or is thrown away by a first-flush diverter. A full barrel also overflows. 75–90% is a typical planning range, and 85% is the default here. Rules on collecting rainwater vary by state and city, so check locally.',
        ],
      },
    ],
    faq: [
      { q: 'How much water does 1 inch of rain give on a 1,000 ft² roof?', a: '623.4 US gallons at 100% efficiency, or about 529.9 gallons at 85%.' },
      { q: 'How many gallons per square foot per inch of rain?', a: '0.62338 gallons (7.48052 ÷ 12) before any losses.' },
      { q: 'How much would a 1,500 ft² roof collect in 2 inches of rain?', a: '1,870.1 gallons before losses, and 1,683.1 gallons at 90% efficiency.' },
      { q: 'What efficiency should I use?', a: 'The default is 85%. Use 75–90% depending on gutters, roof material and whether you use a first-flush diverter.' },
      { q: 'Is it legal to collect rainwater?', a: 'It depends on where you live. Rules vary by state and city, so check with your local authority before installing a system.' },
    ],
    sources: [
      { label: 'NIST unit conversion: US gallon = 231 cubic inches', url: 'https://www.nist.gov/pml/owm/metric-si/unit-conversion' },
    ],
  },
  related: ['gravel', 'pool-volume', 'roofing'],
  examples: [
    // 1000 x 1 x 7.48052/12 = 623.3767; x 0.85 = 529.870
    { values: { area: 1000, rain: 1, efficiency: 85 }, expect: { gallons: 529.87, perInch: 529.87 }, tolerance: 1e-3 },
    // 1000 x 1 x 0.623377 = 623.38 at 100%
    { values: { area: 1000, rain: 1, efficiency: 100 }, expect: { gallons: 623.377 }, tolerance: 1e-3 },
    // 1500 x 2 x 0.623377 = 1870.13; x 0.9 = 1683.12; /55 = 30.60
    { values: { area: 1500, rain: 2, efficiency: 90 }, expect: { gallons: 1683.12, barrels: 30.6 }, tolerance: 1e-3 },
  ],
});

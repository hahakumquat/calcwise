import { defineCalculator } from '../../lib/types';
import { fmt, nums } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'decibel-sum',
  title: 'Decibel Addition Calculator',
  category: 'math',
  description: 'Add sound levels in dB the right way: L = 10 log10(sum of 10^(L/10)). See why two 60 dB sources make 63 dB, not 120, and the gain over the loudest.',
  keywords: ['decibel addition calculator', 'add decibels', 'dB sum', 'combine sound levels', 'adding noise levels', 'sound level addition', 'two 60 dB sources'],
  updated: '2026-11-26',
  inputs: [
    { id: 'levels', label: 'Sound levels (dB)', type: 'list', default: '60, 60', placeholder: 'Levels in dB separated by commas, spaces or new lines', info: 'One sound level in dB for each source, measured at the same spot, such as 80, 70. Add as many as you like.' },
  ],
  outputs: [
    { id: 'total', label: 'Combined level', format: 'number', precision: 2, suffix: 'dB', primary: true, info: 'The total sound level of all sources together, found by adding their intensities and converting back to dB.' },
    { id: 'gain', label: 'Increase over the loudest source', format: 'number', precision: 2, suffix: 'dB', info: 'How many dB the combined level is above the single loudest source. Two equal sources add about 3 dB.' },
    { id: 'loudest', label: 'Loudest single source', format: 'number', precision: 2, suffix: 'dB', info: 'The highest level you entered.' },
    { id: 'count', label: 'Sources', format: 'integer', info: 'How many levels were added.' },
  ],
  compute: (v) => {
    const ls = nums(v.levels);
    const n = ls.length;
    if (n < 2) return { count: n, note: 'Enter at least two sound levels in dB, separated by commas, spaces or new lines.' };
    if (ls.some((x) => Math.abs(x) > 400)) return { error: 'Levels above 400 dB or below -400 dB are outside any real sound. Check the numbers.' };
    const loudest = Math.max(...ls);
    // Factor out the loudest level so large values cannot overflow: sum of 10^((L - max)/10)
    const rel = ls.map((x) => 10 ** ((x - loudest) / 10));
    const gain = 10 * Math.log10(rel.reduce((a, b) => a + b, 0));
    const total = loudest + gain;
    return {
      total, gain, loudest, count: n,
      tone: 'ok',
      badge: `${fmt(total, 4)} dB`,
      note: `Assumes uncorrelated sources heard at the same point. ${gain < 1 ? 'The quieter sources barely change the total.' : 'Every source adds to the total, but far less than adding the dB numbers.'}`,
      chart: {
        type: 'bar',
        title: 'Each source and the combined level (dB)',
        categories: [...ls.map((_, i) => `Source ${i + 1}`), 'Combined'].slice(0, 13),
        series: [{ name: 'dB', values: [...ls, total].slice(0, 13) }],
        format: { format: 'number', suffix: ' dB' },
        highlight: Math.min(n, 12),
      },
      steps: [
        `Intensity of each source = 10^(L/10): ${ls.slice(0, 8).map((x) => `10^(${fmt(x, 5)}/10)`).join(' + ')}${n > 8 ? ' + …' : ''}`,
        `Relative to the loudest (${fmt(loudest, 5)} dB), the intensities add to ${fmt(rel.reduce((a, b) => a + b, 0), 6)}`,
        `Gain = 10 × log10(${fmt(rel.reduce((a, b) => a + b, 0), 6)}) = ${fmt(gain, 5)} dB`,
        `Combined level = ${fmt(loudest, 5)} + ${fmt(gain, 5)} = ${fmt(total, 6)} dB`,
      ],
    };
  },
  content: {
    formula: ['L total = 10 × log10(10^(L₁/10) + 10^(L₂/10) + … + 10^(Lₙ/10))', 'Equal sources: L total = L + 10 × log10(n)'],
    body: [
      'Decibels are a logarithmic scale, so you cannot add them like ordinary numbers. Two 60 dB sources do not make 120 dB. Each level is first turned back into sound intensity with 10^(L/10), the intensities are added, and the sum is converted back to dB with 10 × log10.',
      'Two equal sources add about 3 dB (10 × log10 2 = 3.01). Ten equal sources add 10 dB. When one source is much louder, the quieter ones hardly matter: 80 dB plus 70 dB is only 80.41 dB, because 70 dB has one tenth the intensity of 80 dB.',
      'The method assumes the sources are uncorrelated, like separate machines or people talking, and measured at the same point. It does not model distance, walls or pure tones that interfere with each other.',
    ],
    sections: [
      {
        heading: 'Why a 10 dB gap makes the quieter source almost vanish',
        paragraphs: [
          'A source 10 dB below another carries only 10% of its intensity, so it adds 0.41 dB. At a 20 dB gap it adds 0.04 dB. This is why quieting the loudest source in a room helps far more than quieting the rest.',
          'Because of the shortcut L + 10 × log10(n), doubling the number of identical sources always adds 3 dB. Halving the noise power takes 3 dB off.',
        ],
      },
    ],
    faq: [
      { q: 'What is 60 dB plus 60 dB?', a: 'About 63.01 dB. Each 60 dB source has intensity 10^6, the pair is 2 × 10^6, and 10 × log10(2 × 10^6) = 63.01 dB. The increase over one source is 3.01 dB.' },
      { q: 'What is 80 dB plus 70 dB?', a: 'About 80.41 dB. The intensities are 10^8 and 10^7, which add to 1.1 × 10^8, and 10 × log10(1.1 × 10^8) = 80.41 dB. The quieter source adds only 0.41 dB.' },
      { q: 'What do three 80 dB sources add up to?', a: 'About 84.77 dB: 80 + 10 × log10(3) = 80 + 4.77. The gain over the loudest single source is 4.77 dB.' },
      { q: 'Why is the answer so close to the loudest source?', a: 'Decibels are logarithmic. A source 10 dB quieter has a tenth of the intensity, so it raises the total by only 0.41 dB. The loudest source dominates.' },
      { q: 'Does this work for sources that are not at the same spot?', a: 'Only if you enter the level each source produces at the listening point. This calculator does not account for distance, reflections or room acoustics, and it assumes the sources are uncorrelated.' },
    ],
    sources: [
      { label: 'Decibel (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Decibel' },
      { label: 'Sound pressure level, sum of levels (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Sound_pressure#Sound_pressure_level' },
      { label: 'Noise measurement and decibels (CDC NIOSH)', url: 'https://www.cdc.gov/niosh/noise/about/noise.html' },
    ],
  },
  related: ['log', 'exponent', 'scientific-notation', 'ratio'],
  examples: [
    // 10^6 + 10^6 = 2e6 -> 10*log10(2e6) = 60 + 3.0103 = 63.0103
    { values: { levels: [60, 60] }, expect: { total: 63.0103, gain: 3.0103, loudest: 60, count: 2 }, tolerance: 1e-4 },
    // 10^8 + 10^7 = 1.1e8 -> 80 + 10*log10(1.1) = 80 + 0.41393 = 80.4139
    { values: { levels: [80, 70] }, expect: { total: 80.4139, gain: 0.4139 }, tolerance: 1e-4 },
    // three 80 dB: 80 + 10*log10(3) = 84.7712
    { values: { levels: [80, 80, 80] }, expect: { total: 84.7712, gain: 4.7712 }, tolerance: 1e-4 },
  ],
});

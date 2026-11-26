import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'arc-length-sector',
  title: 'Arc Length and Sector Area Calculator',
  category: 'math',
  description: 'Enter a radius and a central angle to get the arc length, sector area, chord length and segment area of a circle.',
  metaDescription: 'Find arc length, sector area, chord and segment area from a radius and central angle in degrees. Free, instant, with the working shown.',
  updated: '2026-11-26',
  keywords: ['arc length calculator', 'sector area calculator', 'arc length formula', 'area of a sector', 'chord length calculator', 'circle segment area'],
  inputs: [
    { id: 'r', label: 'Radius (r)', type: 'number', default: 10, min: 0, step: 0.1, info: 'Distance from the centre of the circle to its edge. Use any unit; lengths come back in that unit and areas in its square.' },
    { id: 'deg', label: 'Central angle (degrees)', type: 'number', default: 90, min: 0, max: 360, step: 1, info: 'The angle at the centre between the two radii, from above 0 to 360 degrees.' },
  ],
  outputs: [
    { id: 'arc', label: 'Arc length (s)', format: 'number', precision: 4, primary: true, info: 'The distance along the curved edge: s = r × angle in radians.' },
    { id: 'sector', label: 'Sector area', format: 'number', precision: 4, info: 'The slice of the circle between the two radii: A = ½ × r² × angle in radians.' },
    { id: 'chord', label: 'Chord length', format: 'number', precision: 4, info: 'The straight line joining the two ends of the arc: 2r × sin(angle ÷ 2).' },
    { id: 'segment', label: 'Segment area', format: 'number', precision: 4, info: 'The area between the arc and its chord: ½ × r² × (angle − sin angle).' },
  ],
  compute: (v) => {
    const r = num(v.r);
    const deg = num(v.deg);
    if (r === null || deg === null) return { arc: null };
    if (r <= 0) return { arc: null, error: 'Enter a radius above 0.' };
    if (deg <= 0 || deg > 360) return { arc: null, error: 'Enter an angle above 0 and up to 360 degrees.' };
    const t = (deg * Math.PI) / 180;
    const arc = r * t;
    const sector = 0.5 * r * r * t;
    const chord = 2 * r * Math.sin(t / 2);
    const segment = 0.5 * r * r * (t - Math.sin(t));
    const full = Math.PI * r * r;
    return {
      arc,
      sector,
      chord,
      segment,
      tone: 'ok',
      badge: `${fmt(deg)}° of r = ${fmt(r)}`,
      chart: {
        type: 'bar',
        title: 'Sector vs the rest of the circle',
        categories: ['Sector', 'Rest of circle'],
        series: [{ name: 'Area', values: [sector, full - sector] }],
      },
      steps: [
        `Angle in radians = ${fmt(deg)} × π ÷ 180 = ${fmt(t)}`,
        `Arc length s = r × angle = ${fmt(r)} × ${fmt(t)} = ${fmt(arc)}`,
        `Sector area = ½ × r² × angle = ½ × ${fmt(r * r)} × ${fmt(t)} = ${fmt(sector)}`,
        `Chord = 2r × sin(angle ÷ 2) = ${fmt(chord)}; segment = sector − triangle = ${fmt(segment)}`,
      ],
    };
  },
  content: {
    formula: ['s = r × θ (θ in radians)', 'A(sector) = ½ × r² × θ', 'chord = 2r × sin(θ ÷ 2)', 'A(segment) = ½ × r² × (θ − sin θ)', 'θ(radians) = degrees × π ÷ 180'],
    body: [
      'An arc is a piece of the edge of a circle, and a sector is the slice of the circle between two radii. Give the radius and the central angle in degrees and this calculator returns the arc length, the sector area, the chord and the segment area.',
      'The angle must be in radians for the formulas, so the calculator converts first: 90 degrees is π ÷ 2 ≈ 1.5708 radians. With r = 10 the arc is 10 × 1.5708 = 15.708 and the sector is ½ × 100 × 1.5708 = 78.54.',
      'The segment is the part left when you cut the sector along its chord, so segment area = sector area minus the triangle ½ × r² × sin θ. At 90 degrees and r = 10 that is 78.54 − 50 = 28.54.',
    ],
    faq: [
      { q: 'What is the arc length of a 90 degree angle with radius 10?', a: 'Arc length = 10 × π ÷ 2 = 15.708. The sector area is 78.54 and the chord is 14.142.' },
      { q: 'How do I find the area of a sector?', a: 'Multiply half the radius squared by the angle in radians. For r = 6 and 60 degrees that is ½ × 36 × 1.0472 = 18.850.' },
      { q: 'Does the angle have to be in degrees?', a: 'Here yes. Enter degrees and the calculator converts to radians for you. A full circle is 360 degrees, which gives an arc equal to the circumference 2πr.' },
      { q: 'What units does the answer use?', a: 'Whatever unit you used for the radius. Arc, chord and radius share that unit; sector and segment areas are in its square, such as cm² for cm.' },
    ],
    sources: [],
  },
  related: ['circle', 'area', 'pythagorean-theorem'],
  examples: [
    // r=10, 90deg: arc = 10*pi/2 = 15.70796; sector = 0.5*100*pi/2 = 78.53982; chord = 20*sin45 = 14.14214; segment = 78.53982 - 50 = 28.53982
    { values: { r: 10, deg: 90 }, expect: { arc: 15.70796, sector: 78.53982, chord: 14.14214, segment: 28.53982 }, tolerance: 0.001 },
    // r=6, 60deg: arc = 6*pi/3 = 6.283185; sector = 18*pi/3 = 18.849556; chord = 6; segment = 18.849556 - 18*sin60 (15.588457) = 3.261099
    { values: { r: 6, deg: 60 }, expect: { arc: 6.283185, sector: 18.849556, chord: 6, segment: 3.261099 }, tolerance: 0.001 },
  ],
});

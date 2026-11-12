import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const FT2 = 0.09290304;
const LEN = ['ft', 'in', 'yd', 'm', 'cm'];

export default defineCalculator({
  slug: 'square-footage',
  title: 'Square Footage Calculator',
  category: 'construction',
  description: 'Find the area of a room or lot in square feet or square meters for rectangles, circles, triangles and trapezoids, with optional cost.',
  keywords: ['square feet', 'sq ft', 'area of a room', 'square meters', 'floor area', 'cost per square foot'],
  popular: true,
  inputs: [
    {
      id: 'shape',
      label: 'Shape',
      type: 'select',
      default: 'rect',
      info: 'Pick the shape that matches the space. Split L-shaped or irregular rooms into simple shapes and add them up.',
      options: [
        { value: 'rect', label: 'Rectangle / square' },
        { value: 'circle', label: 'Circle' },
        { value: 'triangle', label: 'Triangle' },
        { value: 'trapezoid', label: 'Trapezoid' },
      ],
    },
    { id: 'length', label: 'Length', type: 'number', unit: 'length', units: LEN, defaultUnit: 'ft', default: 12, min: 0, info: 'The longer side of the room, measured wall to wall at floor level.', showWhen: { input: 'shape', is: 'rect' } },
    { id: 'width', label: 'Width', type: 'number', unit: 'length', units: LEN, defaultUnit: 'ft', default: 10, min: 0, info: 'The shorter side of the room, measured at right angles to the length.', showWhen: { input: 'shape', is: 'rect' } },
    { id: 'diameter', label: 'Diameter', type: 'number', unit: 'length', units: LEN, defaultUnit: 'ft', default: 10, min: 0, info: 'The distance straight across the circle through its center — twice the radius.', showWhen: { input: 'shape', is: 'circle' } },
    { id: 'base', label: 'Base', type: 'number', unit: 'length', units: LEN, defaultUnit: 'ft', default: 10, min: 0, info: 'For a triangle, any side; for a trapezoid, one of the two parallel sides.', showWhen: { input: 'shape', is: ['triangle', 'trapezoid'] } },
    { id: 'base2', label: 'Second base', type: 'number', unit: 'length', units: LEN, defaultUnit: 'ft', default: 6, min: 0, info: 'The other parallel side of the trapezoid.', showWhen: { input: 'shape', is: 'trapezoid' } },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: LEN, defaultUnit: 'ft', default: 5, min: 0, info: 'The perpendicular distance from the base to the opposite corner (triangle) or to the other base (trapezoid) — not the slanted side.', showWhen: { input: 'shape', is: ['triangle', 'trapezoid'] } },
    { id: 'qty', label: 'Number of identical areas', type: 'number', default: 1, min: 1, step: 1, optional: true, info: 'Multiply by this many identical spaces, such as three same-size bedrooms.' },
    { id: 'price', label: 'Price per square foot', type: 'number', prefix: '$', min: 0, step: 0.01, optional: true, placeholder: 'Optional', info: 'Material or labor cost per square foot, e.g. flooring at $3–8/ft². Leave blank if you only need the area.' },
  ],
  outputs: [
    { id: 'area', label: 'Area', unit: 'area', units: ['ft2', 'm2', 'yd2', 'in2', 'ac'], defaultUnit: 'ft2', precision: 2, primary: true, info: 'The total area of all the identical spaces. Switch units to see square meters, yards or acres.' },
    { id: 'sqm', label: 'Square meters', precision: 2, suffix: 'm²', info: 'The same area in square meters, used outside the US.' },
    { id: 'cost', label: 'Total cost', format: 'currency', info: 'Area in square feet × price per square foot. Shown only when a price is entered.' },
  ],
  compute: (v) => {
    const qty = num(v.qty) ?? 1;
    if (qty < 0) return { area: null };
    let one: number;
    let how: string;
    const pos = (x: number | null): x is number => x !== null && x >= 0;
    switch (v.shape) {
      case 'circle': {
        const d = num(v.diameter);
        if (!pos(d)) return { area: null };
        one = Math.PI * (d / 2) ** 2;
        how = 'π × (diameter ÷ 2)²';
        break;
      }
      case 'triangle': {
        const b = num(v.base);
        const h = num(v.height);
        if (!pos(b) || !pos(h)) return { area: null };
        one = 0.5 * b * h;
        how = '½ × base × height';
        break;
      }
      case 'trapezoid': {
        const b = num(v.base);
        const b2 = num(v.base2);
        const h = num(v.height);
        if (!pos(b) || !pos(b2) || !pos(h)) return { area: null, error: 'Enter both bases and the height for a trapezoid.' };
        one = ((b + b2) / 2) * h;
        how = '(base 1 + base 2) ÷ 2 × height';
        break;
      }
      default: {
        const l = num(v.length);
        const w = num(v.width);
        if (!pos(l) || !pos(w)) return { area: null };
        one = l * w;
        how = 'length × width';
      }
    }
    const area = one * qty;
    const price = num(v.price);
    const sqft = area / FT2;
    return {
      area,
      sqm: area,
      cost: price !== null ? sqft * price : null,
      chart:
        Number.isInteger(qty) && qty > 1
          ? {
              type: 'donut',
              title: 'Area by space',
              format: { unit: 'area' },
              slices: Array.from({ length: Math.min(qty, 12) }, (_, i) => ({ label: `Space ${i + 1}`, value: one * (i === 11 && qty > 12 ? qty - 11 : 1) })),
            }
          : {
              type: 'bar',
              title: 'Area compared with common rooms',
              horizontal: true,
              categories: ['Your area', 'Parking space (9×18 ft)', 'One-car garage (12×22 ft)', 'Two-car garage (24×24 ft)'],
              series: [{ name: 'Area', values: [area, 162 * FT2, 264 * FT2, 576 * FT2] }],
              format: { unit: 'area' },
              highlight: 0,
            },
      steps: [`Area = ${how} = ${(one / FT2).toFixed(2)} ft² (${one.toFixed(3)} m²)`, ...(qty !== 1 ? [`× ${qty} = ${sqft.toFixed(2)} ft²`] : []), ...(price !== null ? [`Cost = ${sqft.toFixed(2)} ft² × $${price} = $${(sqft * price).toFixed(2)}`] : [])],
    };
  },
  content: {
    formula: ['Rectangle: A = L × W', 'Circle: A = π × (d ÷ 2)²', 'Triangle: A = ½ × b × h', 'Trapezoid: A = (b₁ + b₂) ÷ 2 × h', '1 m² = 10.7639 ft²'],
    body: [
      'Square footage is the floor area of a space measured in square feet. For a rectangular room, multiply the length by the width; a 12 ft by 10 ft bedroom is 120 sq ft. Measure wall to wall at floor level and round up to the nearest inch.',
      'Irregular rooms are easiest to handle by splitting them into simple shapes — an L-shaped room is two rectangles, a bay window is a trapezoid — and adding the pieces. Run the calculator once per piece, or use the quantity box for identical areas such as several same-size bedrooms.',
      'You can mix units: enter dimensions in feet, inches, yards or metres and switch the result between square feet, square metres, square yards and acres. Add a price per square foot to estimate flooring, carpet, sod or cleaning costs.',
    ],
    faq: [
      { q: 'How do I convert square feet to square meters?', a: 'Multiply by 0.0929 (or divide by 10.764). 120 ft² is about 11.15 m².' },
      { q: 'How do I measure a room with inches?', a: 'Enter feet and inches as decimal feet (10 ft 6 in = 10.5 ft) or switch the unit to inches; 126 in × 120 in works just as well.' },
      { q: 'Does square footage include walls and closets?', a: 'For flooring, measure each area you will cover, including closets. Real-estate listings follow separate rules (such as ANSI Z765 in the US) that measure finished living area from exterior walls.' },
    ],
  },
  related: ['flooring', 'paint', 'concrete', 'area-converter'],
  examples: [
    { values: { shape: 'rect', length: 3.6576, width: 3.048, diameter: null, base: null, base2: null, height: null, qty: 1, price: 4 }, expect: { area: 11.1483648, cost: 480 } },
    { values: { shape: 'circle', length: null, width: null, diameter: 3.048, base: null, base2: null, height: null, qty: 1, price: 1 }, expect: { cost: 78.5398163 }, tolerance: 1e-8 },
    { values: { shape: 'trapezoid', length: null, width: null, diameter: null, base: 3.048, base2: 1.8288, height: 1.524, qty: 2, price: 1 }, expect: { cost: 80 } },
    { values: { shape: 'triangle', length: null, width: null, diameter: null, base: 3.048, base2: null, height: 1.524, qty: 1, price: 1 }, expect: { cost: 25 } },
  ],
});

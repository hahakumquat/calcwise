import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const LEN = ['mm', 'cm', 'm', 'in', 'ft', 'yd'];
const len = { type: 'number' as const, unit: 'length' as const, units: LEN, defaultUnit: 'cm', min: 0 };
const when = (...shapes: string[]) => ({ input: 'shape', is: shapes });

const NEED: Record<string, string[]> = {
  cube: ['side'],
  box: ['length', 'width', 'height'],
  cylinder: ['radius', 'height'],
  sphere: ['radius'],
  cone: ['radius', 'height'],
  pyramid: ['length', 'width', 'height'],
};
const LABEL: Record<string, string> = { side: 'Side', length: 'Length', width: 'Width', height: 'Height', radius: 'Radius' };

export default defineCalculator({
  slug: 'volume',
  title: 'Volume Calculator',
  category: 'math',
  description: 'Calculate the volume and surface area of a cube, box, cylinder, sphere, cone or pyramid.',
  keywords: ['volume of a cylinder', 'volume of a sphere', 'volume of a cone', 'volume of a box', 'cubic feet', 'surface area', 'capacity'],
  inputs: [
    {
      id: 'shape', info: 'Pick the 3D solid. The fields below change to the measurements that shape needs.',
      label: 'Shape',
      type: 'select',
      default: 'cylinder',
      options: [
        { value: 'cube', label: 'Cube' },
        { value: 'box', label: 'Rectangular box (cuboid)' },
        { value: 'cylinder', label: 'Cylinder' },
        { value: 'sphere', label: 'Sphere' },
        { value: 'cone', label: 'Cone' },
        { value: 'pyramid', label: 'Rectangular pyramid' },
      ],
    },
    { id: 'side', info: 'The length of one edge of the cube — all edges are equal.', label: 'Side length', ...len, default: 3, showWhen: when('cube') },
    { id: 'length', info: 'The longest horizontal side (for a pyramid, one side of the rectangular base).', label: 'Length', ...len, default: 3, help: 'For a pyramid: one side of the base', showWhen: when('box', 'pyramid') },
    { id: 'width', info: 'The other horizontal side, at right angles to the length.', label: 'Width', ...len, default: 4, help: 'For a pyramid: the other side of the base', showWhen: when('box', 'pyramid') },
    { id: 'radius', info: 'The distance from the centre of the circular base (or the sphere) to its edge.', label: 'Radius', ...len, default: 3, showWhen: when('cylinder', 'sphere', 'cone') },
    { id: 'height', info: 'The vertical height from the base straight up to the top or tip.', label: 'Height', ...len, default: 10, help: 'Vertical height, not the slant', showWhen: when('box', 'cylinder', 'cone', 'pyramid') },
  ],
  outputs: [
    { id: 'volume', info: 'How much space the solid takes up, in cubic units. Switch to litres or gallons to see capacity.', label: 'Volume', unit: 'volume', units: ['cm3', 'm3', 'ml', 'l', 'in3', 'ft3', 'yd3', 'gal', 'impgal'], defaultUnit: 'cm3', primary: true, precision: 6 },
    { id: 'surface', info: 'The total area of all the outside faces — how much material it would take to cover the solid.', label: 'Total surface area', unit: 'area', units: ['cm2', 'm2', 'in2', 'ft2', 'yd2'], defaultUnit: 'cm2', precision: 6 },
  ],
  compute: (v) => {
    const shape = (v.shape as string) || 'cylinder';
    const ids = NEED[shape] ?? NEED.cylinder;
    const d: Record<string, number> = {};
    for (const id of ids) {
      const x = num(v[id]);
      if (x === null) return { volume: null };
      if (x < 0) return { volume: null, error: 'Dimensions can’t be negative.' };
      d[id] = x;
    }
    const cm = (x: number) => `${fmt(x * 100)} cm`;
    let volume: number;
    let surface: number;
    const steps: string[] = [];
    switch (shape) {
      case 'cube': {
        const a = d.side;
        volume = a ** 3;
        surface = 6 * a * a;
        steps.push(`V = a³ = (${cm(a)})³`, `SA = 6a²`);
        break;
      }
      case 'box': {
        const { length: l, width: w, height: h } = d;
        volume = l * w * h;
        surface = 2 * (l * w + l * h + w * h);
        steps.push(`V = l × w × h = ${cm(l)} × ${cm(w)} × ${cm(h)}`, `SA = 2(lw + lh + wh)`);
        break;
      }
      case 'sphere': {
        const r = d.radius;
        volume = (4 / 3) * Math.PI * r ** 3;
        surface = 4 * Math.PI * r * r;
        steps.push(`V = ⁴⁄₃πr³ = ⁴⁄₃ × π × (${cm(r)})³`, `SA = 4πr²`);
        break;
      }
      case 'cone': {
        const { radius: r, height: h } = d;
        const s = Math.hypot(r, h);
        volume = (Math.PI * r * r * h) / 3;
        surface = Math.PI * r * r + Math.PI * r * s;
        steps.push(`V = ⅓πr²h = ⅓ × π × (${cm(r)})² × ${cm(h)}`, `Slant height s = √(r² + h²) = ${cm(s)}`, `SA = πr² + πrs`);
        break;
      }
      case 'pyramid': {
        const { length: a, width: b, height: h } = d;
        volume = (a * b * h) / 3;
        const sa = Math.hypot(b / 2, h); // slant height of the faces on the a-sides
        const sb = Math.hypot(a / 2, h);
        surface = a * b + a * sa + b * sb;
        steps.push(`V = ⅓ × base area × h = ⅓ × ${cm(a)} × ${cm(b)} × ${cm(h)}`, `SA = ab + a·√((b/2)² + h²) + b·√((a/2)² + h²)`);
        break;
      }
      default: {
        const { radius: r, height: h } = d;
        volume = Math.PI * r * r * h;
        surface = 2 * Math.PI * r * (r + h);
        steps.push(`V = πr²h = π × (${cm(r)})² × ${cm(h)}`, `SA = 2πr(r + h)`);
      }
    }
    steps.push(`V = ${fmt(volume * 1e6)} cm³ = ${fmt(volume * 1000)} L`, `SA = ${fmt(surface * 1e4)} cm²`);
    return {
      volume,
      surface,
      chart: { type: 'bar', title: 'Dimensions you entered', categories: ids.map((id) => LABEL[id]), series: [{ name: 'Length', values: ids.map((id) => d[id]) }], format: { unit: 'length' } },
      steps,
    };
  },
  content: {
    formula: ['Cube: V = a³', 'Box: V = l × w × h', 'Cylinder: V = πr²h', 'Sphere: V = ⁴⁄₃πr³', 'Cone: V = ⅓πr²h', 'Pyramid: V = ⅓ × base area × h'],
    body: [
      'Volume measures how much three-dimensional space a solid takes up, in cubic units. For prisms and cylinders — shapes with the same cross-section all the way up — volume is simply the base area multiplied by the height.',
      'Cones and pyramids taper to a point, and they hold exactly one third of the prism or cylinder with the same base and height. That is where the ⅓ in their formulas comes from. A sphere holds two thirds of the cylinder that just encloses it.',
      'Surface area is the total area of all the outside faces — useful for working out how much paint, wrapping or material a shape needs. The cone and pyramid surface areas use the slant height, the distance measured along the sloping side, which the calculator finds with the Pythagorean theorem.',
    ],
    faq: [
      { q: 'How do I convert cubic centimetres to litres?', a: '1 litre is exactly 1000 cm³, and 1 cm³ is the same as 1 mL. Switch the output unit to litres or millilitres to convert automatically.' },
      { q: 'Does the height of a cone mean the slant side?', a: 'No — h is the vertical height from the centre of the base straight up to the tip. The slanted length is the slant height, which is longer.' },
    ],
  },
  related: ['area', 'circle', 'pythagorean-theorem'],
  examples: [
    { values: { shape: 'cylinder', radius: 1, height: 2 }, expect: { volume: 2 * Math.PI, surface: 6 * Math.PI }, tolerance: 1e-12 },
    { values: { shape: 'sphere', radius: 3 }, expect: { volume: 36 * Math.PI, surface: 36 * Math.PI }, tolerance: 1e-12 },
    { values: { shape: 'box', length: 2, width: 3, height: 4 }, expect: { volume: 24, surface: 52 } },
    { values: { shape: 'cone', radius: 3, height: 4 }, expect: { volume: 12 * Math.PI, surface: 24 * Math.PI }, tolerance: 1e-12 },
    { values: { shape: 'pyramid', length: 6, width: 6, height: 4 }, expect: { volume: 48, surface: 96 } },
  ],
});

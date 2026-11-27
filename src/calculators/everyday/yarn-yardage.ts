import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'yarn-yardage',
  title: 'Yarn Yardage Calculator',
  category: 'everyday',
  description: 'Estimate how much yarn a knit or crochet project needs from a gauge swatch: size and yarn used in the swatch, project size, extra allowance and skeins to buy.',
  keywords: ['yarn yardage calculator', 'how much yarn do i need', 'yarn calculator from swatch', 'how many skeins of yarn', 'knitting yardage estimate', 'crochet yarn calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'unit', label: 'Units', type: 'select', segmented: true, default: 'in', options: [{ value: 'in', label: 'Inches and yards' }, { value: 'cm', label: 'Centimetres and metres' }], info: 'Sizes use inches or centimetres. Yarn lengths use yards or metres.' },
    { id: 'sw', label: 'Swatch width', type: 'number', default: 4, min: 0, step: 0.25, help: 'Inches or centimetres, to match the unit above.', info: 'The width of your finished, washed and blocked swatch.' },
    { id: 'sh', label: 'Swatch height', type: 'number', default: 4, min: 0, step: 0.25, info: 'The height of the same swatch, in the same unit.' },
    { id: 'sy', label: 'Yarn used in swatch', type: 'number', default: 8, min: 0, step: 0.25, help: 'Yards or metres, to match the unit above.', info: 'Weigh the swatch and work out its length from the yarn label, or measure the yarn before and after knitting it.' },
    { id: 'pw', label: 'Project width', type: 'number', default: 8, min: 0, step: 0.5, info: 'The finished width of the project, in inches or centimetres.' },
    { id: 'pl', label: 'Project length', type: 'number', default: 60, min: 0, step: 0.5, info: 'The finished length of the project, in inches or centimetres.' },
    { id: 'extra', label: 'Extra allowance', type: 'number', suffix: '%', default: 10, min: 0, step: 1, info: 'A safety margin for edges, seams, swatch differences and mistakes. 10 to 15 percent is common.' },
    { id: 'skein', label: 'Yarn per skein', type: 'number', default: 110, min: 0, step: 1, help: 'Yards or metres, as printed on the label.', info: 'The length on the yarn label, in the same unit as the swatch yarn.' },
  ],
  outputs: [
    { id: 'need', label: 'Yarn needed', format: 'number', precision: 1, primary: true, info: 'Swatch yarn × (project area ÷ swatch area). In yards or metres to match your units.' },
    { id: 'withExtra', label: 'With allowance', format: 'number', precision: 1, info: 'Yarn needed plus your extra allowance. In yards or metres to match your units.' },
    { id: 'skeins', label: 'Skeins to buy', format: 'integer', info: 'Yarn with allowance ÷ yarn per skein, rounded up to a whole skein.' },
    { id: 'ratio', label: 'Project ÷ swatch area', format: 'number', precision: 2, info: 'How many swatches would fit in the project. The yarn estimate scales by this number.' },
  ],
  compute: (v) => {
    const metric = v.unit === 'cm';
    const su = metric ? 'cm' : 'in';
    const yu = metric ? 'm' : 'yd';
    const sw = num(v.sw), sh = num(v.sh), sy = num(v.sy), pw = num(v.pw), pl = num(v.pl);
    const ex = v.extra === '' || v.extra === undefined || v.extra === null ? 0 : num(v.extra);
    const sk = num(v.skein);
    if ([sw, sh, sy, pw, pl, ex, sk].some((x) => x === null)) return { need: null };
    const SW = sw as number, SH = sh as number, SY = sy as number, PW = pw as number, PL = pl as number, EX = ex as number, SK = sk as number;
    if (SW <= 0 || SH <= 0 || SY <= 0 || PW <= 0 || PL <= 0 || SK <= 0) return { need: null, error: 'Enter sizes, swatch yarn and yarn per skein above 0.' };
    if (EX < 0) return { need: null };
    const swatchArea = SW * SH;
    const projArea = PW * PL;
    const ratio = projArea / swatchArea;
    const need = SY * ratio;
    const withExtra = need * (1 + EX / 100);
    // Round off float noise (e.g. 2.0000000000000004) before rounding up to a whole skein.
    const skeins = Math.ceil(+(withExtra / SK).toFixed(9));
    return {
      need,
      withExtra,
      skeins,
      ratio,
      tone: 'ok',
      badge: `${skeins} ${skeins === 1 ? 'skein' : 'skeins'}`,
      note: `Plan on about ${fmt(withExtra, 1)} ${yu} of yarn, which is ${skeins} ${skeins === 1 ? 'skein' : 'skeins'}. This is an estimate: swatch in the real stitch pattern, and wash and block the swatch first so it matches the finished fabric. Scaling by area is approximate, because edges, shaping and any change in gauge use more or less yarn.`,
      chart: {
        type: 'bar' as const,
        title: `Yarn (${yu}): needed vs. with allowance vs. buying`,
        categories: ['Needed', 'With allowance', 'In skeins'],
        series: [{ name: `Yarn (${yu})`, values: [+need.toFixed(1), +withExtra.toFixed(1), +(skeins * SK).toFixed(1)] }],
        highlight: 1,
      },
      steps: [
        `Swatch area = ${fmt(SW)} × ${fmt(SH)} = ${fmt(swatchArea)} ${su}²`,
        `Project area = ${fmt(PW)} × ${fmt(PL)} = ${fmt(projArea)} ${su}²`,
        `Area ratio = ${fmt(projArea)} ÷ ${fmt(swatchArea)} = ${fmt(ratio, 4)}`,
        `Yarn needed = ${fmt(SY)} ${yu} × ${fmt(ratio, 4)} = ${fmt(need, 2)} ${yu}`,
        `With ${fmt(EX)}% extra = ${fmt(need, 2)} × ${fmt(1 + EX / 100, 4)} = ${fmt(withExtra, 2)} ${yu}`,
        `Skeins = ${fmt(withExtra, 2)} ÷ ${fmt(SK)} ${yu}, rounded up = ${skeins}`,
      ],
    };
  },
  content: {
    formula: [
      'Yarn needed = yarn used in swatch × (project area ÷ swatch area)',
      'Yarn with allowance = yarn needed × (1 + extra ÷ 100)',
      'Skeins = yarn with allowance ÷ yarn per skein, rounded up',
    ],
    body: [
      'A gauge swatch tells you how much yarn a patch of fabric uses. Scale that up by area and you get a good first estimate for the whole project. Measure the swatch, note how much yarn it used, enter the size of what you plan to make, and the calculator does the scaling.',
      'For a 4 × 4 inch swatch that used 8 yards, a scarf 8 × 60 inches covers 480 square inches against 16 for the swatch. That is 30 times the area, so 30 × 8 = 240 yards. With 10 percent extra that is 264 yards, and with 110 yard skeins you need 3.',
      'Knit the swatch in the real stitch pattern and the yarn you will use, then wash and block it before you measure, because yarn often relaxes or grows. Area scaling is only an estimate. Edges, shaping, seams and any difference in gauge between swatch and project change the real amount, so keep the extra allowance and buy from one dye lot. For sewing projects, see the curtain fabric calculator, and for gifts, the ribbon length calculator. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much yarn do I need for an 8 × 60 inch scarf?', a: 'If a 4 × 4 inch swatch used 8 yards, the scarf needs 240 yards. With 10 percent extra that is 264 yards, which is 3 skeins of 110 yards.' },
      { q: 'How many skeins should I buy?', a: 'Divide the yarn with allowance by the yards or metres per skein and round up. 264 yards ÷ 110 yards per skein is 2.4, so buy 3 skeins.' },
      { q: 'Why swatch before estimating?', a: 'Stitch pattern, needle size and your own tension all change how much yarn a patch of fabric uses. Swatching in the real stitch gives a figure that matches your project. Wash and block it first so it has its final size.' },
      { q: 'Can I use centimetres and metres?', a: 'Yes. Switch the units to centimetres and metres. A 10 × 10 cm swatch that used 5 m, for a 20 × 150 cm project, needs 150 m, or 165 m with 10 percent extra. With 50 m skeins that is 4 skeins.' },
      { q: 'How accurate is the estimate?', a: 'It is a good guide, not a guarantee. Edges, shaping, seams and gauge differences change the real amount, so keep an extra allowance of 10 to 15 percent and buy from a single dye lot.' },
    ],
    sources: [],
  },
  related: ['curtain-fabric', 'wrapping-paper', 'ribbon-length'],
  examples: [
    // 4x4 = 16 in²; 8x60 = 480 in²; ratio 30; 8*30 = 240 yd; *1.10 = 264 yd; 264/110 = 2.4 -> 3
    { values: { unit: 'in', sw: 4, sh: 4, sy: 8, pw: 8, pl: 60, extra: 10, skein: 110 }, expect: { ratio: 30, need: 240, withExtra: 264, skeins: 3 }, tolerance: 1e-6 },
    // metric: 10x10 = 100 cm²; 20x150 = 3000 cm²; ratio 30; 5*30 = 150 m; *1.10 = 165 m; 165/50 = 3.3 -> 4
    { values: { unit: 'cm', sw: 10, sh: 10, sy: 5, pw: 20, pl: 150, extra: 10, skein: 50 }, expect: { ratio: 30, need: 150, withExtra: 165, skeins: 4 }, tolerance: 1e-6 },
    // exact fit: 2x2 = 4; 4x4 = 16; ratio 4; 3*4 = 12 yd; 0% extra = 12; 12/6 = exactly 2 skeins (no extra skein)
    { values: { unit: 'in', sw: 2, sh: 2, sy: 3, pw: 4, pl: 4, extra: 0, skein: 6 }, expect: { need: 12, withExtra: 12, skeins: 2 }, tolerance: 1e-6 },
  ],
});

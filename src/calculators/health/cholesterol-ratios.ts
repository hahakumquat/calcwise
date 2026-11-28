import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const CHOL = 38.67; // mg/dL per mmol/L, cholesterol
const TG = 88.57; // mg/dL per mmol/L, triglycerides

const ldlBand = (ldl: number) =>
  ldl < 100 ? 'Optimal' : ldl < 130 ? 'Near optimal' : ldl < 160 ? 'Borderline high' : ldl < 190 ? 'High' : 'Very high';
const totalBand = (t: number) => (t < 200 ? 'Desirable' : t < 240 ? 'Borderline high' : 'High');

export default defineCalculator({
  slug: 'cholesterol-ratios',
  title: 'Cholesterol Ratio and LDL Calculator',
  seoTitle: 'Cholesterol Ratio & LDL Calculator',
  metaDescription: 'Enter total cholesterol, HDL and triglycerides to get calculated LDL (Friedewald), non-HDL, total to HDL ratio and ATP III bands. Education, not diagnosis.',
  category: 'health',
  description: 'Calculate LDL (Friedewald), non-HDL cholesterol and your total to HDL ratio from a lipid panel, with ATP III bands.',
  keywords: ['cholesterol ratio calculator', 'LDL calculator', 'friedewald equation calculator', 'non-HDL cholesterol calculator', 'total to HDL ratio', 'triglyceride HDL ratio', 'calculate LDL from total cholesterol'],
  inputs: [
    { id: 'units', label: 'Units', type: 'select', segmented: true, default: 'mgdl', options: [{ value: 'mgdl', label: 'mg/dL' }, { value: 'mmol', label: 'mmol/L' }], info: 'Use the units printed on your lab report. US labs use mg/dL; many other countries use mmol/L.' },
    { id: 'total', label: 'Total cholesterol', type: 'number', default: 200, min: 0, step: 1, info: 'Total cholesterol from your lipid panel.' },
    { id: 'hdl', label: 'HDL cholesterol', type: 'number', default: 50, min: 0, step: 1, info: 'HDL, the "good" cholesterol, from your lipid panel.' },
    { id: 'tg', label: 'Triglycerides', type: 'number', default: 150, min: 0, step: 1, info: 'Triglycerides from your lipid panel. The Friedewald estimate needs this under 400 mg/dL (4.5 mmol/L).' },
  ],
  outputs: [
    { id: 'ldl', label: 'Calculated LDL', primary: true, format: 'number', precision: 1, info: 'Friedewald estimate: total minus HDL minus triglycerides divided by 5 (in mg/dL), shown in your chosen units.' },
    { id: 'ldlBand', label: 'LDL band (ATP III)', format: 'text', info: 'Where your calculated LDL falls in the NCEP ATP III categories.' },
    { id: 'nonHdl', label: 'Non-HDL cholesterol', format: 'number', precision: 1, info: 'Total minus HDL: all the cholesterol in particles that can clog arteries.' },
    { id: 'ratio', label: 'Total to HDL ratio', format: 'number', precision: 2, info: 'Total cholesterol divided by HDL. Lower is generally better.' },
    { id: 'tgHdl', label: 'Triglycerides to HDL ratio', format: 'number', precision: 2, info: 'Triglycerides divided by HDL, computed in mg/dL.' },
    { id: 'totalBand', label: 'Total cholesterol band (ATP III)', format: 'text', info: 'Under 200 mg/dL desirable, 200 to 239 borderline high, 240 and above high.' },
    { id: 'hdlBand', label: 'HDL', format: 'text', info: 'ATP III treats HDL under 40 mg/dL as low.' },
    { id: 'tgBand', label: 'Triglycerides', format: 'text', info: 'ATP III treats triglycerides under 150 mg/dL as normal.' },
  ],
  compute: (v) => {
    const mmol = v.units === 'mmol';
    const t0 = num(v.total), h0 = num(v.hdl), g0 = num(v.tg);
    if (t0 === null || h0 === null || g0 === null) return { ldl: null, note: 'Enter total cholesterol, HDL and triglycerides.' };
    if (t0 <= 0 || h0 <= 0 || g0 <= 0) return { ldl: null, error: 'Total cholesterol, HDL and triglycerides must all be above 0.' };
    const t = mmol ? t0 * CHOL : t0;
    const h = mmol ? h0 * CHOL : h0;
    const g = mmol ? g0 * TG : g0;
    if (h > t) return { ldl: null, error: 'HDL cannot be higher than total cholesterol. Check the values.' };
    if (g >= 400) return { ldl: null, error: 'Triglycerides of 400 mg/dL (4.5 mmol/L) or more make the Friedewald estimate invalid. Ask for a measured (direct) LDL.' };
    const ldl = t - h - g / 5;
    const nonHdl = t - h;
    const out = (x: number) => (mmol ? x / CHOL : x);
    const band = ldlBand(ldl);
    const tone = ldl < 100 ? 'good' : ldl < 130 ? 'good' : ldl < 160 ? 'ok' : ldl < 190 ? 'warn' : 'bad';
    const u = mmol ? 'mmol/L' : 'mg/dL';
    const r1 = (x: number) => +out(x).toFixed(mmol ? 2 : 1);
    return {
      ldl: out(ldl),
      ldlBand: ldl < 0 ? 'Below 0: estimate unreliable, ask for a measured LDL' : band,
      nonHdl: out(nonHdl),
      ratio: t / h,
      tgHdl: g / h,
      totalBand: totalBand(t),
      hdlBand: h < 40 ? 'Low (under 40 mg/dL)' : 'Not low (40 mg/dL or more)',
      tgBand: g < 150 ? 'Normal (under 150 mg/dL)' : 'Not in the normal range (150 mg/dL or more)',
      chart: {
        type: 'scale',
        title: 'Calculated LDL (mg/dL)',
        min: 40,
        max: 220,
        value: Math.min(220, Math.max(40, ldl)),
        valueLabel: `${Math.round(ldl)} mg/dL`,
        bands: [
          { from: 40, to: 100, label: 'Optimal', tone: 'good' },
          { from: 100, to: 130, label: 'Near optimal', tone: 'good' },
          { from: 130, to: 160, label: 'Borderline high', tone: 'ok' },
          { from: 160, to: 190, label: 'High', tone: 'warn' },
          { from: 190, to: 220, label: 'Very high', tone: 'bad' },
        ],
        format: { format: 'number', suffix: ' mg/dL' },
      },
      tone,
      badge: `LDL ${band.toLowerCase()}`,
      note: 'Education, not diagnosis. Targets depend on your overall risk, so talk to your clinician; the American Heart Association at heart.org explains the numbers.',
      steps: [
        ...(mmol ? [`Converted to mg/dL: total ${t.toFixed(1)} (× ${CHOL}), HDL ${h.toFixed(1)}, triglycerides ${g.toFixed(1)} (× ${TG})`] : []),
        `LDL = ${+t.toFixed(1)} − ${+h.toFixed(1)} − ${+g.toFixed(1)} ÷ 5 = ${+ldl.toFixed(1)} mg/dL${mmol ? ` = ${r1(ldl)} ${u}` : ''}`,
        `Non-HDL = ${+t.toFixed(1)} − ${+h.toFixed(1)} = ${+nonHdl.toFixed(1)} mg/dL`,
        `Total to HDL = ${+t.toFixed(1)} ÷ ${+h.toFixed(1)} = ${(t / h).toFixed(2)}; triglycerides to HDL = ${(g / h).toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: [
      'LDL (Friedewald, mg/dL) = total − HDL − triglycerides ÷ 5',
      'Non-HDL = total − HDL',
      'Total to HDL ratio = total ÷ HDL',
      'Triglycerides to HDL ratio = triglycerides ÷ HDL',
      'mg/dL = mmol/L × 38.67 for cholesterol, × 88.57 for triglycerides',
    ],
    body: [
      'A standard lipid panel reports total cholesterol, HDL and triglycerides, and many labs calculate LDL from them with the Friedewald equation: LDL = total − HDL − triglycerides ÷ 5, in mg/dL. The estimate is not valid when triglycerides are 400 mg/dL (4.5 mmol/L) or higher, so this calculator stops there and suggests asking for a measured LDL.',
      'Non-HDL cholesterol is total minus HDL. The total to HDL ratio and the triglycerides to HDL ratio are simple divisions that some clinicians use as extra context. There is no single official cut-off for the ratios here, so we show them without a verdict.',
      'The bands follow the NCEP Adult Treatment Panel III (ATP III) categories: LDL under 100 mg/dL optimal, 100 to 129 near optimal, 130 to 159 borderline high, 160 to 189 high and 190 and above very high; total under 200 desirable, 200 to 239 borderline high and 240 and above high; HDL under 40 low; triglycerides under 150 normal. Newer guidelines focus on overall risk rather than fixed numbers, so check current wording at heart.org.',
      'This is education, not diagnosis or medical advice. Your target depends on your age, blood pressure, diabetes, smoking and family history, so review your results with a clinician.',
    ],
    faq: [
      { q: 'What LDL do I get from 200 total, 50 HDL and 150 triglycerides?', a: 'LDL = 200 − 50 − 150 ÷ 5 = 120 mg/dL, which is near optimal. Non-HDL is 150 and the total to HDL ratio is 4.0. Triglycerides to HDL is 3.0.' },
      { q: 'What about 240 total, 40 HDL and 200 triglycerides?', a: 'LDL = 240 − 40 − 200 ÷ 5 = 160 mg/dL, which is high. Non-HDL is 200 and the total to HDL ratio is 6.0.' },
      { q: 'Why does it reject triglycerides of 400 or more?', a: 'The Friedewald equation becomes unreliable at 400 mg/dL (4.5 mmol/L) and above. Ask your clinician for a measured LDL instead.' },
      { q: 'How do I enter mmol/L values?', a: 'Choose mmol/L. Cholesterol is multiplied by 38.67 and triglycerides by 88.57 to get mg/dL, and results are shown back in mmol/L.' },
      { q: 'What is a good total to HDL ratio?', a: 'Lower is generally considered better, but there is no single official cut-off. Use it as context and discuss it with your clinician.' },
    ],
    sources: [
      { label: 'National Cholesterol Education Program (2002). Third Report of the Expert Panel on Detection, Evaluation, and Treatment of High Blood Cholesterol in Adults (Adult Treatment Panel III). NIH Publication 02-5215.' },
      { label: 'Friedewald WT, Levy RI, Fredrickson DS (1972). Estimation of the concentration of LDL cholesterol in plasma. Clinical Chemistry, 18(6).' },
      { label: 'American Heart Association: What your cholesterol levels mean (heart.org).', url: 'https://www.heart.org' },
    ],
  },
  related: ['bmi', 'waist-to-height-ratio'],
  examples: [
    // LDL = 200 - 50 - 150/5 = 120; non-HDL 150; 200/50 = 4; 150/50 = 3
    { values: { units: 'mgdl', total: 200, hdl: 50, tg: 150 }, expect: { ldl: 120, nonHdl: 150, ratio: 4, tgHdl: 3, ldlBand: 'Near optimal', totalBand: 'Borderline high' }, tolerance: 1e-6 },
    // LDL = 240 - 40 - 200/5 = 160; non-HDL 200; 240/40 = 6; 200/40 = 5
    { values: { units: 'mgdl', total: 240, hdl: 40, tg: 200 }, expect: { ldl: 160, nonHdl: 200, ratio: 6, tgHdl: 5, ldlBand: 'High', totalBand: 'High' }, tolerance: 1e-6 },
    // mmol/L: 5.17*38.67=199.9239; 1.29*38.67=49.8843; 1.7*88.57=150.569; LDL=119.9258 mg/dL = 3.1013 mmol/L; non-HDL 3.88; ratio 5.17/1.29 = 4.0078
    { values: { units: 'mmol', total: 5.17, hdl: 1.29, tg: 1.7 }, expect: { ldl: 3.1013, nonHdl: 3.88, ratio: 4.0078 }, tolerance: 1e-3 },
  ],
});

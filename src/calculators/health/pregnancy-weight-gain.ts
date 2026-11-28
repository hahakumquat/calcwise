import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const LB_PER_KG = 1 / 0.45359237;
// 2009 Institute of Medicine (IOM) guidelines, singleton pregnancy. Total gain in lb.
const FIRST_TRI_LOW = 1.1;
const FIRST_TRI_HIGH = 4.4;
const CATS = {
  under: { name: 'Underweight', totalLow: 28, totalHigh: 40, rateLow: 1.0, rateHigh: 1.3 },
  normal: { name: 'Normal weight', totalLow: 25, totalHigh: 35, rateLow: 0.8, rateHigh: 1.0 },
  over: { name: 'Overweight', totalLow: 15, totalHigh: 25, rateLow: 0.5, rateHigh: 0.7 },
  obese: { name: 'Obese', totalLow: 11, totalHigh: 20, rateLow: 0.4, rateHigh: 0.6 },
} as const;

export default defineCalculator({
  slug: 'pregnancy-weight-gain',
  title: 'Pregnancy Weight Gain Calculator',
  category: 'health',
  description: 'See the 2009 Institute of Medicine weight gain range for a single pregnancy from your pre-pregnancy BMI, plus the range for this week. Not medical advice.',
  keywords: ['pregnancy weight gain calculator', 'how much weight should i gain pregnant', 'IOM pregnancy weight gain', 'pregnancy weight gain by week', 'recommended weight gain pregnancy', 'pregnancy BMI weight gain chart'],
  inputs: [
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['in', 'cm', 'ft'], defaultUnit: 'in', default: 66, min: 0, info: 'Your height without shoes. 5 ft 6 in is 66 inches, or switch the unit to cm.' },
    { id: 'weight', label: 'Pre-pregnancy weight', type: 'number', unit: 'mass', units: ['lb', 'kg'], defaultUnit: 'lb', default: 140, min: 0, info: 'Your weight before you became pregnant, or as close to it as you can recall. The guideline uses the BMI from this weight.' },
    { id: 'week', label: 'Current week', type: 'number', default: 20, min: 1, max: 40, step: 1, suffix: 'weeks', info: 'Weeks of pregnancy completed, from 1 to 40. See the due date calculator if you are unsure.' },
    { id: 'current', label: 'Current weight (optional)', type: 'number', unit: 'mass', units: ['lb', 'kg'], defaultUnit: 'lb', optional: true, min: 0, info: 'Leave blank if you prefer not to track. If you enter it, the result shows how your gain so far compares with the range.' },
  ],
  outputs: [
    { id: 'total', label: 'Total gain range for the whole pregnancy', format: 'text', primary: true, info: 'The 2009 Institute of Medicine range for your pre-pregnancy BMI category, in pounds, for a single baby.' },
    { id: 'bmi', label: 'Pre-pregnancy BMI', precision: 1, suffix: 'kg/m²', info: 'Pre-pregnancy weight in kg divided by height in metres squared.' },
    { id: 'category', label: 'BMI category', format: 'text', info: 'Underweight is under 18.5, normal 18.5 to 24.9, overweight 25 to 29.9, obese 30 or more.' },
    { id: 'gainLow', label: 'Range at this week, low', precision: 1, suffix: 'lb', info: 'First-trimester low end plus the weekly low rate for each week after week 13. Before week 13 it is scaled in proportion.' },
    { id: 'gainHigh', label: 'Range at this week, high', precision: 1, suffix: 'lb', info: 'First-trimester high end plus the weekly high rate for each week after week 13. Before week 13 it is scaled in proportion.' },
    { id: 'rate', label: 'Weekly rate from week 14', format: 'text', info: 'The guideline rate per week in the second and third trimesters, in pounds.' },
    { id: 'weightLow', label: 'Weight at this week, low end', unit: 'mass', units: ['lb', 'kg'], defaultUnit: 'lb', precision: 1, info: 'Pre-pregnancy weight plus the low end of the range at this week.' },
    { id: 'weightHigh', label: 'Weight at this week, high end', unit: 'mass', units: ['lb', 'kg'], defaultUnit: 'lb', precision: 1, info: 'Pre-pregnancy weight plus the high end of the range at this week.' },
    { id: 'gainNow', label: 'Your gain so far', precision: 1, suffix: 'lb', info: 'Current weight minus pre-pregnancy weight. Shown only if you entered a current weight.' },
    { id: 'position', label: 'Compared with the range', format: 'text', info: 'Where your gain so far sits against the range for this week. A range, not a target.' },
  ],
  compute: (v) => {
    const h = num(v.height);
    const w = num(v.weight);
    const week = num(v.week);
    const cur = num(v.current);
    if (h === null || w === null || week === null) return { total: null };
    if (h <= 0 || w <= 0) return { total: null, error: 'Height and pre-pregnancy weight must be greater than zero.' };
    if (!Number.isInteger(week) || week < 1 || week > 40) return { total: null, error: 'Current week must be a whole number from 1 to 40.' };
    if (cur !== null && cur <= 0) return { total: null, error: 'Current weight must be greater than zero, or leave it blank.' };
    const bmi = w / (h * h);
    const c = bmi < 18.5 ? CATS.under : bmi < 25 ? CATS.normal : bmi < 30 ? CATS.over : CATS.obese;
    let gainLow: number;
    let gainHigh: number;
    if (week <= 13) {
      gainLow = (FIRST_TRI_LOW * week) / 13;
      gainHigh = (FIRST_TRI_HIGH * week) / 13;
    } else {
      gainLow = FIRST_TRI_LOW + (week - 13) * c.rateLow;
      gainHigh = FIRST_TRI_HIGH + (week - 13) * c.rateHigh;
    }
    const preLb = w * LB_PER_KG;
    const weightLow = w + gainLow / LB_PER_KG;
    const weightHigh = w + gainHigh / LB_PER_KG;
    const f1 = (n: number) => +n.toFixed(1);
    let gainNow: number | null = null;
    let position: string | null = null;
    if (cur !== null) {
      gainNow = (cur - w) * LB_PER_KG;
      const g = f1(gainNow);
      position = g < f1(gainLow) ? 'Below the range for this week' : g > f1(gainHigh) ? 'Above the range for this week' : 'Within the range for this week';
    }
    const steps = [
      `BMI = ${+w.toFixed(2)} kg ÷ (${+h.toFixed(3)} m)² = ${f1(bmi)}, ${c.name.toLowerCase()}`,
      `Whole pregnancy: ${c.totalLow} to ${c.totalHigh} lb`,
      week <= 13
        ? `Week ${week} (first trimester, scaled): ${FIRST_TRI_LOW} × ${week} ÷ 13 = ${f1(gainLow)} to ${FIRST_TRI_HIGH} × ${week} ÷ 13 = ${f1(gainHigh)} lb`
        : `Week ${week}: ${FIRST_TRI_LOW} + ${week - 13} × ${c.rateLow} = ${f1(gainLow)} to ${FIRST_TRI_HIGH} + ${week - 13} × ${c.rateHigh} = ${f1(gainHigh)} lb`,
    ];
    return {
      total: `${c.totalLow} to ${c.totalHigh} lb`,
      bmi,
      category: c.name,
      gainLow,
      gainHigh,
      rate: `${c.rateLow.toFixed(1)} to ${c.rateHigh.toFixed(1)} lb per week`,
      weightLow,
      weightHigh,
      gainNow,
      position,
      chart: {
        type: 'bar',
        title: `Gain range at week ${week} (lb)`,
        categories: ['Low end', 'High end', ...(gainNow !== null ? ['Your gain'] : [])],
        series: [{ name: 'Pounds', values: [f1(gainLow), f1(gainHigh), ...(gainNow !== null ? [f1(gainNow)] : [])] }],
        format: { format: 'number', suffix: ' lb' },
      },
      tone: 'ok',
      badge: `${c.totalLow} to ${c.totalHigh} lb total`,
      note: 'This is a range, not a target, and not medical advice. Bodies and pregnancies differ, so talk to your clinician about what is right for you, and ask them about any concern.',
      steps,
    };
  },
  content: {
    formula: [
      'BMI = weight (kg) ÷ height (m)², using pre-pregnancy weight',
      'First trimester (to week 13): 1.1 to 4.4 lb in total',
      'Week 14 onward: low = 1.1 + (week − 13) × low rate; high = 4.4 + (week − 13) × high rate',
      'Weekly rates (lb): underweight 1.0 to 1.3, normal 0.8 to 1.0, overweight 0.5 to 0.7, obese 0.4 to 0.6',
    ],
    body: [
      'The ranges here are the 2009 Institute of Medicine (IOM) guidelines, "Weight Gain During Pregnancy: Reexamining the Guidelines", for a single baby. They depend on your BMI before pregnancy: 28 to 40 lb if underweight, 25 to 35 lb if normal weight, 15 to 25 lb if overweight and 11 to 20 lb if obese. You can read the guidance at nationalacademies.org, cdc.gov and acog.org; we have not reproduced it here, so please confirm the figures.',
      'The guideline expects a small gain of about 1.1 to 4.4 lb in the first trimester, then a steady weekly rate from week 14. This calculator adds those together to show a range for the week you are in. Before week 13 it scales the first-trimester range in proportion to the week, which is our simplification rather than an IOM figure.',
      'This is a range, not a target, and it says nothing about whether you are doing well. It is general information, not medical advice, and it covers one baby only. Talk to your clinician about what is right for you, and about twins, a medical condition, or any worry about your weight or your baby.',
    ],
    faq: [
      { q: 'How much weight should I gain at 5 ft 6 in and 140 lb?', a: 'BMI is 703 × 140 ÷ 66² = 22.6, which is normal weight. The 2009 IOM range for the whole pregnancy is 25 to 35 lb.' },
      { q: 'What is the range at week 20 for that person?', a: 'The weekly rate is 0.8 to 1.0 lb after week 13. Low is 1.1 + 7 × 0.8 = 6.7 lb and high is 4.4 + 7 × 1.0 = 11.4 lb.' },
      { q: 'What are the ranges for the other BMI groups?', a: 'Underweight (BMI under 18.5): 28 to 40 lb. Overweight (25 to 29.9): 15 to 25 lb. Obese (30 or more): 11 to 20 lb.' },
      { q: 'What if I am outside the range?', a: 'The range is a guide, not a pass mark. Mention it to your clinician, who knows your situation and can tell you what it means for you.' },
      { q: 'Does this work for twins?', a: 'No. These are single-baby figures. Twin ranges are different, so ask your clinician.' },
      { q: 'Which weight should I use?', a: 'Use your weight before pregnancy. The guideline sorts you by that BMI, not by your current weight.' },
    ],
    sources: [
      { label: 'Institute of Medicine and National Research Council (2009). Weight Gain During Pregnancy: Reexamining the Guidelines. Washington, DC: The National Academies Press.' },
    ],
  },
  related: ['bmi', 'due-date'],
  examples: [
    // 66 in = 1.6764 m, 140 lb = 63.5029318 kg: BMI 22.596 (normal); total 25-35; week 20: low 1.1 + 7*0.8 = 6.7, high 4.4 + 7*1.0 = 11.4
    { values: { height: 1.6764, weight: 63.5029318, week: 20, current: null }, expect: { bmi: 22.5964, gainLow: 6.7, gainHigh: 11.4 }, tolerance: 1e-3 },
    // same, current 150 lb = 68.0388555 kg: gain 10 lb
    { values: { height: 1.6764, weight: 63.5029318, week: 20, current: 68.0388555 }, expect: { gainNow: 10 }, tolerance: 1e-3 },
    // underweight 1.7 m, 50 kg: BMI 17.30; week 14: low 1.1 + 1*1.0 = 2.1, high 4.4 + 1*1.3 = 5.7
    { values: { height: 1.7, weight: 50, week: 14, current: null }, expect: { bmi: 17.301, gainLow: 2.1, gainHigh: 5.7 }, tolerance: 1e-3 },
    // overweight 1.7 m, 80 kg: BMI 27.68; week 27 (14 weeks after 13): low 1.1 + 14*0.5 = 8.1, high 4.4 + 14*0.7 = 14.2
    { values: { height: 1.7, weight: 80, week: 27, current: null }, expect: { bmi: 27.682, gainLow: 8.1, gainHigh: 14.2 }, tolerance: 1e-3 },
    // obese 1.6 m, 90 kg: BMI 35.16; week 30 (17 weeks): low 1.1 + 17*0.4 = 7.9, high 4.4 + 17*0.6 = 14.6
    { values: { height: 1.6, weight: 90, week: 30, current: null }, expect: { bmi: 35.156, gainLow: 7.9, gainHigh: 14.6 }, tolerance: 1e-3 },
    // week 13: full first trimester 1.1 to 4.4
    { values: { height: 1.6764, weight: 63.5029318, week: 13, current: null }, expect: { gainLow: 1.1, gainHigh: 4.4 }, tolerance: 1e-6 },
  ],
});

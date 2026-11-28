import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString('en-US');

export default defineCalculator({
  slug: 'weekly-activity-minutes',
  title: 'Weekly Activity Minutes Calculator',
  category: 'health',
  description: 'Add your moderate and vigorous exercise minutes (vigorous counts double) and see how close you are to the 150 minute weekly guideline for adults.',
  keywords: ['weekly activity minutes calculator', '150 minutes of exercise a week', 'moderate vs vigorous exercise minutes', 'physical activity guidelines calculator', 'am I exercising enough'],
  updated: '2026-11-28',
  inputs: [
    { id: 'mod', label: 'Moderate minutes per week', type: 'number', default: 90, min: 0, step: 5, suffix: 'min', info: 'Brisk walking, easy cycling, doubles tennis: you can talk but not sing.' },
    { id: 'vig', label: 'Vigorous minutes per week', type: 'number', default: 40, min: 0, step: 5, suffix: 'min', info: 'Running, fast cycling, swimming laps: you can only say a few words at a time.' },
    { id: 'target', label: 'Weekly target (moderate minutes)', type: 'number', default: 150, min: 1, step: 10, suffix: 'min', info: 'The adult guideline minimum is 150 moderate-equivalent minutes. 300 is the upper guideline.' },
    { id: 'muscle', label: 'Muscle-strengthening days', type: 'number', default: 2, min: 0, max: 7, step: 1, info: 'Days per week with strength work for all major muscle groups. The guideline is 2 or more.' },
  ],
  outputs: [
    { id: 'equiv', label: 'Moderate-equivalent minutes', format: 'number', primary: true, info: 'Moderate minutes + 2 × vigorous minutes.' },
    { id: 'pct', label: 'Percent of target', format: 'percent', info: 'Equivalent minutes ÷ target.' },
    { id: 'short', label: 'Shortfall (moderate minutes)', format: 'number', info: 'Target minus equivalent minutes, or 0 if you meet the target.' },
    { id: 'shortVig', label: 'Or in vigorous minutes', format: 'number', info: 'The shortfall ÷ 2.' },
  ],
  compute: (v) => {
    const mod = num(v.mod), vig = num(v.vig), target = num(v.target), muscle = num(v.muscle);
    if (mod === null || vig === null || target === null) return { equiv: null };
    if (mod < 0 || vig < 0) return { equiv: null, error: 'Minutes cannot be negative.' };
    if (target <= 0) return { equiv: null, error: 'Enter a weekly target above 0.' };
    const equiv = mod + 2 * vig;
    const short = Math.max(0, target - equiv);
    const shortVig = short / 2;
    const met = equiv >= target;
    const muscleDays = muscle ?? 0;
    const muscleMet = muscleDays >= 2;
    return {
      equiv, pct: equiv / target, short, shortVig,
      tone: met ? 'good' : equiv >= target * 0.66 ? 'ok' : 'warn',
      badge: met ? (equiv >= 300 ? 'Above the 300 minute upper guideline' : 'Target met') : `${fmt(short)} moderate minutes short`,
      chart: {
        type: 'bar',
        title: 'Your minutes vs the guideline (moderate-equivalent)',
        horizontal: true,
        categories: ['You', 'Target', 'Upper guideline (300)'],
        series: [{ name: 'Minutes', values: [equiv, target, 300] }],
        format: { format: 'integer', suffix: 'min' },
        highlight: 0,
      },
      steps: [
        `Equivalent = ${fmt(mod)} + 2 × ${fmt(vig)} = ${fmt(equiv)} moderate-equivalent minutes`,
        `Percent of target = ${fmt(equiv)} ÷ ${fmt(target)} = ${fmt((equiv / target) * 100)}%`,
        met ? `You are ${fmt(equiv - target)} minutes above the target.` : `Shortfall = ${fmt(target)} − ${fmt(equiv)} = ${fmt(short)} moderate minutes, or ${fmt(shortVig)} vigorous minutes`,
        muscleMet ? `Muscle strengthening: ${fmt(muscleDays)} days meets the 2 day guideline.` : `Muscle strengthening: ${fmt(muscleDays)} days is under the 2 day guideline.`,
      ],
      note: 'A general guide based on the adult guideline, not medical advice. Talk to a clinician before big changes, especially with a health condition.',
    };
  },
  content: {
    formula: [
      'Moderate-equivalent minutes = moderate minutes + 2 × vigorous minutes',
      'Percent of target = equivalent minutes ÷ target',
      'Shortfall = max(0, target − equivalent); in vigorous minutes = shortfall ÷ 2',
    ],
    body: [
      'The US Physical Activity Guidelines for Americans (HHS, 2nd edition) advise adults to get at least 150 to 300 minutes of moderate-intensity activity a week, or 75 to 150 minutes of vigorous activity, or an equivalent mix. One vigorous minute counts as two moderate minutes.',
      'The guidelines also advise muscle-strengthening activity on 2 or more days a week. That is tracked separately here and does not change the minutes total.',
      'Enter your typical week. The calculator shows how close you are to the target and how many extra moderate or vigorous minutes would close the gap. Treat it as a general guide, not medical advice.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: '90 moderate minutes plus 40 vigorous minutes is 90 + 2 × 40 = 170 moderate-equivalent minutes. That is 113.3% of the 150 minute target, 20 minutes above it.' },
      { q: 'What if I am short?', a: 'With 100 moderate and 20 vigorous minutes you have 140 equivalent minutes, 93.3% of 150. You are 10 moderate minutes short, or 5 vigorous minutes.' },
      { q: 'Why does vigorous count double?', a: 'The guideline treats 75 minutes of vigorous activity as equal to 150 minutes of moderate activity, so each vigorous minute counts as 2.' },
      { q: 'How much is too little or enough?', a: 'The guideline minimum for adults is 150 moderate-equivalent minutes a week. Benefits keep growing up to about 300, which is shown as the second marker on the chart.' },
    ],
    sources: [
      { label: 'HHS Physical Activity Guidelines for Americans, 2nd edition', url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines' },
      { label: 'CDC: Adult activity overview', url: 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html' },
    ],
  },
  related: ['steps-to-distance', 'step-goal-ramp', 'calories-burned'],
  examples: [
    // 90 + 2*40 = 170; 170/150 = 1.13333; no shortfall
    { values: { mod: 90, vig: 40, target: 150, muscle: 2 }, expect: { equiv: 170, pct: 1.1333, short: 0, shortVig: 0 }, tolerance: 0.001 },
    // 100 + 2*20 = 140; 140/150 = 0.93333; short 10 moderate = 5 vigorous
    { values: { mod: 100, vig: 20, target: 150, muscle: 2 }, expect: { equiv: 140, pct: 0.9333, short: 10, shortVig: 5 }, tolerance: 0.001 },
  ],
});

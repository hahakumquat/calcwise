import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const LOAD_PER_KG = 0.3; // g per kg per day, loading
const MAINT_PER_KG = 0.03; // g per kg per day, maintenance
const FLAT_LOW = 3; // g per day, usual flat range
const FLAT_HIGH = 5;

export default defineCalculator({
  slug: 'creatine-dose',
  title: 'Creatine Dose Calculator',
  category: 'health',
  description: 'Turn your body weight into a creatine loading dose (0.3 g per kg) and a daily maintenance dose, and see how long a tub lasts. General info only.',
  keywords: ['creatine dose calculator', 'creatine loading phase', 'how much creatine per day', 'creatine maintenance dose', 'creatine monohydrate dosage', 'how long does a tub of creatine last'],
  inputs: [
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'kg', default: 80, min: 0, info: 'Your current body weight. Doses are based on grams per kilogram.' },
    { id: 'loading', label: 'Include a loading phase', type: 'toggle', default: true, info: 'On: a short phase of higher daily doses first. Off: go straight to the daily maintenance dose. Loading is optional.' },
    { id: 'days', label: 'Loading days', type: 'number', default: 5, min: 5, max: 7, step: 1, suffix: 'days', showWhen: { input: 'loading', is: 'on' }, info: 'How long the loading phase lasts. The position stand describes 5 to 7 days.' },
    { id: 'tub', label: 'Tub size', type: 'number', default: 300, min: 0, step: 10, suffix: 'g', info: 'Grams of powder in the tub, from the label. 300 g is a common size.' },
  ],
  outputs: [
    { id: 'loadDaily', label: 'Loading dose per day', precision: 1, suffix: 'g/day', primary: true, showWhen: { input: 'loading', is: 'on' }, info: '0.3 g times your weight in kg. The position stand splits it into about four servings across the day.' },
    { id: 'maintDaily', label: 'Daily dose', precision: 1, suffix: 'g/day', primary: true, showWhen: { input: 'loading', is: 'off' }, info: 'The daily maintenance dose used here: 0.03 g per kg, kept inside the usual flat range of 3 to 5 g.' },
    { id: 'serving', label: 'Per serving (4 a day)', precision: 1, suffix: 'g', showWhen: { input: 'loading', is: 'on' }, info: 'The loading dose divided into four servings.' },
    { id: 'loadTotal', label: 'Total over the loading phase', precision: 1, suffix: 'g', showWhen: { input: 'loading', is: 'on' }, info: 'Daily loading dose times the number of loading days.' },
    { id: 'maintByWeight', label: 'Maintenance by weight', precision: 2, suffix: 'g/day', info: '0.03 g times your weight in kg, before any rounding into the usual 3 to 5 g range.' },
    { id: 'maintDose', label: 'Maintenance dose used', precision: 1, suffix: 'g/day', showWhen: { input: 'loading', is: 'on' }, info: 'The weight-based figure, kept between 3 g and 5 g, the usual flat range.' },
    { id: 'tubDays', label: 'Tub lasts at maintenance', precision: 0, suffix: 'days', info: 'Tub size divided by the maintenance dose used. It does not include loading.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const on = String(v.loading) === 'on';
    const days = on ? num(v.days) : 0;
    const tub = num(v.tub);
    if (kg === null || kg <= 0 || tub === null || tub <= 0) return { loadDaily: null, maintDaily: null };
    if (on && (days === null || days < 5 || days > 7 || !Number.isInteger(days))) {
      return { loadDaily: null, maintDaily: null, error: 'Loading days must be a whole number from 5 to 7.' };
    }
    const loadDaily = LOAD_PER_KG * kg;
    const serving = loadDaily / 4;
    const loadTotal = loadDaily * (days ?? 0);
    const maintByWeight = MAINT_PER_KG * kg;
    const maintDose = Math.min(FLAT_HIGH, Math.max(FLAT_LOW, maintByWeight));
    const tubDays = Math.floor(tub / maintDose + 1e-9);
    const g1 = (n: number) => +n.toFixed(1);
    const steps = [`${+kg.toFixed(2)} kg × ${MAINT_PER_KG} g/kg = ${+maintByWeight.toFixed(2)} g/day by weight, kept between ${FLAT_LOW} and ${FLAT_HIGH} g = ${g1(maintDose)} g/day`];
    if (on) {
      steps.unshift(
        `Loading = ${+kg.toFixed(2)} kg × ${LOAD_PER_KG} g/kg = ${g1(loadDaily)} g/day, as 4 servings of ${g1(serving)} g`,
        `Over ${days} days = ${g1(loadTotal)} g`,
      );
    }
    steps.push(`Tub = ${tub} g ÷ ${g1(maintDose)} g/day = ${tubDays} days`);
    const chart = on
      ? { type: 'bar' as const, title: 'Grams per day', categories: ['Loading', 'Maintenance'], series: [{ name: 'Creatine', values: [g1(loadDaily), g1(maintDose)] }], format: { format: 'number' as const, suffix: ' g' } }
      : undefined;
    return {
      loadDaily: on ? loadDaily : null,
      maintDaily: maintDose,
      serving: on ? serving : null,
      loadTotal: on ? loadTotal : null,
      maintByWeight,
      maintDose,
      tubDays,
      ...(chart ? { chart } : {}),
      tone: 'ok' as const,
      badge: on ? `${g1(loadDaily)} g/day loading` : `${g1(maintDose)} g/day`,
      note: 'General information, not medical advice. If you have kidney or other medical conditions, ask a clinician before using creatine.',
      steps,
    };
  },
  content: {
    formula: [
      'Loading dose (g/day) = 0.3 × body weight (kg), for 5 to 7 days, split into about 4 servings',
      'Maintenance (g/day) = 0.03 × body weight (kg), kept between 3 and 5 g',
      'Loading total = daily loading dose × loading days',
      'Tub days = tub size (g) ÷ maintenance dose (g/day)',
    ],
    body: [
      'The doses here follow the creatine position stand of the International Society of Sports Nutrition (Kreider and colleagues, 2017): about 0.3 g per kg of body weight per day for 5 to 7 days to load, then about 0.03 g per kg per day to maintain. You can check the paper at jissn.biomedcentral.com. We have not reproduced it here, so confirm the figures yourself.',
      'Loading is optional. Taking a flat 3 to 5 g a day without loading is a common alternative and takes longer, roughly a month, to reach similar muscle stores. For most adults the weight-based maintenance figure is below 3 g, so this calculator shows the 3 g floor of the usual flat range as the dose it uses, and caps it at 5 g.',
      'This is general information, not medical advice. If you have kidney disease or any other medical condition, or you take medication, ask a clinician before using creatine. Nothing here promises any benefit or result.',
    ],
    faq: [
      { q: 'How much creatine is a loading dose for an 80 kg person?', a: '0.3 g × 80 kg = 24 g a day, usually taken as 4 servings of 6 g. Over 5 days that is 120 g.' },
      { q: 'What is the maintenance dose for 80 kg?', a: '0.03 g × 80 kg = 2.4 g by weight. The calculator keeps the dose within the usual flat range of 3 to 5 g, so it shows 3 g a day.' },
      { q: 'How long does a 300 g tub last?', a: 'At 3 g a day a 300 g tub lasts 100 days. If you load first, the loading phase uses some of the tub, so it lasts fewer days overall.' },
      { q: 'Do I have to load creatine?', a: 'No. Loading is optional. Taking 3 to 5 g a day without loading reaches similar stores in about a month.' },
      { q: 'What if I enter my weight in pounds?', a: 'It is converted at 0.45359237 kg per lb. 176 lb is 79.83 kg, so loading is 23.9 g a day.' },
      { q: 'Is creatine safe for everyone?', a: 'This is general information, not medical advice. Anyone with kidney or other medical conditions should ask a clinician first.' },
    ],
    sources: [
      { label: 'Kreider RB et al. (2017). International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. Journal of the International Society of Sports Nutrition.' },
    ],
  },
  related: ['protein', 'progressive-overload'],
  examples: [
    // 80 kg: load 0.3*80 = 24 g/day, 6 g per serving, 24*5 = 120 g; by weight 0.03*80 = 2.4 -> floor 3; 300/3 = 100 days
    { values: { weight: 80, loading: 'on', days: 5, tub: 300 }, expect: { loadDaily: 24, serving: 6, loadTotal: 120, maintByWeight: 2.4, maintDose: 3, tubDays: 100 }, tolerance: 1e-6 },
    // 176 lb = 176*0.45359237 = 79.8322 kg; load 0.3*79.8322 = 23.95 g/day (shown 23.9 or 24.0 by rounding); 7 days
    { values: { weight: 79.8322, loading: 'on', days: 7, tub: 300 }, expect: { loadDaily: 23.94966, loadTotal: 167.64762 }, tolerance: 1e-3 },
    // no loading, 200 kg: 0.03*200 = 6 g -> cap 5; 500/5 = 100 days
    { values: { weight: 200, loading: 'off', tub: 500 }, expect: { maintDaily: 5, tubDays: 100 }, tolerance: 1e-6 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const STAGES: Record<string, { label: string; factor: number }> = {
  neutered: { label: 'Neutered adult', factor: 1.6 },
  intact: { label: 'Intact adult', factor: 1.8 },
  inactive: { label: 'Inactive or obese-prone adult', factor: 1.4 },
  loss: { label: 'Weight loss', factor: 1.0 },
  puppy4: { label: 'Puppy under 4 months', factor: 3.0 },
  puppy: { label: 'Puppy over 4 months', factor: 2.0 },
};

export default defineCalculator({
  slug: 'dog-calorie-needs',
  title: 'Dog Calorie Calculator',
  category: 'everyday',
  description: 'Estimate your dog\'s resting and daily calories from weight and life stage, then convert to cups of food per day from your food\'s kcal per cup.',
  keywords: ['dog calorie calculator', 'how many calories does my dog need', 'dog resting energy requirement', 'how much to feed a dog', 'dog food cups per day', 'RER dog', 'puppy calorie calculator'],
  inputs: [
    { id: 'weight', label: 'Dog weight', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'kg', default: 20, min: 0, info: 'Your dog\'s current weight. For a dog that needs to lose weight, many vets work from the target weight.' },
    { id: 'stage', label: 'Life stage', type: 'select', default: 'neutered', options: Object.entries(STAGES).map(([value, s]) => ({ value, label: `${s.label} (x${s.factor})` })), info: 'Picks the multiplier applied to resting energy. These are starting points, not exact needs.' },
    { id: 'kcalCup', label: 'Food calories per cup', type: 'number', default: 350, min: 0, step: 10, suffix: 'kcal/cup', info: 'On the food bag or label as kcal per cup (metabolizable energy). Dry foods are often 300 to 400.' },
  ],
  outputs: [
    { id: 'daily', label: 'Daily calories', primary: true, format: 'number', precision: 0, suffix: 'kcal', info: 'Resting energy times the life-stage factor.' },
    { id: 'cups', label: 'Cups of food per day', format: 'number', precision: 2, info: 'Daily calories divided by the food\'s kcal per cup.' },
    { id: 'rer', label: 'Resting energy (RER)', format: 'number', precision: 0, suffix: 'kcal', info: '70 times weight in kg raised to the power 0.75.' },
    { id: 'factor', label: 'Life-stage factor', format: 'number', precision: 1, info: 'The multiplier for the life stage you chose.' },
    { id: 'perMeal', label: 'Cups per meal (2 meals)', format: 'number', precision: 2, info: 'Cups per day split across two meals.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const kcalCup = num(v.kcalCup);
    const stage = STAGES[String(v.stage)] ?? STAGES.neutered;
    if (kg === null || kcalCup === null) return { daily: null };
    if (kg <= 0) return { daily: null, error: 'Weight must be above 0.' };
    if (kcalCup <= 0) return { daily: null, error: 'Food calories per cup must be above 0.' };
    const rer = 70 * Math.pow(kg, 0.75);
    const daily = rer * stage.factor;
    const cups = daily / kcalCup;
    return {
      daily,
      cups,
      rer,
      factor: stage.factor,
      perMeal: cups / 2,
      chart: {
        type: 'bar',
        title: 'Daily calories by life stage (kcal)',
        categories: ['Weight loss', 'Inactive', 'Neutered', 'Intact'],
        series: [{ name: 'kcal', values: [1.0, 1.4, 1.6, 1.8].map((f) => Math.round(rer * f)) }],
        format: { format: 'number', suffix: ' kcal' },
        highlight: ['loss', 'inactive', 'neutered', 'intact'].indexOf(String(v.stage)),
      },
      tone: 'ok',
      badge: `${Math.round(daily)} kcal/day`,
      note: 'A starting point only. Treats count toward the total, and your vet decides for puppies, seniors and dogs with health conditions.',
      steps: [
        `RER = 70 × ${+kg.toFixed(2)}^0.75 = ${Math.round(rer)} kcal`,
        `Daily calories = ${Math.round(rer)} × ${stage.factor} (${stage.label.toLowerCase()}) = ${Math.round(daily)} kcal`,
        `Cups = ${Math.round(daily)} ÷ ${kcalCup} kcal per cup = ${cups.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: [
      'RER (kcal) = 70 × weight in kg ^ 0.75',
      'Daily calories = RER × life-stage factor',
      'Cups per day = daily calories ÷ food kcal per cup',
    ],
    body: [
      'Veterinary nutrition guidance, including the WSAVA global nutrition guidelines and the National Research Council\'s nutrient requirements for dogs and cats, starts from resting energy requirement (RER): 70 × body weight in kg to the power 0.75. A multiplier for life stage and activity then gives a daily estimate. Check the current wording at wsava.org; the factors here are common starting points rather than exact quotes.',
      'The factors used here are 1.6 for a neutered adult, 1.8 for an intact adult, 1.4 for an inactive or obese-prone adult, 1.0 for weight loss, 3.0 for a puppy under 4 months and 2.0 for a puppy over 4 months. Real dogs vary widely with breed, age, activity and body condition, so watch your dog\'s weight and body shape and adjust with your vet.',
      'Treats, chews and food used for training count toward the daily total, so reduce meals to match. This is general information, not veterinary advice. Puppies, senior dogs and dogs with health conditions should have their plan set by a vet.',
    ],
    faq: [
      { q: 'How many calories does a 20 kg neutered dog need?', a: '20^0.75 is about 9.457, so RER is about 662 kcal. Times 1.6 for a neutered adult is about 1,059 kcal a day, or 3.03 cups at 350 kcal per cup.' },
      { q: 'What if my dog needs to lose weight?', a: 'At the weight-loss factor of 1.0, a 20 kg dog gets about 662 kcal a day, or 1.89 cups at 350 kcal per cup. Ask your vet to set the target weight and plan.' },
      { q: 'Does this include treats?', a: 'No. Treats count, so subtract their calories from the daily total or reduce the cups.' },
      { q: 'How do I find kcal per cup?', a: 'It is printed on the bag or the maker\'s website, usually as kcal/cup or ME. Foods differ a lot, so check your own.' },
      { q: 'What if I enter weight in pounds?', a: 'It is converted at 0.45359237 kg per lb. 44 lb is about 19.96 kg.' },
    ],
    sources: [
      { label: 'WSAVA Global Nutrition Committee. Global Nutrition Guidelines.' },
      { label: 'National Research Council (2006). Nutrient Requirements of Dogs and Cats. National Academies Press.' },
    ],
  },
  related: ['pet-food-duration', 'dog-age-human'],
  examples: [
    // 20^0.75 = e^(0.75*ln 20) = e^2.2468 = 9.4574; RER = 662.02; x1.6 = 1059.2; /350 = 3.0264
    { values: { weight: 20, stage: 'neutered', kcalCup: 350 }, expect: { rer: 662.02, daily: 1059.23, cups: 3.0264, factor: 1.6 }, tolerance: 0.01 },
    // weight loss x1.0: 662.02 kcal; /350 = 1.8915
    { values: { weight: 20, stage: 'loss', kcalCup: 350 }, expect: { daily: 662.02, cups: 1.8915 }, tolerance: 0.01 },
    // 16 kg: 16^0.75 = 8; RER = 560; puppy over 4 months x2 = 1120; /400 = 2.8
    { values: { weight: 16, stage: 'puppy', kcalCup: 400 }, expect: { rer: 560, daily: 1120, cups: 2.8, perMeal: 1.4 }, tolerance: 1e-6 },
  ],
});

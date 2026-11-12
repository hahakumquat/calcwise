import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Approximate MET values (Compendium of Physical Activities).
const ACTIVITIES: { value: string; label: string; met: number }[] = [
  { value: 'walk-slow', label: 'Walking, 2.5 mph (4 km/h)', met: 3.0 },
  { value: 'walk', label: 'Walking, 3.5 mph (5.6 km/h) brisk', met: 4.3 },
  { value: 'hike', label: 'Hiking, cross-country', met: 6.0 },
  { value: 'run-5', label: 'Running, 5 mph (12 min/mile)', met: 8.3 },
  { value: 'run-6', label: 'Running, 6 mph (10 min/mile)', met: 9.8 },
  { value: 'run-7.5', label: 'Running, 7.5 mph (8 min/mile)', met: 11.8 },
  { value: 'cycle-leisure', label: 'Cycling, leisurely (< 10 mph)', met: 4.0 },
  { value: 'cycle-moderate', label: 'Cycling, 12–14 mph', met: 8.0 },
  { value: 'cycle-vigorous', label: 'Cycling, 14–16 mph', met: 10.0 },
  { value: 'stationary', label: 'Stationary bike, moderate', met: 6.8 },
  { value: 'swim', label: 'Swimming laps, moderate', met: 5.8 },
  { value: 'swim-hard', label: 'Swimming laps, vigorous', met: 9.8 },
  { value: 'elliptical', label: 'Elliptical trainer, moderate', met: 5.0 },
  { value: 'rowing', label: 'Rowing machine, moderate', met: 7.0 },
  { value: 'weights', label: 'Weight training, general', met: 3.5 },
  { value: 'weights-hard', label: 'Weight training, vigorous', met: 6.0 },
  { value: 'hiit', label: 'Circuit training / HIIT', met: 8.0 },
  { value: 'yoga', label: 'Yoga (hatha)', met: 2.5 },
  { value: 'pilates', label: 'Pilates', met: 3.0 },
  { value: 'dance', label: 'Dancing, aerobic', met: 7.3 },
  { value: 'jump-rope', label: 'Jumping rope, moderate', met: 11.8 },
  { value: 'basketball', label: 'Basketball, game', met: 8.0 },
  { value: 'soccer', label: 'Soccer, casual', met: 7.0 },
  { value: 'tennis', label: 'Tennis, singles', met: 8.0 },
  { value: 'golf', label: 'Golf, walking with clubs', met: 4.8 },
  { value: 'gardening', label: 'Gardening, general', met: 3.8 },
  { value: 'cleaning', label: 'House cleaning, general', met: 3.3 },
];
const DURATIONS = [15, 30, 45, 60, 90]; // minutes

export default defineCalculator({
  slug: 'calories-burned',
  title: 'Calories Burned Calculator',
  category: 'health',
  description: 'Estimate how many calories you burn during walking, running, cycling, swimming, lifting and other activities.',
  keywords: ['calories burned', 'exercise calories', 'MET calculator', 'calories burned walking', 'calories burned running', 'energy expenditure'],
  inputs: [
    {
      id: 'activity',
      label: 'Activity',
      type: 'select',
      default: 'walk',
      options: [...ACTIVITIES.map((a) => ({ value: a.value, label: `${a.label} — ${a.met} MET` })), { value: 'custom', label: 'Other — enter a MET value' }],
      info: 'Pick the closest match. The number after each activity is its MET value — how many times harder than resting it is.',
    },
    { id: 'met', label: 'MET value', type: 'number', default: 5, min: 1, step: 0.1, showWhen: { input: 'activity', is: 'custom' }, info: 'Metabolic equivalent of the activity: 1 is sitting still, 3–6 is moderate effort, above 6 is vigorous. Look it up in the Compendium of Physical Activities.' },
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 170, info: 'Your body weight. Heavier people burn more calories doing the same activity.' },
    { id: 'duration', label: 'Duration', type: 'number', unit: 'time', units: ['min', 'h'], defaultUnit: 'min', default: 30, min: 0, info: 'Time actually spent moving — leave out long rest breaks.' },
  ],
  outputs: [
    { id: 'calories', label: 'Calories burned', primary: true, precision: 0, suffix: 'kcal', info: 'Total energy used during the activity, including what you would have burned at rest anyway.' },
    { id: 'perHour', label: 'Rate', precision: 0, suffix: 'kcal/hour', info: 'Calories per hour at this activity and body weight: MET × weight in kg.' },
    { id: 'netCalories', label: 'Net (above resting)', precision: 0, suffix: 'kcal', help: 'Extra calories beyond what you would have burned sitting still.', info: 'Calories burned beyond your resting rate. Use this figure if you add exercise calories back to a diet budget.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const sec = num(v.duration);
    const met = v.activity === 'custom' ? num(v.met) : (ACTIVITIES.find((a) => a.value === v.activity)?.met ?? null);
    if (!kg || kg <= 0 || sec === null || sec < 0 || !met || met <= 0) return { calories: null };
    const h = sec / 3600;
    const calories = met * kg * h;
    const mins = Math.round(sec / 60);
    const cats = DURATIONS.includes(mins) ? DURATIONS : [...DURATIONS, mins].sort((a, b) => a - b);
    return {
      calories,
      perHour: met * kg,
      netCalories: Math.max(0, met - 1) * kg * h,
      chart: {
        type: 'bar',
        title: 'Calories burned by duration',
        categories: cats.map((m) => `${m} min`),
        series: [{ name: 'Calories', values: cats.map((m) => (met * kg * m) / 60) }],
        format: { format: 'integer', suffix: 'kcal' },
        highlight: cats.indexOf(mins),
      },
      steps: [`Calories = ${met} MET × ${kg.toFixed(1)} kg × ${h.toFixed(2)} h = ${Math.round(calories)} kcal`],
      note: 'MET estimates can be off by 20% or more for an individual; fitness level, terrain and technique all matter.',
    };
  },
  content: {
    formula: ['Calories (kcal) = MET × body weight (kg) × duration (hours)', 'Net calories = (MET − 1) × weight × hours'],
    body: [
      'A MET (metabolic equivalent of task) expresses how hard an activity is compared with sitting quietly, which is defined as 1 MET — roughly 1 kcal per kilogram of body weight per hour. Brisk walking at about 4 MET burns four times as much energy per minute as resting; running at 6 mph burns nearly ten times as much.',
      'The values here come from the Compendium of Physical Activities, a reference list researchers use to standardize energy estimates. Multiply the MET value by your weight and the time spent and you get a reasonable estimate of total calories burned, including the calories you would have burned anyway at rest.',
      'If you are tracking a calorie deficit, the "net" figure is the fairer number to add back, because your resting calories are already included in your TDEE. Heavier people burn more for the same activity, and fitter people often burn a little less because they move more efficiently.',
    ],
    faq: [
      { q: 'Why does my fitness tracker show a different number?', a: 'Trackers combine heart rate, motion and their own formulas, and they often overestimate. Neither method is exact; use one consistently to compare workouts.' },
      { q: 'Does walking a mile burn the same as running a mile?', a: 'Running burns more per mile — roughly 1.5 to 2 times as much at typical speeds — because the bouncing motion takes more energy, though the gap is smaller than the per-minute difference suggests.' },
    ],
  },
  related: ['tdee', 'pace', 'heart-rate-zones', 'weight-loss-goal', 'bmr'],
  examples: [
    { values: { activity: 'run-5', weight: 70, duration: 1800, met: null }, expect: { calories: 290.5, perHour: 581, netCalories: 255.5 }, tolerance: 1e-6 },
    { values: { activity: 'custom', weight: 80, duration: 3600, met: 5 }, expect: { calories: 400 }, tolerance: 1e-6 },
  ],
});

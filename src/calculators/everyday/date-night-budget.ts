import { defineCalculator, type ChartSpec, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'date-night-budget',
  title: 'Date Night Budget Calculator',
  category: 'everyday',
  description: 'Add up food, activity, babysitter and transport for one date night, then see the monthly and yearly cost and your share if you split it.',
  metaDescription: 'Date night budget calculator: total the cost of one night out, then see the monthly and yearly cost, your share if split, and a cheaper alternative.',
  updated: '2026-11-27',
  keywords: ['date night budget calculator', 'how much does date night cost', 'weekly date night cost', 'yearly date night cost', 'date night with babysitter cost'],
  inputs: [
    { id: 'food', label: 'Food and drinks', type: 'number', prefix: '$', default: 60, min: 0, step: 1, info: 'Dinner, drinks and tip for the night.' },
    { id: 'activity', label: 'Activity or tickets', type: 'number', prefix: '$', default: 20, min: 0, step: 1, info: 'Movie, show, game or anything else you pay to do.' },
    { id: 'sitHours', label: 'Babysitter hours', type: 'number', suffix: 'hours', default: 4, min: 0, step: 0.5, optional: true, info: 'Leave at 0 or blank if you do not need a sitter.' },
    { id: 'sitRate', label: 'Babysitter hourly rate', type: 'number', prefix: '$', default: 15, min: 0, step: 0.5, optional: true, info: 'What you pay the sitter each hour.' },
    { id: 'transport', label: 'Transport and parking', type: 'number', prefix: '$', default: 10, min: 0, step: 1, info: 'Fuel, rideshare, parking or transit.' },
    { id: 'nights', label: 'Date nights per month', type: 'number', default: 4, min: 0, step: 0.5, info: 'How often you go out. Weekly is about 4.' },
    { id: 'split', label: 'Split the cost with your partner', type: 'toggle', default: true, info: 'On: your share is half the yearly total.' },
    { id: 'alt', label: 'Cheaper night: cost per night', type: 'number', prefix: '$', min: 0, step: 1, optional: true, placeholder: 'Optional', info: 'Optional. Enter what a cheaper night would cost to see how much you would save a year.' },
  ],
  outputs: [
    { id: 'yearly', label: 'Cost per year', format: 'currency', primary: true, info: 'Cost per night × nights per month × 12.' },
    { id: 'perNight', label: 'Cost per night', format: 'currency', info: 'Food + activity + sitter (hours × rate) + transport.' },
    { id: 'monthly', label: 'Cost per month', format: 'currency', info: 'Cost per night × nights per month.' },
    { id: 'share', label: 'Your share per year', format: 'currency', info: 'Half the yearly total if split, otherwise the full total.' },
    { id: 'saving', label: 'Yearly saving with the cheaper night', format: 'currency', info: 'Yearly cost now minus the yearly cost at the cheaper per-night amount.' },
  ],
  compute: (v) => {
    const food = num(v.food);
    const activity = num(v.activity);
    const transport = num(v.transport);
    const nights = num(v.nights);
    const hours = num(v.sitHours) ?? 0;
    const rate = num(v.sitRate) ?? 0;
    const alt = num(v.alt);
    if (food === null || activity === null || transport === null || nights === null) return { yearly: null };
    if (food < 0 || activity < 0 || transport < 0 || nights < 0 || hours < 0 || rate < 0 || (alt !== null && alt < 0)) {
      return { yearly: null, error: 'Costs and nights cannot be negative.' };
    }
    const sitter = hours * rate;
    const perNight = food + activity + sitter + transport;
    const monthly = perNight * nights;
    const yearly = monthly * 12;
    const split = v.split === 'on';
    const share = split ? yearly / 2 : yearly;
    const out: ComputeResult = {
      yearly, perNight, monthly, share, saving: null,
      tone: 'ok',
      badge: `${money(perNight)} a night`,
    };
    const steps = [
      `Per night = ${money(food)} + ${money(activity)} + ${money(sitter)} sitter + ${money(transport)} = ${money(perNight)}`,
      `Per year = ${money(perNight)} × ${nights} nights × 12 = ${money(yearly)}`,
      split ? `Your share = ${money(yearly)} ÷ 2 = ${money(share)}` : 'Not split: you cover the full total.',
    ];
    const slices = [
      { label: 'Food and drinks', value: food * nights * 12 },
      { label: 'Activity', value: activity * nights * 12 },
      { label: 'Babysitter', value: sitter * nights * 12 },
      { label: 'Transport', value: transport * nights * 12 },
    ].filter((s) => s.value > 0);
    const charts: ChartSpec[] = [];
    if (slices.length) {
      charts.push({ type: 'donut', title: 'Where the year goes', slices, format: { format: 'currency' }, centerLabel: 'Per year', centerValue: money(yearly) });
    }
    if (alt !== null) {
      const altYearly = alt * nights * 12;
      out.saving = yearly - altYearly;
      steps.push(`Cheaper night: ${money(alt)} × ${nights} × 12 = ${money(altYearly)}, a difference of ${money(yearly - altYearly)} a year`);
      charts.push({
        type: 'bar',
        title: 'Yearly cost: now vs cheaper night',
        categories: ['Now', 'Cheaper night'],
        series: [{ name: 'Per year', values: [yearly, altYearly] }],
        format: { format: 'currency' },
      });
    }
    out.steps = steps;
    if (charts.length) out.chart = charts;
    return out;
  },
  content: {
    formula: ['Per night = food + activity + (sitter hours × rate) + transport', 'Per year = per night × nights per month × 12', 'Your share = per year ÷ 2 (if split)'],
    body: [
      'One dinner out feels small, but a regular date night adds up over a year. This calculator totals everything you spend on a night out, including a babysitter and getting there, then scales it to a month and a year.',
      'For example, $60 on food, $20 on an activity, a 4-hour sitter at $15 an hour ($60) and $10 on transport comes to $150 a night. At 2 nights a month that is $3,600 a year, or $1,800 each if you split it. At 4 nights a month it is $7,200.',
      'Add a cheaper per-night amount, such as a movie at home or a picnic, to see what a lower-cost night would save across the year.',
    ],
    faq: [
      { q: 'How much does a weekly date night cost?', a: 'With the default costs of $150 a night and 4 nights a month, it is $600 a month and $7,200 a year, before splitting.' },
      { q: 'How is the babysitter cost worked out?', a: 'Hours × hourly rate. 4 hours at $15 an hour is $60 per night.' },
      { q: 'What does splitting do?', a: 'It halves the yearly total to show your share. $3,600 a year becomes $1,800 each.' },
      { q: 'How do I see what a cheaper night would save?', a: 'Enter a lower cost per night in the cheaper-night box. The calculator multiplies it by the same number of nights and shows the yearly difference.' },
    ],
    sources: [],
  },
  related: ['eating-out-cost', 'latte-factor'],
  examples: [
    // per night 60+20+4*15+10 = 150; 2 nights x 12 = 24 -> 3600; share 1800; month 300
    { values: { food: 60, activity: 20, sitHours: 4, sitRate: 15, transport: 10, nights: 2, split: 'on' }, expect: { perNight: 150, monthly: 300, yearly: 3600, share: 1800 }, tolerance: 0.001 },
    // 150 x 4 x 12 = 7200, not split; cheaper night 80 -> 80x48 = 3840; saving 3360
    { values: { food: 60, activity: 20, sitHours: 4, sitRate: 15, transport: 10, nights: 4, split: 'off', alt: 80 }, expect: { perNight: 150, yearly: 7200, share: 7200, saving: 3360 }, tolerance: 0.001 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'degree-payback',
  title: 'Degree Payback: Years to Earn Back the Cost',
  seoTitle: 'Degree Payback Calculator',
  metaDescription: 'See how many years a degree or bootcamp takes to pay for itself. Enter tuition, pay given up while studying and your after-tax salary uplift to see payback.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Add tuition and the pay you give up while studying, then divide by your after-tax salary uplift to see how many years until a degree breaks even.',
  keywords: ['degree payback calculator', 'is a master\'s degree worth it calculator', 'bootcamp payback period', 'return on education calculator', 'years to recoup tuition'],
  popular: false,
  inputs: [
    { id: 'tuition', label: 'Tuition and fees (total)', type: 'number', prefix: '$', default: 40000, min: 0, step: 500, info: 'Everything you pay the school over the whole program.' },
    { id: 'years', label: 'Years in school', type: 'number', default: 2, min: 0, step: 0.5, info: 'How long the program takes.' },
    { id: 'forgone', label: 'Pay given up per year while studying', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'Salary you would have earned. Enter 0 if you keep working full time.' },
    { id: 'uplift', label: 'Yearly salary uplift after the degree (before tax)', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'How much more per year you expect to earn than without the degree. Your own estimate.' },
    { id: 'tax', label: 'Tax rate on the uplift', type: 'number', suffix: '%', default: 25, min: 0, max: 90, step: 0.5, info: 'Your marginal rate on the extra pay.' },
    { id: 'working', label: 'Working years left after graduating', type: 'number', default: 30, min: 0, step: 1, info: 'Used for the lifetime gain.' },
  ],
  outputs: [
    { id: 'payback', label: 'Payback time after graduating (years)', format: 'number', precision: 2, primary: true, info: 'Total cost ÷ after-tax uplift per year.' },
    { id: 'cost', label: 'Total cost', format: 'currency', precision: 0, info: 'Tuition + years in school × pay given up.' },
    { id: 'net', label: 'After-tax uplift per year', format: 'currency', precision: 0, info: 'Uplift × (1 − tax rate).' },
    { id: 'gain', label: 'Net gain over your working years', format: 'currency', precision: 0, info: 'After-tax uplift × working years − total cost. Negative means a net loss.' },
  ],
  compute: (v) => {
    const tuition = num(v.tuition), years = num(v.years), forgone = num(v.forgone), uplift = num(v.uplift), tax = num(v.tax), working = num(v.working);
    if ([tuition, years, forgone, uplift, tax, working].some((x) => x === null)) return { payback: null };
    if ([tuition!, years!, forgone!, uplift!, tax!, working!].some((x) => x < 0)) return { payback: null, error: 'Amounts cannot be negative.' };
    if (tax! >= 100) return { payback: null, error: 'Tax rate must be under 100%.' };
    const cost = tuition! + years! * forgone!;
    const net = uplift! * (1 - tax! / 100);
    const gain = net * working! - cost;
    if (net <= 0) {
      return { payback: null, cost, net, gain, error: 'With no uplift the degree never pays back. Enter a yearly uplift above 0.' };
    }
    const payback = cost / net;
    const fits = payback <= working!;
    return {
      payback,
      cost,
      net,
      gain,
      tone: fits ? 'good' : 'bad',
      badge: fits ? `Breaks even in ${payback.toFixed(1)} years` : 'Does not break even in your working years',
      chart: {
        type: 'bar',
        title: 'Cost vs what the uplift earns back',
        categories: ['Total cost', 'After-tax uplift over working years'],
        series: [{ name: 'Dollars', values: [+cost.toFixed(0), +(net * working!).toFixed(0)] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Cost = ${money(tuition!, 0)} + ${years} × ${money(forgone!, 0)} = ${money(cost, 0)}`,
        `After-tax uplift = ${money(uplift!, 0)} × (1 − ${tax}%) = ${money(net, 0)} a year`,
        `Payback = ${money(cost, 0)} ÷ ${money(net, 0)} = ${payback.toFixed(2)} years after graduating`,
        `Gain over ${working} years = ${money(net, 0)} × ${working} − ${money(cost, 0)} = ${money(gain, 0)}`,
      ],
      note: 'An illustration of your own inputs, not an expected outcome. It ignores loan interest, raises over time, and the chance the uplift is smaller or later than you hope.',
    };
  },
  content: {
    formula: [
      'Total cost = tuition + years in school × pay given up per year',
      'After-tax uplift = yearly uplift × (1 − tax rate)',
      'Payback years = total cost ÷ after-tax uplift',
      'Net gain = after-tax uplift × working years − total cost',
    ],
    body: [
      'A degree costs more than the tuition bill. If you leave a job to study, the pay you give up is part of the price. This calculator adds both, then divides by the extra after-tax pay the degree brings to show how long it takes to earn the money back.',
      'Say tuition is $40,000, the program takes 2 years and you give up $50,000 a year. The total cost is $140,000. If the degree lifts your pay by $20,000 a year and you keep 75% after tax, that is $15,000 a year, so payback is 140,000 ÷ 15,000 = 9.33 years. Over 30 working years the net gain is $310,000.',
      'The uplift is the number that matters most, and it is your own estimate. Try a lower figure to see how fragile the result is.',
    ],
    sections: [
      {
        heading: 'What this leaves out',
        paragraphs: [
          'Loan interest raises the real cost, so pair this with the student loan payoff calculator. Raises over time, promotions and the value of a career change are not counted. To compare two specific offers, use the job offer comparison calculator, and to plan the credits you need, use the credits to graduate calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How long does a $140,000 degree take to pay back?', a: 'If it adds $20,000 a year before tax and you pay 25% tax on the extra, you keep $15,000 a year, so payback is 140,000 ÷ 15,000 = 9.33 years after graduating.' },
      { q: 'Why include pay I give up while studying?', a: 'It is a real cost of the program. If you keep working full time, enter 0 and only tuition counts.' },
      { q: 'What if the uplift is zero?', a: 'Then the degree never pays back in money terms, and the calculator asks for an uplift above 0.' },
      { q: 'Does this say whether a degree is worth it?', a: 'No. It only shows the money side for the numbers you enter. Interest, career satisfaction and job security are not included.' },
    ],
    sources: [
      { label: 'US Bureau of Labor Statistics: Education pays', url: 'https://www.bls.gov/emp/chart-unemployment-earnings-education.htm' },
    ],
  },
  related: ['student-loan-payoff', 'job-offer-comparison', 'credits-to-graduate', 'raise-calculator'],
  examples: [
    // cost 40000+2*50000=140000; net 20000*.75=15000; payback 9.333333; gain 15000*30-140000=310000
    { values: { tuition: 40000, years: 2, forgone: 50000, uplift: 20000, tax: 25, working: 30 }, expect: { payback: 140000 / 15000, cost: 140000, net: 15000, gain: 310000 }, tolerance: 1e-6 },
    // cost 12000; net 10000*.8=8000; payback 1.5; gain 8000*5-12000=28000
    { values: { tuition: 12000, years: 0.5, forgone: 0, uplift: 10000, tax: 20, working: 5 }, expect: { payback: 1.5, cost: 12000, net: 8000, gain: 28000 }, tolerance: 1e-6 },
  ],
});

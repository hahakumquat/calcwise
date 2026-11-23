import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'home-gym-payback',
  title: 'Home Gym Payback Calculator',
  seoTitle: 'Home Gym Payback Calculator',
  metaDescription: 'How many months until a home gym costs less than a gym membership? Enter the equipment price, upkeep and monthly fee to find the break-even point.',
  updated: '2026-11-23',
  category: 'health',
  description: 'Find the month when buying home gym equipment beats paying a gym membership, and how much you save or lose over the period you choose.',
  keywords: ['home gym payback calculator', 'home gym vs gym membership', 'is a home gym worth it', 'home gym break even', 'gym membership vs buying equipment'],
  popular: false,
  inputs: [
    { id: 'equipment', label: 'Home gym equipment cost', type: 'number', prefix: '$', default: 1200, min: 0, step: 50, info: 'Everything you would buy up front: rack, weights, bench, mats.' },
    { id: 'upkeep', label: 'Home gym upkeep per month', type: 'number', prefix: '$', default: 10, min: 0, step: 1, info: 'Replacement bands, cleaning, a streaming class, extra electricity. Enter 0 if none.' },
    { id: 'fee', label: 'Gym membership per month', type: 'number', prefix: '$', default: 50, min: 0, step: 1, info: 'What you pay now or would pay to join.' },
    { id: 'joining', label: 'Joining or annual fees per year', type: 'number', prefix: '$', default: 0, min: 0, step: 5, info: 'Sign-up, annual or card fees, spread over twelve months. Enter 0 if none.' },
    { id: 'horizon', label: 'Months to compare', type: 'number', default: 36, min: 1, max: 120, step: 1, info: 'How long you expect to keep training.' },
  ],
  outputs: [
    { id: 'months', label: 'Months to break even', format: 'number', precision: 1, primary: true, info: 'Equipment cost ÷ (membership + yearly fees ÷ 12 - upkeep). Blank if the home gym never pays back.' },
    { id: 'saving', label: 'Saving per month once bought', format: 'currency', precision: 2, info: 'Membership + yearly fees ÷ 12 - upkeep.' },
    { id: 'net', label: 'Net result over the period', format: 'currency', info: 'Gym costs over the period minus home costs over the period. Negative means the home gym costs more.' },
    { id: 'gymTotal', label: 'Membership cost over the period', format: 'currency', info: 'Monthly cost × months.' },
    { id: 'homeTotal', label: 'Home gym cost over the period', format: 'currency', info: 'Equipment + upkeep × months.' },
  ],
  compute: (v) => {
    const eq = num(v.equipment), up = num(v.upkeep), fee = num(v.fee), join = num(v.joining), h = num(v.horizon);
    if ([eq, up, fee, join, h].some((x) => x === null)) return { months: null };
    if ([eq!, up!, fee!, join!].some((x) => x < 0)) return { months: null, error: 'Amounts cannot be negative.' };
    if (h! < 1) return { months: null, error: 'Compare at least 1 month.' };
    const gymMonthly = fee! + join! / 12;
    const saving = gymMonthly - up!;
    const gymTotal = gymMonthly * h!;
    const homeTotal = eq! + up! * h!;
    const net = gymTotal - homeTotal;
    const never = saving <= 0 && eq! > 0;
    const months = eq! === 0 ? 0 : never ? null : eq! / saving;
    const n = Math.min(Math.max(Math.ceil(h!), 1), 120);
    const x = Array.from({ length: n + 1 }, (_, i) => i);
    return {
      months, saving, net, gymTotal, homeTotal,
      tone: never || net < 0 ? 'warn' : 'ok',
      badge: never ? 'The home gym never pays back at these costs' : months === 0 ? 'No equipment cost' : `Pays back after ${+months!.toFixed(1)} months`,
      chart: {
        type: 'line',
        title: 'Total cost over time',
        x,
        xLabel: 'Months',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Membership', values: x.map((m) => gymMonthly * m) },
          { name: 'Home gym', values: x.map((m) => eq! + up! * m) },
        ],
        markers: months !== null && months > 0 && months <= n ? [{ x: Math.round(months), label: 'Break-even' }] : undefined,
      },
      steps: [
        `Monthly gym cost = ${money(fee!, 2)} + ${money(join!, 2)} ÷ 12 = ${money(gymMonthly, 2)}`,
        `Saving per month = ${money(gymMonthly, 2)} - ${money(up!, 2)} upkeep = ${money(saving, 2)}`,
        never ? 'The saving is not positive, so the equipment never pays for itself' : `Break-even = ${money(eq!, 0)} ÷ ${money(saving, 2)} = ${+months!.toFixed(1)} months`,
      ],
      note: 'Only money is counted. Travel time, motivation and equipment resale value are not included. Prices are your own inputs.',
    };
  },
  content: {
    formula: [
      'Monthly gym cost = membership + yearly fees ÷ 12',
      'Saving per month = monthly gym cost - home upkeep',
      'Break-even months = equipment cost ÷ saving per month',
    ],
    body: [
      'A home gym is a one-off purchase that replaces a recurring fee. It pays back once the membership you avoided adds up to what you spent on equipment, after subtracting any upkeep.',
      'Enter your equipment budget, the membership fee and any yearly fees, and the calculator gives the break-even month and the net result over the period you pick. The line chart shows both totals so you can see where they cross.',
      'Money is not the whole story. A cheaper option you never use costs more than a dearer one you do, and this page only compares costs. The gym cost per visit calculator shows what a membership costs per workout.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Equipment costs $1,200, upkeep is $10 a month and the membership is $50 with no extra fees. You save $50 - $10 = $40 a month, so the break-even is $1,200 ÷ $40 = 30 months.',
          'Over 36 months the membership costs $1,800 and the home gym costs $1,200 + $360 = $1,560, so you come out $240 ahead.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'Use the gym cost per visit calculator to see what your membership costs per workout, and the subscription cost calculator to total other monthly fees.',
        ],
      },
    ],
    faq: [
      { q: 'How long does a home gym take to pay off?', a: 'Divide the equipment cost by the monthly saving. $1,200 of equipment against a $50 membership with $10 of upkeep pays back in 30 months.' },
      { q: 'What if the home gym never pays back?', a: 'If upkeep is as high as the membership, there is no monthly saving and the equipment never pays for itself. The calculator says so instead of showing a number.' },
      { q: 'Does resale value count?', a: 'No. Used equipment often sells for something, which would shorten the payback, but the value varies too much to guess. Subtract it from the cost yourself if you want.' },
      { q: 'Are yearly fees included?', a: 'Yes. Enter the total of sign-up, annual and card fees per year and the calculator spreads it over twelve months.' },
    ],
    sources: [],
  },
  related: ['gym-cost-per-visit', 'subscription-cost', 'latte-factor', 'calories-burned'],
  examples: [
    // gym 50; saving 40; months 1200/40=30; 36mo: gym 1800, home 1200+360=1560, net 240
    { values: { equipment: 1200, upkeep: 10, fee: 50, joining: 0, horizon: 36 }, expect: { months: 30, saving: 40, gymTotal: 1800, homeTotal: 1560, net: 240 }, tolerance: 1e-6 },
    // with $120/yr fees: gym 60/mo; saving 50; months 1000/50=20; 24mo: gym 1440, home 1000+240=1240, net 200
    { values: { equipment: 1000, upkeep: 10, fee: 50, joining: 120, horizon: 24 }, expect: { months: 20, saving: 50, gymTotal: 1440, homeTotal: 1240, net: 200 }, tolerance: 1e-6 },
  ],
});

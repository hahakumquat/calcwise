import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'draft-sealing-payback',
  title: 'Draft Sealing Payback Calculator',
  category: 'everyday',
  description: 'Estimate how many months weatherstripping or caulk takes to pay for itself, from your yearly heating bill, a guessed percent saved and the cost of materials.',
  keywords: ['draft sealing payback', 'weatherstripping payback', 'is weatherstripping worth it', 'window film payback', 'caulk and seal drafts savings'],
  updated: '2026-11-26',
  inputs: [
    { id: 'bill', label: 'Yearly heating cost', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'What you spend on heating in a typical year, from your gas, oil or electric bills.' },
    { id: 'pct', label: 'Percent of heating cost saved', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'Your own guess. Real savings depend on the house and how leaky it is; an energy audit gives a better estimate.' },
    { id: 'materials', label: 'Cost of materials', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'Weatherstripping, caulk, door sweeps, window film and so on.' },
    { id: 'hours', label: 'Hours of DIY work', type: 'number', suffix: 'h', default: 0, min: 0, step: 0.5, optional: true, info: 'Time you spend installing it. Leave at 0 to ignore your time.' },
    { id: 'rate', label: 'Value of an hour', type: 'number', prefix: '$', suffix: '/h', default: 0, min: 0, step: 1, optional: true, info: 'What an hour of your time is worth to you. Leave at 0 to count only materials.' },
    { id: 'years', label: 'Years to project', type: 'number', default: 10, min: 1, max: 30, step: 1, info: 'How long you expect the sealing to last.' },
  ],
  outputs: [
    { id: 'paybackMonths', label: 'Payback time', format: 'number', precision: 1, suffix: 'months', primary: true, info: 'Upfront cost ÷ yearly savings × 12.' },
    { id: 'saved', label: 'Estimated savings per year', format: 'currency', info: 'Yearly heating cost × percent saved.' },
    { id: 'upfront', label: 'Upfront cost', format: 'currency', info: 'Materials plus hours × value of an hour.' },
    { id: 'net', label: 'Net after the projection', format: 'currency', info: 'Savings per year × years − upfront cost.' },
  ],
  compute: (v) => {
    const bill = num(v.bill), pct = num(v.pct), mat = num(v.materials), years = num(v.years);
    const hrs = num(v.hours) ?? 0, rate = num(v.rate) ?? 0;
    if ([bill, pct, mat, years].some((x) => x === null)) return { paybackMonths: null };
    if ((bill as number) <= 0 || (pct as number) <= 0 || (pct as number) > 100 || (mat as number) < 0 || hrs < 0 || rate < 0 || (years as number) < 1) return { paybackMonths: null };
    const saved = (bill as number) * ((pct as number) / 100);
    const upfront = (mat as number) + hrs * rate;
    const paybackMonths = (upfront / saved) * 12;
    const net = saved * (years as number) - upfront;
    const n = Math.min(30, Math.floor(years as number));
    const x = Array.from({ length: n + 1 }, (_, i) => i);
    return {
      paybackMonths,
      saved,
      upfront,
      net,
      tone: net >= 0 ? 'good' : 'warn',
      badge: net >= 0 ? 'Pays back' : 'No payback in time',
      note: `This is an estimate. The ${fmt(pct as number, 1)}% saved is your guess, and real savings depend on the house and are usually measured by an energy audit.`,
      chart: {
        type: 'line' as const,
        title: 'Net savings after upfront cost',
        x,
        xLabel: 'Years',
        yFormat: CURRENCY,
        series: [{ name: 'Net savings', values: x.map((i) => saved * i - upfront) }],
      },
      steps: [
        `Saved a year = ${money(bill as number)} × ${fmt(pct as number, 1)}% = ${money(saved)}`,
        `Upfront = ${money(mat as number)} + ${fmt(hrs)} h × ${money(rate)} = ${money(upfront)}`,
        `Payback = ${money(upfront)} ÷ ${money(saved)} × 12 = ${fmt(paybackMonths)} months`,
        `Net after ${fmt(years as number, 0)} years = ${money(saved)} × ${fmt(years as number, 0)} − ${money(upfront)} = ${money(net)}`,
      ],
    };
  },
  content: {
    formula: [
      'Saved a year = yearly heating cost × percent saved',
      'Upfront cost = materials + hours of work × value of an hour',
      'Payback months = upfront cost ÷ saved a year × 12',
      'Net after N years = saved a year × N − upfront cost',
    ],
    body: [
      'Sealing drafts around doors and windows is one of the cheapest home jobs, but how much it saves is hard to know. This calculator turns your own guess at the percent saved into a payback time in months and a net figure after a number of years.',
      'The percent is the soft spot. A leaky older house may save more and a tight one far less, and an energy audit is the usual way to get a real number. Try a low and a high guess to see the range.',
      'Your time is optional. Add the hours and a value per hour if you want it counted as a cost. This is a rough estimate, not a quote. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How long does draft sealing take to pay back?', a: 'It depends on your guess. With the defaults, $1,800 a year at 10% saved is $180 a year, so $60 of materials pays back in 4 months.' },
      { q: 'What would I save over 10 years?', a: 'With the defaults, $180 × 10 = $1,800, minus the $60 upfront, is a net $1,740. This is an estimate and assumes the savings last.' },
      { q: 'What if I count my time?', a: 'Add the hours and an hourly value. For example, $90 of upfront cost on $60 a year of savings ($1,200 at 5%) is 18 months to pay back.' },
      { q: 'How do I know the percent saved?', a: 'You do not know it exactly. It varies by house, and an energy audit is the usual way to estimate it. Treat any number here as a guess.' },
    ],
    sources: [],
  },
  related: ['heating-cost', 'thermostat-setback', 'home-energy-credit-payback', 'personal-heater-cost'],
  examples: [
    // saved = 1800*0.10 = 180; upfront 60; payback 60/180*12 = 4 months; net 180*10-60 = 1740
    { values: { bill: 1800, pct: 10, materials: 60, hours: 0, rate: 0, years: 10 }, expect: { saved: 180, upfront: 60, paybackMonths: 4, net: 1740 }, tolerance: 1e-9 },
    // saved = 1200*0.05 = 60; upfront 90; payback 90/60*12 = 18 months; net 60*5-90 = 210
    { values: { bill: 1200, pct: 5, materials: 90, hours: 0, rate: 0, years: 5 }, expect: { saved: 60, upfront: 90, paybackMonths: 18, net: 210 }, tolerance: 1e-9 },
    // upfront = 40 + 3*20 = 100; saved = 1000*0.10 = 100; payback 12 months; net 100*3-100 = 200
    { values: { bill: 1000, pct: 10, materials: 40, hours: 3, rate: 20, years: 3 }, expect: { saved: 100, upfront: 100, paybackMonths: 12, net: 200 }, tolerance: 1e-9 },
  ],
});

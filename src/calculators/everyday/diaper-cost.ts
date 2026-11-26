import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const DAYS_MONTH = 30.4375;

export default defineCalculator({
  slug: 'diaper-cost',
  title: 'Diaper Cost Calculator: Disposable vs Cloth',
  category: 'everyday',
  description: 'Add up what disposable diapers cost per month and over time from diapers a day and price each, and see how many months until cloth diapers break even.',
  keywords: ['diaper cost calculator', 'how much do diapers cost per month', 'cloth vs disposable diapers cost', 'cloth diaper break even', 'diaper budget'],
  updated: '2026-11-26',
  inputs: [
    { id: 'perDay', label: 'Diapers per day', type: 'number', default: 8, min: 1, step: 1, info: 'Diapers used a day. This falls as a child gets older, so use a typical figure for the stage.' },
    { id: 'price', label: 'Price per diaper', type: 'number', prefix: '$', default: 0.3, min: 0, step: 0.01, info: 'Pack price divided by the number of diapers in it.' },
    { id: 'months', label: 'Months', type: 'number', default: 12, min: 1, max: 60, step: 1, info: 'How many months to total up.' },
    { id: 'clothUpfront', label: 'Cloth diapers upfront cost', type: 'number', prefix: '$', default: 400, min: 0, step: 10, info: 'Covers, inserts, wet bags and anything else you buy once.' },
    { id: 'laundry', label: 'Cloth laundry cost per month', type: 'number', prefix: '$', default: 15, min: 0, step: 1, info: 'Extra water, power and detergent a month for washing cloth diapers.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Disposable cost per month', format: 'currency', primary: true, info: 'Diapers a day × 30.4375 × price.' },
    { id: 'total', label: 'Disposable total', format: 'currency', info: 'Monthly cost × months.' },
    { id: 'count', label: 'Diapers used', format: 'number', precision: 0, info: 'Diapers a day × 30.4375 × months.' },
    { id: 'breakEven', label: 'Cloth break-even', format: 'number', precision: 1, suffix: 'months', info: 'Upfront ÷ (monthly disposable − monthly laundry). Blank if cloth never pays back.' },
    { id: 'clothTotal', label: 'Cloth total over the period', format: 'currency', info: 'Upfront + laundry × months.' },
    { id: 'saving', label: 'Cloth saves (or costs extra)', format: 'currency', info: 'Disposable total − cloth total. Negative means cloth costs more over this period.' },
  ],
  compute: (v) => {
    const perDay = num(v.perDay), price = num(v.price), months = num(v.months), up = num(v.clothUpfront), laundry = num(v.laundry);
    if ([perDay, price, months, up, laundry].some((x) => x === null)) return { monthly: null };
    if ((perDay as number) < 1 || (price as number) < 0 || (months as number) < 1 || (up as number) < 0 || (laundry as number) < 0) return { monthly: null };
    const perMonth = (perDay as number) * DAYS_MONTH;
    const count = perMonth * (months as number);
    const monthly = perMonth * (price as number);
    const total = monthly * (months as number);
    const clothTotal = (up as number) + (laundry as number) * (months as number);
    const saving = total - clothTotal;
    const margin = monthly - (laundry as number);
    const breakEven = margin > 0 ? (up as number) / margin : null;
    const pays = breakEven !== null && breakEven <= (months as number);
    return {
      monthly,
      total,
      count,
      breakEven,
      clothTotal,
      saving,
      tone: pays ? 'good' : 'ok',
      badge: breakEven === null ? 'Cloth never breaks even' : pays ? `Cloth breaks even in ${fmt(breakEven, 1)} months` : 'Cloth not paid back yet',
      note: `Disposables come to ${money(monthly)} a month and ${money(total)} over ${fmt(months as number, 0)} months. ${breakEven === null ? 'Laundry costs as much as the disposables, so cloth never pays back.' : `Cloth pays back its upfront cost after ${fmt(breakEven, 1)} months.`} Diapers a day fall as a child grows and prices are your own inputs, so this is an estimate.`,
      chart: {
        type: 'bar' as const,
        title: `Total cost over ${fmt(months as number, 0)} months`,
        categories: ['Disposable', 'Cloth'],
        series: [{ name: 'Total', values: [+total.toFixed(2), +clothTotal.toFixed(2)] }],
        format: CURRENCY,
        highlight: saving > 0 ? 1 : 0,
      },
      steps: [
        `Diapers a month: ${fmt(perDay as number, 0)} × ${DAYS_MONTH} = ${fmt(perMonth)}`,
        `Monthly: ${fmt(perMonth)} × ${money(price as number)} = ${money(monthly)}`,
        `Total: ${money(monthly)} × ${fmt(months as number, 0)} = ${money(total)} (${fmt(count, 0)} diapers)`,
        `Cloth total: ${money(up as number)} + ${money(laundry as number)} × ${fmt(months as number, 0)} = ${money(clothTotal)}`,
        breakEven === null
          ? `Break-even: laundry ${money(laundry as number)} is not below disposables ${money(monthly)}, so none`
          : `Break-even: ${money(up as number)} ÷ (${money(monthly)} − ${money(laundry as number)}) = ${fmt(breakEven, 2)} months`,
      ],
    };
  },
  content: {
    formula: [
      'Diapers a month = diapers a day × 30.4375',
      'Disposable cost per month = diapers a month × price each',
      'Cloth total = upfront cost + laundry per month × months',
      'Break-even months = upfront ÷ (disposable per month − laundry per month)',
    ],
    body: [
      'Diapers are a steady monthly cost for the first couple of years. Enter how many a day, what each one costs and how many months you want to cover to see the monthly and total spend, plus the number of diapers you will go through.',
      'To compare with cloth, add what the cloth set costs upfront and what extra laundry adds each month. Break-even is the upfront cost divided by the monthly saving, and it only exists if disposables cost more a month than laundry does.',
      'Diapers a day drop as a child grows and prices change with brand and pack size, so every number here is your own input and the result is an estimate. For the wider cost of childcare, see the childcare vs work calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much do diapers cost per month?', a: 'With the defaults of 8 diapers a day at $0.30 each, that is 8 × 30.4375 = 243.5 diapers a month, which costs $73.05 a month.' },
      { q: 'How much over a year?', a: '$73.05 a month for 12 months is $876.60, using 2,922 diapers. A second case, 6 a day at $0.25 over 24 months, uses 4,383 diapers and costs $1,095.75.' },
      { q: 'When do cloth diapers break even?', a: 'With $400 upfront and $15 a month of laundry, the monthly saving is $73.05 − $15 = $58.05, so $400 ÷ $58.05 = 6.89 months. Over 12 months cloth totals $580.00 against $876.60, a saving of $296.60.' },
      { q: 'Why might my numbers differ?', a: 'Newborns use more diapers a day than toddlers, and price per diaper changes with brand and pack size. Update the inputs as your child grows.' },
    ],
    sources: [],
  },
  related: ['childcare-vs-work'],
  examples: [
    // diapers/mo = 8*30.4375 = 243.5; monthly = 243.5*0.30 = 73.05; total = 73.05*12 = 876.60; count = 2922
    // cloth total = 400 + 15*12 = 580; saving = 876.60-580 = 296.60; break-even = 400/(73.05-15) = 6.8906
    { values: { perDay: 8, price: 0.3, months: 12, clothUpfront: 400, laundry: 15 }, expect: { monthly: 73.05, total: 876.6, count: 2922, clothTotal: 580, saving: 296.6, breakEven: 6.8906 }, tolerance: 0.001 },
    // count = 6*30.4375*24 = 4383; monthly = 6*30.4375*0.25 = 45.65625; total = 1095.75
    // cloth total = 400+15*24 = 760; saving = 335.75; break-even = 400/(45.65625-15) = 13.0479
    { values: { perDay: 6, price: 0.25, months: 24, clothUpfront: 400, laundry: 15 }, expect: { count: 4383, monthly: 45.65625, total: 1095.75, clothTotal: 760, saving: 335.75, breakEven: 13.0479 }, tolerance: 0.001 },
  ],
});

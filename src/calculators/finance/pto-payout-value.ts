import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'pto-payout-value',
  title: 'PTO Payout Calculator: Cash After Withholding',
  category: 'finance',
  description: 'Turn unused PTO hours into dollars. See the gross payout, estimated withholding for federal, Social Security and Medicare, and state tax, and the cash you keep.',
  keywords: ['pto payout calculator', 'unused vacation pay', 'vacation payout after taxes', 'accrued pto payout', 'pto cash out'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'hours', label: 'Unused PTO hours', type: 'number', suffix: 'hrs', default: 80, min: 0, step: 1, info: 'Hours paid out. 80 hours is two 40-hour weeks.' },
    { id: 'rate', label: 'Hourly rate', type: 'number', prefix: '$', default: 30, min: 0, step: 0.5, info: 'For salary, divide annual pay by 2,080 hours.' },
    { id: 'fed', label: 'Federal withholding', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 0.5, info: 'Payouts are often withheld as supplemental wages at a flat rate. Use your own rate.' },
    { id: 'fica', label: 'Social Security + Medicare', type: 'number', suffix: '%', default: 7.65, min: 0, max: 100, step: 0.05, info: '6.2% plus 1.45% for most employees.' },
    { id: 'state', label: 'State withholding', type: 'number', suffix: '%', default: 4, min: 0, max: 100, step: 0.1, info: 'Use 0 if your state has no income tax.' },
  ],
  outputs: [
    { id: 'net', label: 'Cash after withholding', format: 'currency', precision: 2, primary: true, info: 'Gross payout minus all three withholding rates.' },
    { id: 'gross', label: 'Gross payout', format: 'currency', precision: 2, info: 'Hours × hourly rate.' },
    { id: 'withheld', label: 'Total withheld', format: 'currency', precision: 2, info: 'Gross × (federal + FICA + state).' },
  ],
  compute: (v) => {
    const h = num(v.hours);
    const r = num(v.rate);
    const f = num(v.fed);
    const c = num(v.fica);
    const s = num(v.state);
    if ([h, r, f, c, s].some((x) => x === null)) return { net: null };
    if ([h, r, f, c, s].some((x) => (x as number) < 0)) return { net: null, error: 'Values cannot be negative.' };
    if (f! + c! + s! > 100) return { net: null, error: 'Withholding rates add up to more than 100%.' };
    const gross = h! * r!;
    const fedAmt = gross * f! / 100;
    const ficaAmt = gross * c! / 100;
    const stateAmt = gross * s! / 100;
    const withheld = fedAmt + ficaAmt + stateAmt;
    const net = gross - withheld;
    const rateTotal = f! + c! + s!;
    return {
      net,
      gross,
      withheld,
      tone: 'good',
      badge: `${money(gross, 0)} gross, ${rateTotal.toFixed(2).replace(/\.?0+$/, '')}% withheld`,
      note: `${h} hours at ${money(r!)} is ${money(gross)} before tax. Withholding is an estimate, so your final tax bill can differ. Payout rules vary by state and employer.`,
      chart: {
        type: 'donut' as const,
        title: 'Where the payout goes',
        slices: [
          { label: 'You keep', value: net },
          { label: 'Federal', value: fedAmt },
          { label: 'Social Security + Medicare', value: ficaAmt },
          { label: 'State', value: stateAmt },
        ].filter((x) => x.value > 0),
        format: CURRENCY,
        centerLabel: 'Gross',
        centerValue: money(gross, 0),
      },
      steps: [
        `Gross = ${h} × ${money(r!)} = ${money(gross)}`,
        `Withholding rate = ${f}% + ${c}% + ${s}% = ${rateTotal.toFixed(2).replace(/\.?0+$/, '')}%`,
        `Withheld = ${money(gross)} × ${rateTotal.toFixed(2).replace(/\.?0+$/, '')}% = ${money(withheld)}`,
        `Cash = ${money(gross)} − ${money(withheld)} = ${money(net)}`,
      ],
    };
  },
  content: {
    formula: [
      'Gross = unused hours × hourly rate',
      'Withheld = gross × (federal % + FICA % + state %)',
      'Cash after withholding = gross − withheld',
    ],
    body: [
      'When you leave a job or hit a use-it-or-lose-it deadline, unused paid time off may be paid out as wages. It is taxed like pay, so the check is smaller than hours times rate.',
      'Example: 80 hours at $30 is $2,400 gross. With 22% federal, 7.65% Social Security and Medicare, and 4% state, withholding is 33.65%, or $807.60, leaving $1,592.40.',
      'Withholding is not your final tax. The payout is added to your annual income, so you may owe more or get some back at filing. Whether PTO is paid out at all depends on your state and your employer policy. To see your accrual, try the PTO calculator. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is a PTO payout calculated?', a: 'Multiply unused hours by your hourly rate for the gross amount, then subtract withholding for federal, Social Security and Medicare, and state tax.' },
      { q: 'What is the payout for 80 hours at $30?', a: 'Gross is $2,400. At 22% federal, 7.65% FICA and 4% state, $807.60 is withheld and you receive $1,592.40.' },
      { q: 'Is a PTO payout taxed more than regular pay?', a: 'Often it is withheld at a flat supplemental rate such as 22%, which can be higher or lower than your usual withholding. The real tax is settled when you file.' },
      { q: 'Does my employer have to pay out unused PTO?', a: 'It depends on the state and the employer policy. Some states require it at separation and others leave it to the company. Check your handbook.' },
      { q: 'How do I enter a salary?', a: 'Divide annual pay by 2,080 hours for a full-time hourly equivalent, then enter that as the rate.' },
    ],
    sources: [
      { label: 'IRS: Publication 15, Employer\'s Tax Guide (supplemental wages)', url: 'https://www.irs.gov/publications/p15' },
      { label: 'US Department of Labor: Vacation leave', url: 'https://www.dol.gov/general/topic/workhours/vacation_leave' },
    ],
  },
  related: ['pto-calculator', 'bonus-tax', 'severance-pay', 'take-home-pay'],
  examples: [
    // gross 2400; withheld 2400*.3365 = 807.6; net 1592.4
    { values: { hours: 80, rate: 30, fed: 22, fica: 7.65, state: 4 }, expect: { gross: 2400, withheld: 807.6, net: 1592.4 } },
    // no state tax: 40*25 = 1000; 10% + 7.65% = 176.5; net 823.5
    { values: { hours: 40, rate: 25, fed: 10, fica: 7.65, state: 0 }, expect: { gross: 1000, withheld: 176.5, net: 823.5 } },
  ],
});

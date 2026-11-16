import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, moneyDonut, sampleIdx } from '../../lib/helpers/finance';

const MAX_MONTHS = 1200; // 100 years: beyond this we call it "not in reach"

export default defineCalculator({
  slug: 'emergency-fund',
  title: 'Emergency Fund Calculator',
  category: 'finance',
  description: 'How much emergency savings do you need? Find your target fund, how many months of cover you have now and how long it takes to build the rest.',
  keywords: ['emergency fund calculator', 'how much emergency fund do i need', '3 to 6 months expenses', 'rainy day fund', 'months of expenses saved', 'how long to build emergency fund', 'emergency savings goal'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    { id: 'expenses', label: 'Monthly essential expenses', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, help: 'Rent or mortgage, food, utilities, insurance, transport and minimum debt payments.', info: 'Only what you must pay to keep life running if your income stopped. Leave out dining out, travel and subscriptions you could cancel.' },
    {
      id: 'months',
      label: 'Months of cover to aim for',
      type: 'select',
      default: '6',
      options: [
        { value: '3', label: '3 months' },
        { value: '6', label: '6 months' },
        { value: '9', label: '9 months' },
        { value: '12', label: '12 months' },
      ],
      help: '3 if you have steady pay and a second income. 6 is the common default. 9 to 12 for a single income, variable income, dependents or a niche job.',
      info: 'How many months of essential expenses the fund should cover. More uncertainty in your income or more people relying on it means a longer cushion.',
    },
    { id: 'current', label: 'Emergency savings now', type: 'number', prefix: '$', default: 6000, min: 0, step: 500, optional: true, info: 'Cash you could reach within a day or two: savings and checking money set aside for emergencies. Not retirement accounts or investments.' },
    { id: 'monthly', label: 'Amount you can save each month', type: 'number', prefix: '$', default: 500, min: 0, step: 50, optional: true, info: 'What you will put toward the fund every month, deposited at the end of the month.' },
    { id: 'apy', label: 'Savings account APY', type: 'number', suffix: '%', default: 4, min: 0, max: 20, step: 0.1, optional: true, help: 'Use 0 to ignore interest.', info: 'The yearly yield on the account that holds the fund, compounded monthly. High-yield savings accounts have paid around 4% recently, but rates change.' },
  ],
  outputs: [
    { id: 'target', label: 'Target emergency fund', format: 'currency', primary: true, info: 'Monthly essential expenses multiplied by the months of cover you chose.' },
    { id: 'shortfall', label: 'Still to save', format: 'currency', info: 'The target minus what you already have, never below zero.' },
    { id: 'coverNow', label: 'Months of cover you have now', format: 'number', precision: 1, suffix: 'months', info: 'Your emergency savings divided by monthly essential expenses.' },
    { id: 'monthsToGo', label: 'Months to reach the target', format: 'integer', suffix: 'months', info: 'Whole months of saving needed, with interest if you entered an APY. Zero means you are already there.' },
    { id: 'readyBy', label: 'Ready by', format: 'text', info: 'Today plus the months above. A rough guide, since it depends on saving the same amount every month.' },
  ],
  compute: (v) => {
    const expenses = num(v.expenses);
    const months = Number(v.months) || 6;
    const current = num(v.current) ?? 0;
    const save = num(v.monthly) ?? 0;
    const apy = num(v.apy) ?? 0;
    if (expenses === null || expenses <= 0 || months <= 0 || current < 0 || save < 0 || apy < 0) return { target: null };

    const target = expenses * months;
    const shortfall = Math.max(0, target - current);
    const coverNow = current / expenses;
    const i = apy / 100 / 12;

    // Months until balance >= target, with end-of-month deposits and monthly compounding.
    let n: number | null;
    if (shortfall === 0) n = 0;
    else if (save <= 0 && (i === 0 || current <= 0)) n = null;
    else if (i === 0) n = Math.ceil(shortfall / save - 1e-9);
    else n = Math.ceil(Math.log((target * i + save) / (current * i + save)) / Math.log(1 + i) - 1e-9);
    if (n !== null && (!Number.isFinite(n) || n > MAX_MONTHS)) n = null;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    let badge: string;
    const cover = +coverNow.toFixed(1);
    if (current >= target) {
      tone = 'good';
      badge = `Fully funded: ${cover} months of cover`;
    } else if (current >= target / 2) {
      tone = 'ok';
      badge = `Halfway there: ${cover} months of cover`;
    } else if (coverNow >= 1) {
      tone = 'warn';
      badge = `Getting started: ${cover} months of cover`;
    } else {
      tone = 'bad';
      badge = `You have ${cover} months of cover`;
    }

    const charts: ChartSpec[] = [];
    if (n !== null && n > 0) {
      const idx = sampleIdx(n, 60);
      const bal = (m: number) => (i === 0 ? current + save * m : current * (1 + i) ** m + (save * ((1 + i) ** m - 1)) / i);
      charts.push({
        type: 'line',
        title: 'Your fund vs the target',
        x: idx,
        xLabel: 'Months from now',
        xFormat: { format: 'number' },
        yFormat: CURRENCY,
        series: [
          { name: 'Your savings', values: idx.map(bal) },
          { name: 'Target', values: idx.map(() => target) },
        ],
      });
    }
    charts.push(moneyDonut('Target fund', [{ label: 'Saved so far', value: Math.min(current, target) }, { label: 'Still to save', value: shortfall }], `${Math.min(100, Math.round((current / target) * 100))}%`, 'saved'));

    let readyBy = '—';
    if (n !== null) {
      if (n === 0) readyBy = 'Now';
      else {
        const d = new Date();
        d.setMonth(d.getMonth() + n);
        readyBy = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    }

    const growth = apy > 0 ? ` at ${apy}% APY` : '';
    const note =
      n === 0
        ? `You already have ${money(current, 0)}, which covers ${cover} months. Your ${months}-month target is ${money(target, 0)}.`
        : n === null
          ? `Add a monthly amount to see when you could reach ${money(target, 0)}. You still need ${money(shortfall, 0)}.`
          : `Saving ${money(save, 0)} a month${growth} gets you from ${money(current, 0)} to ${money(target, 0)} in ${n} month${n === 1 ? '' : 's'}.`;

    return {
      target,
      shortfall,
      coverNow,
      monthsToGo: n,
      readyBy,
      tone,
      badge,
      chart: charts,
      steps: [
        `Target = ${money(expenses, 0)} × ${months} months = ${money(target, 0)}`,
        `Months of cover now = ${money(current, 0)} ÷ ${money(expenses, 0)} = ${coverNow.toFixed(1)}`,
        `Still to save = ${money(target, 0)} − ${money(current, 0)} = ${money(shortfall, 0)}`,
        ...(n !== null && n > 0
          ? [i === 0 ? `Months = ${money(shortfall, 0)} ÷ ${money(save, 0)} = ${n} (rounded up)` : `Months = ln((T·i + P) ÷ (S·i + P)) ÷ ln(1 + i) rounded up = ${n}, with i = ${apy}% ÷ 12`]
          : []),
      ],
      note,
    };
  },
  content: {
    formula: [
      'Target = monthly essential expenses × months of cover',
      'Months of cover now = emergency savings ÷ monthly essential expenses',
      'Without interest: months = (target − savings) ÷ monthly saving, rounded up',
      'With interest: months = ln((T·i + P) ÷ (S·i + P)) ÷ ln(1 + i), rounded up',
      'T = target, S = savings now, P = monthly saving, i = APY ÷ 12',
    ],
    body: [
      'An emergency fund is cash set aside for the things you cannot plan for: a job loss, a medical bill, a car repair, an urgent trip home. It keeps one bad month from turning into credit card debt. The standard advice is to hold enough to cover three to six months of essential expenses.',
      'Base the target on essentials only, not your whole budget. Add up rent or mortgage, groceries, utilities, insurance, transport and minimum debt payments. That number, multiplied by the months of cover you choose, is your target. The calculator then shows how many months of cover you have today and how long it takes to close the gap.',
      'If you enter an APY, the calculator assumes monthly compounding and a deposit at the end of every month. The result is rounded up to whole months, so it is the first month your balance is at or above the target. Interest rates move, so treat the date as a guide, not a promise.',
    ],
    sections: [
      {
        heading: 'How many months of cover do you need?',
        paragraphs: [
          'Three months can be enough if you have steady pay, a second earner and low fixed costs. Six months suits most people. Go to nine or twelve if you are the only earner, your income varies (freelance, commission, seasonal work), people depend on you, you work in a field where job searches run long, or you own a home and carry repair risk.',
          'If six months feels out of reach, start with one month. A small cushion already handles most surprise bills, and you can raise the target as it grows.',
        ],
      },
      {
        heading: 'Where to keep it',
        paragraphs: [
          'Keep the money safe and easy to reach. A high-yield savings account at an FDIC-insured bank or an NCUA-insured credit union is the usual choice: it earns interest, you can move the money within a day or two, and deposits are insured up to $250,000 per depositor, per bank, per ownership category. Money market accounts work too. Avoid stocks and crypto for this money, since they can drop just when you need to sell.',
        ],
      },
      {
        heading: 'What counts as an emergency',
        paragraphs: [
          'A real emergency is unexpected, necessary and urgent: losing your job, a medical or dental bill, an essential car or home repair, or urgent family travel. A sale, a holiday or a planned expense is not. Many people keep a separate sinking fund for predictable costs like car registration or gifts so the emergency fund stays untouched.',
          'If you use the fund, refill it. Set the monthly saving to the same amount and the calculator will show how long that takes.',
        ],
      },
    ],
    faq: [
      { q: 'How much emergency fund do I need if I spend $3,000 a month?', a: 'With $3,000 of essential expenses and a 6-month goal, your target is $18,000. With 3 months it would be $9,000, and with 12 months $36,000.' },
      { q: 'How many months of cover do I have with $6,000 saved?', a: 'On $3,000 of monthly essentials, $6,000 covers 2.0 months. Against a 6-month target of $18,000, you still need $12,000, and the badge shows Getting started.' },
      { q: 'How long to build $18,000 saving $500 a month with no interest?', a: 'Starting from $6,000, you need $12,000 more. $12,000 ÷ $500 is exactly 24 months, so you are done after 24 months of saving.' },
      { q: 'How much does a 4% savings account speed that up?', a: 'With the same $6,000 start and $500 a month, a 4% APY compounded monthly reaches $18,000 in 23 months instead of 24. After 22 months you have $17,849.44, and after 23 months $18,408.94.' },
      { q: 'What if I already have more than my target?', a: 'The result shows a shortfall of $0, 0 months to go, and a Fully funded badge. For example, $7,000 saved against $2,000 of monthly essentials covers 3.5 months, which is above a 3-month target of $6,000.' },
      { q: 'What if I cannot save anything each month?', a: 'With $500 saved against $3,000 of expenses, a $0 monthly amount and a 0% APY, there is no way to reach the target, so the months to go and ready by date show a dash. The badge says you have 0.2 months of cover. Even $25 a month starts the habit.' },
    ],
    sources: [
      { label: 'CFPB: Consumer tools on saving and emergencies', url: 'https://www.consumerfinance.gov/consumer-tools/' },
      { label: 'FDIC: Deposit insurance coverage', url: 'https://www.fdic.gov/resources/deposit-insurance/' },
    ],
  },
  related: ['savings-goal', 'rent-affordability', 'take-home-pay', 'credit-card-payoff'],
  examples: [
    {
      // target 3,000 × 6 = 18,000; shortfall 12,000; cover 6,000 ÷ 3,000 = 2; months 12,000 ÷ 500 = 24.
      values: { expenses: 3000, months: '6', current: 6000, monthly: 500, apy: 0 },
      expect: { target: 18000, shortfall: 12000, coverNow: 2, monthsToGo: 24 },
    },
    {
      // i = 0.04/12 = 0.0033333. T·i = 60, S·i = 20: n = ln(560 ÷ 520) ÷ ln(1.0033333) = 0.074108 ÷ 0.0033278 = 22.27 -> 23.
      // Check: after 22 months 17,849.44 (< 18,000); after 23 months 18,408.94 (>= 18,000).
      values: { expenses: 3000, months: '6', current: 6000, monthly: 500, apy: 4 },
      expect: { target: 18000, shortfall: 12000, coverNow: 2, monthsToGo: 23 },
    },
    {
      // target 2,000 × 3 = 6,000 <= 7,000 saved: shortfall 0, months 0, cover 3.5.
      values: { expenses: 2000, months: '3', current: 7000, monthly: 200, apy: 4 },
      expect: { target: 6000, shortfall: 0, coverNow: 3.5, monthsToGo: 0 },
    },
    {
      // target 4,000 × 3 = 12,000; i = 0.0025; T·i + P = 280, S·i + P = 252.5: ln(1.108911) ÷ ln(1.0025) = 0.103387 ÷ 0.0024969 = 41.40 -> 42.
      values: { expenses: 4000, months: '3', current: 1000, monthly: 250, apy: 3 },
      expect: { target: 12000, shortfall: 11000, coverNow: 0.25, monthsToGo: 42 },
    },
    {
      // No saving and no interest: never reaches target. cover 500 ÷ 3,000 = 0.1667.
      values: { expenses: 3000, months: '6', current: 500, monthly: 0, apy: 0 },
      expect: { target: 18000, shortfall: 17500, coverNow: 0.1667 },
      tolerance: 1e-3,
    },
  ],
});

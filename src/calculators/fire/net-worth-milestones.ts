import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { SOURCES } from '../../lib/helpers/fire';

const MILESTONES = [
  { id: 'm100k', value: 100000, label: '$100k' },
  { id: 'm250k', value: 250000, label: '$250k' },
  { id: 'm500k', value: 500000, label: '$500k' },
  { id: 'm1m', value: 1000000, label: '$1M' },
  { id: 'm2_5m', value: 2500000, label: '$2.5M' },
];
const MAX_MONTHS = 1200; // 100 years

/** "9 years 8 months", "Already there" or "Not within 100 years". */
function fmtMonths(m: number | null): string {
  if (m === null) return 'Not within 100 years';
  if (m === 0) return 'Already there';
  const y = Math.floor(m / 12);
  const mo = m % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} year${y === 1 ? '' : 's'}`);
  if (mo > 0) parts.push(`${mo} month${mo === 1 ? '' : 's'}`);
  return parts.join(' ');
}

export default defineCalculator({
  slug: 'net-worth-milestones',
  title: 'Net Worth Milestones Calculator',
  seoTitle: 'Net Worth Milestones: When Do I Hit $1M?',
  metaDescription: 'Find out when your net worth reaches $100k, $250k, $500k and $1M from what you have today, what you add each month and an assumed yearly return.',
  updated: '2026-11-23',
  category: 'fire',
  description: 'See how long it takes your net worth to reach $100k, $250k, $500k, $1M and $2.5M, with a chart of the projected balance.',
  keywords: ['net worth milestones', 'when will I be a millionaire', 'how long to reach $100k', 'how long to save $1 million', 'net worth timeline', 'time to $500k'],
  popular: false,
  inputs: [
    { id: 'start', label: 'Net worth today', type: 'number', prefix: '$', default: 25000, min: -10000000, step: 1000, info: 'Assets minus debts today. It can be negative if you owe more than you own.' },
    { id: 'contrib', label: 'Added each month', type: 'number', prefix: '$', default: 1000, min: 0, step: 50, info: 'What you save or pay down in debt each month. Added at the end of every month.' },
    { id: 'ret', label: 'Annual return', type: 'number', suffix: '% / yr', default: 7, min: -20, max: 30, step: 0.5, info: 'Yearly growth you assume. An assumption, not a forecast. Real returns vary year to year, and 7% is not adjusted for inflation.' },
  ],
  outputs: [
    { id: 'next', label: 'Time to your next milestone', format: 'text', primary: true, info: 'How long until you reach the first milestone you have not passed yet.' },
    { id: 'm100k', label: '$100,000', format: 'text', info: 'Time until your projected net worth first reaches $100,000.' },
    { id: 'm250k', label: '$250,000', format: 'text', info: 'Time until your projected net worth first reaches $250,000.' },
    { id: 'm500k', label: '$500,000', format: 'text', info: 'Time until your projected net worth first reaches $500,000.' },
    { id: 'm1m', label: '$1,000,000', format: 'text', info: 'Time until your projected net worth first reaches $1,000,000.' },
    { id: 'm2_5m', label: '$2,500,000', format: 'text', info: 'Time until your projected net worth first reaches $2,500,000.' },
  ],
  compute: (v) => {
    const b0 = num(v.start);
    const c = num(v.contrib);
    const a = num(v.ret);
    if (b0 === null || c === null || a === null) return { next: null };
    if (c < 0) return { next: null, error: 'Monthly amount cannot be negative.' };
    if (a <= -100) return { next: null, error: 'Annual return must be above -100%.' };

    const r = (1 + a / 100) ** (1 / 12) - 1;
    const bal: number[] = [b0];
    const months: (number | null)[] = MILESTONES.map((m) => (b0 >= m.value ? 0 : null));
    for (let m = 1; m <= MAX_MONTHS; m++) {
      const b = bal[m - 1] * (1 + r) + c;
      bal.push(b);
      MILESTONES.forEach((ms, i) => {
        if (months[i] === null && b >= ms.value) months[i] = m;
      });
    }

    const nextIdx = months.findIndex((m) => m !== 0);
    let next: string;
    let tone: 'good' | 'ok' | 'warn' | 'bad' = 'ok';
    let badge: string;
    if (nextIdx === -1) {
      next = 'All milestones reached';
      tone = 'good';
      badge = 'Past $2.5M';
    } else if (months[nextIdx] === null) {
      next = `${MILESTONES[nextIdx].label}: not within 100 years`;
      tone = 'bad';
      badge = 'Out of reach at this pace';
    } else {
      const mo = months[nextIdx] as number;
      next = `${fmtMonths(mo)} to ${MILESTONES[nextIdx].label}`;
      badge = `${MILESTONES[nextIdx].label} in ${fmtMonths(mo)}`;
      tone = mo <= 60 ? 'good' : mo <= 180 ? 'ok' : 'warn';
    }

    // Chart: yearly points up to the last reachable milestone (at least 1 year, at most 100).
    const reached = months.filter((m): m is number => m !== null && m > 0);
    const horizon = Math.min(MAX_MONTHS, Math.max(12, reached.length ? Math.max(...reached) : 120));
    const years = Math.ceil(horizon / 12);
    const x: number[] = [];
    const ys: number[] = [];
    for (let y = 0; y <= years; y++) {
      x.push(y);
      ys.push(Math.round(bal[Math.min(y * 12, MAX_MONTHS)]));
    }
    const markers = MILESTONES.flatMap((ms, i) => {
      const m = months[i];
      return m !== null && m > 0 ? [{ x: m / 12, label: ms.label }] : [];
    });

    const steps = [
      `Monthly rate = (1 + ${a}%)^(1/12) − 1 = ${+(r * 100).toFixed(4)}%`,
      `Each month: balance = balance × (1 + monthly rate) + ${money(c, 0)}, starting from ${money(b0, 0)}`,
      ...MILESTONES.map((ms, i) => `${ms.label}: ${fmtMonths(months[i])}`),
    ];

    const out: Record<string, string | number | null> = {};
    MILESTONES.forEach((ms, i) => { out[ms.id] = fmtMonths(months[i]); });

    return {
      next,
      ...out,
      tone,
      badge,
      chart: {
        type: 'line',
        title: 'Projected net worth',
        x,
        xLabel: 'Years from now',
        yFormat: CURRENCY,
        series: [{ name: 'Net worth', values: ys }],
        markers,
      },
      steps,
      note: `At ${a}% a year and ${money(c, 0)} a month, this projects ${nextIdx === -1 ? 'you are past every milestone' : `${MILESTONES[nextIdx].label} in ${fmtMonths(months[nextIdx])}`}. The return is an assumption, not a forecast, and it ignores taxes, fees and inflation.`,
    };
  },
  content: {
    formula: [
      'Monthly rate = (1 + annual return)^(1/12) − 1',
      'Balance next month = balance × (1 + monthly rate) + monthly amount',
      'Milestone month = first month the balance is at or above the milestone',
    ],
    body: [
      'Net worth milestones are round numbers that make a long goal feel closer: $100k, $250k, $500k and $1M. This calculator shows how many years and months each one takes, given what you have today, what you add every month and the yearly return you assume.',
      'It converts your yearly return to a monthly rate, then steps forward one month at a time: the balance grows by that rate and your monthly amount is added at the end. The first month the balance is at or above a milestone is the answer. If you are already past it, it says "Already there". If it is not reached in 100 years, it says so.',
      'With nothing saved yet, $1,000 a month and a 0% return, you reach $100k in 100 months (8 years 4 months), $250k in 250 months and $500k in 500 months. At a 7% return, starting from $10,000 and adding $500 a month, $100k takes 116 months (9 years 8 months) and $1M takes 427 months (35 years 7 months).',
    ],
    sections: [
      {
        heading: 'Why the first milestone is the slowest',
        paragraphs: [
          'Early on, almost all of your growth comes from what you add. Later, growth on the existing balance does more of the work, so each milestone arrives faster than the last in relation to its size. At 7% with $500 a month from $10,000, the first $100k takes about 9 years 8 months, but going from $500k to $1M, twice the size, takes about 9 years 1 month. Growth on a bigger balance does more of the work.',
        ],
      },
      {
        heading: 'What this projection leaves out',
        paragraphs: [
          'Markets do not return the same amount every year, and a bad stretch early on can delay a milestone by years. The calculator also ignores taxes, fees and inflation, so the dollar amounts are not in today\'s purchasing power. Try a lower return such as 4% or 5% to see a more cautious timeline. For the full path to financial independence, use the FIRE calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How long does it take to reach $100k?', a: 'It depends on what you start with, what you add and the return you assume. Starting from $0, adding $1,000 a month with a 0% return, it takes 100 months (8 years 4 months). Starting from $10,000 and adding $500 a month at 7%, it takes 116 months (9 years 8 months).' },
      { q: 'Is the 7% return a prediction?', a: 'No. It is an assumption you can change, not a forecast or financial advice. Real returns swing from year to year and are lower after inflation, taxes and fees. Test several rates to see the range.' },
      { q: 'When are contributions added?', a: 'At the end of each month, after that month\'s growth. Adding them at the start would earn slightly more and shorten the timeline a little.' },
      { q: 'What does "Not within 100 years" mean?', a: 'The projected balance does not reach that milestone within 1,200 months. This happens when you add nothing and the return is 0% or negative, or when a negative net worth keeps shrinking.' },
    ],
    sources: [SOURCES.mmm, { label: 'Federal Reserve — Survey of Consumer Finances (household net worth data)', url: 'https://www.federalreserve.gov/econres/scfindex.htm' }],
  },
  related: ['net-worth', 'fire-calculator', 'compound-interest', 'portfolio-income-per-day'],
  examples: [
    // 0% return, $1,000/month from $0: balance after m months = 1000m -> 100k at 100, 250k at 250, 500k at 500, 1M at 1000; 2.5M needs 2500 months > 1200 -> never
    { values: { start: 0, contrib: 1000, ret: 0 }, expect: { m100k: '8 years 4 months', m250k: '20 years 10 months', m500k: '41 years 8 months', m1m: '83 years 4 months', m2_5m: 'Not within 100 years', next: '8 years 4 months to $100k' } },
    // 7%: r = 1.07^(1/12)-1; n = ln((T + c/r)/(B + c/r)) / ln(1+r) rounded up. T=100k: 115.17 -> 116 months = 9y8m. Confirmed by month-by-month script: 116, 220, 318, 427, 580.
    { values: { start: 10000, contrib: 500, ret: 7 }, expect: { m100k: '9 years 8 months', m250k: '18 years 4 months', m500k: '26 years 6 months', m1m: '35 years 7 months', m2_5m: '48 years 4 months' } },
    // Start $300k, nothing added, 7%: $100k and $250k already passed; $500k: ln(500/300)/ln(1.07)*12 = 90.6 -> 91 months = 7y7m
    { values: { start: 300000, contrib: 0, ret: 7 }, expect: { m100k: 'Already there', m250k: 'Already there', m500k: '7 years 7 months', next: '7 years 7 months to $500k' } },
    // Nothing saved, nothing added: never
    { values: { start: 0, contrib: 0, ret: 7 }, expect: { m100k: 'Not within 100 years', next: '$100k: not within 100 years' } },
  ],
});

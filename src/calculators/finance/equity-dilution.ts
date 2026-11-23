import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const ROUNDS = [
  { id: 'r1', label: 'Round 1', raise: 5, pre: 20 },
  { id: 'r2', label: 'Round 2', raise: 20, pre: 80 },
  { id: 'r3', label: 'Round 3', raise: 0, pre: 0 },
  { id: 'r4', label: 'Round 4', raise: 0, pre: 0 },
];

export default defineCalculator({
  slug: 'equity-dilution',
  title: 'Equity Dilution Calculator',
  seoTitle: 'Startup Equity Dilution Calculator',
  metaDescription: 'See how your ownership shrinks after each startup funding round, with an optional option-pool top-up, and what your stake is worth at an exit value.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Track your ownership percentage through up to four funding rounds and see what your diluted stake is worth at an exit value you enter.',
  keywords: ['equity dilution calculator', 'startup dilution calculator', 'ownership after funding round', 'option pool dilution', 'how much will my equity be worth'],
  popular: false,
  inputs: [
    { id: 'own', label: 'Your ownership today', type: 'number', suffix: '%', default: 1, min: 0, max: 100, step: 0.05, info: 'The percentage of the company you own, fully diluted, before the first round.' },
    ...ROUNDS.flatMap((r) => [
      { id: `${r.id}m`, label: `${r.label}: money raised`, type: 'number' as const, prefix: '$', suffix: 'M', default: r.raise, min: 0, step: 1, info: 'In millions of dollars. Leave at 0 to skip this round.' },
      { id: `${r.id}p`, label: `${r.label}: pre-money valuation`, type: 'number' as const, prefix: '$', suffix: 'M', default: r.pre, min: 0, step: 5, info: 'In millions of dollars: the company\'s value before this round\'s money goes in.' },
    ]),
    { id: 'pool', label: 'Option-pool top-up per round', type: 'number', suffix: '%', default: 0, min: 0, max: 50, step: 0.5, info: 'Optional. New shares set aside for options in each round, as a share of the company after the round. Applied in every round that raises money.' },
    { id: 'exit', label: 'Exit value', type: 'number', prefix: '$', suffix: 'M', default: 500, min: 0, step: 50, info: 'In millions of dollars: what the company is sold for. An illustration, not a forecast.' },
  ],
  outputs: [
    { id: 'final', label: 'Your ownership after all rounds', format: 'number', precision: 3, suffix: '%', primary: true, info: 'Starting stake × (1 - investor share) for each round.' },
    { id: 'lost', label: 'Share of your stake diluted away', format: 'number', precision: 1, suffix: '%', info: '1 - final stake ÷ starting stake.' },
    { id: 'worth', label: 'Value at the exit', format: 'currency', info: 'Final ownership × exit value. Ignores liquidation preferences, debt, tax and vesting.' },
  ],
  compute: (v) => {
    const own = num(v.own), pool = num(v.pool), exit = num(v.exit);
    const rs = ROUNDS.map((r) => ({ m: num(v[`${r.id}m`]), p: num(v[`${r.id}p`]) }));
    if (own === null || pool === null || exit === null || rs.some((r) => r.m === null || r.p === null)) return { final: null };
    if (own < 0 || own > 100 || pool < 0 || pool >= 100 || exit < 0 || rs.some((r) => r.m! < 0 || r.p! < 0)) return { final: null, error: 'Enter ownership between 0 and 100, and values that are not negative.' };
    let stake = own;
    const path = [own];
    const labels = ['Today'];
    const notes: string[] = [];
    for (let i = 0; i < ROUNDS.length; i++) {
      const m = rs[i].m as number, p = rs[i].p as number;
      if (m === 0) continue;
      if (p === 0) return { final: null, error: `${ROUNDS[i].label} needs a pre-money valuation above zero.` };
      const investors = m / (p + m);
      const keep = (1 - investors) * (1 - pool / 100);
      const before = stake;
      stake *= keep;
      path.push(stake);
      labels.push(ROUNDS[i].label);
      notes.push(`${ROUNDS[i].label}: investors take ${+(investors * 100).toFixed(2)}% (${money(m, 0)}M ÷ ${money(p + m, 0)}M), so ${+before.toFixed(4)}% becomes ${+stake.toFixed(4)}%`);
    }
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Your ownership after each round (%)',
      categories: labels,
      series: [{ name: 'Ownership', values: path }],
      format: { format: 'number', suffix: '%' },
    };
    const worth = (stake / 100) * exit * 1e6;
    return {
      final: stake,
      lost: own > 0 ? (1 - stake / own) * 100 : 0,
      worth,
      tone: 'ok',
      badge: path.length === 1 ? 'No rounds entered' : `${+stake.toFixed(3)}% after ${path.length - 1} round${path.length === 2 ? '' : 's'}`,
      chart,
      steps: notes.length ? notes : ['Add a round with money raised and a pre-money valuation'],
      note: 'An illustration only. Real exits depend on liquidation preferences, debt, taxes, vesting and exercise cost, none of which are included. Not financial advice.',
    };
  },
  content: {
    formula: [
      'Investor share of a round = money raised ÷ (pre-money valuation + money raised)',
      'Your stake after the round = stake before × (1 - investor share) × (1 - option-pool top-up)',
      'Value at exit = final ownership × exit value',
    ],
    body: [
      'Each time a startup raises money it issues new shares, so everyone who already owns shares owns a smaller slice of a bigger company. That is dilution. A smaller percentage can still be worth more if the company grows enough, which is the point of raising.',
      'Enter your ownership, then up to four rounds with the money raised and the pre-money valuation, both in millions. The investors\' share is the money raised divided by the post-money valuation. Add an option-pool top-up if each round also sets aside new shares for hiring.',
      'The exit value turns your final percentage into a dollar figure. It ignores liquidation preferences, debt, tax, vesting and what you pay to exercise options, so treat it as an illustration, not a forecast or advice.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'You own 1.0%. Round 1 raises $5M at a $20M pre-money valuation, so investors own 5 ÷ 25 = 20% and you keep 0.80%. Round 2 raises $20M at $80M pre-money, so investors own 20 ÷ 100 = 20% and you keep 0.64%. At a $500M exit, 0.64% is $3.2 million.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The stock option exercise calculator shows what exercising your options costs and is worth.',
        ],
      },
    ],
    faq: [
      { q: 'What is dilution?', a: 'It is the drop in your ownership percentage when new shares are issued. You keep the same number of shares, but they are a smaller share of the total.' },
      { q: 'How do I calculate dilution from a funding round?', a: 'Divide the money raised by the post-money valuation (pre-money plus money raised) to get the new investors\' share, then multiply your stake by one minus that share. A $5M raise at $20M pre-money gives investors 20%.' },
      { q: 'What is an option-pool top-up?', a: 'New shares set aside for future employee options, usually created at a funding round. It dilutes existing holders. Here it is applied as a percentage of the company in each round that raises money.' },
      { q: 'Is the exit value what I would receive?', a: 'No. It is your percentage times the sale price only. Liquidation preferences, debt, taxes, vesting and exercise costs can reduce what you actually get.' },
    ],
    sources: [],
  },
  related: ['stock-option-exercise', 'rsu-tax', 'job-offer-comparison'],
  examples: [
    // 1% ; r1 5/(20+5)=.2 -> .8 ; r2 20/100=.2 -> .64 ; worth .0064*500e6 = 3.2e6; lost 36%
    { values: { own: 1, r1m: 5, r1p: 20, r2m: 20, r2p: 80, r3m: 0, r3p: 0, r4m: 0, r4p: 0, pool: 0, exit: 500 }, expect: { final: 0.64, lost: 36, worth: 3200000 }, tolerance: 1e-6 },
    // one round 10M at 40M pre: investors .2; pool 10%: keep .8*.9=.72 ; 2% -> 1.44
    { values: { own: 2, r1m: 10, r1p: 40, r2m: 0, r2p: 0, r3m: 0, r3p: 0, r4m: 0, r4p: 0, pool: 10, exit: 100 }, expect: { final: 1.44, worth: 1440000 }, tolerance: 1e-6 },
  ],
});

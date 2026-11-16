import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { FILING_STATUS_OPTIONS, growthCharts, money, TAX_YEAR } from '../../lib/helpers/finance';

/** 2026 IRA limits (IRS Notice 2025-67). */
const IRA_LIMIT = 7500;
const IRA_CATCHUP = 1100;
/** 2026 Roth IRA phase-out ranges by MAGI (IRS Notice 2025-67). */
const PHASE_OUT = {
  single: { lower: 153000, upper: 168000 },
  mfj: { lower: 242000, upper: 252000 },
} as const;

/** Contribution limit after the income phase-out (IRS Pub 590-A worksheet rule). */
function allowedLimit(base: number, magi: number, lower: number, upper: number) {
  if (magi <= lower) return base;
  if (magi >= upper) return 0;
  const reduced = base - (base * (magi - lower)) / (upper - lower);
  const rounded = Math.ceil(reduced / 10 - 1e-9) * 10; // round UP to the next $10
  return Math.max(rounded, 200); // a limit above $0 is never below $200
}

export default defineCalculator({
  slug: 'roth-ira',
  title: 'Roth IRA Calculator',
  category: 'finance',
  description: `See how your Roth IRA could grow by retirement and whether your income lets you contribute the full ${TAX_YEAR} limit.`,
  keywords: ['roth ira calculator', 'roth ira contribution limit', 'roth ira income limit', 'roth ira growth calculator', 'roth ira phase out', 'roth ira 2026'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    { id: 'age', label: 'Your age', type: 'number', suffix: 'years', default: 30, min: 18, max: 99, step: 1, info: 'Your age at the end of this year. If you are 50 or older, the catch-up amount is added to your limit automatically.' },
    { id: 'retireAge', label: 'Retirement age', type: 'number', suffix: 'years', default: 65, min: 19, max: 100, step: 1, info: 'The age you plan to start using the money. You contribute once a year until then.' },
    { id: 'balance', label: 'Current Roth IRA balance', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, optional: true, info: 'What your Roth IRA holds today. Leave blank or enter 0 if you are starting fresh.' },
    { id: 'contribution', label: 'Planned contribution per year', type: 'number', prefix: '$', default: 7500, min: 0, step: 250, info: 'What you would like to put in each year. If it is above what you are allowed, the calculator uses the allowed amount.' },
    { id: 'ret', label: 'Expected annual return', type: 'number', suffix: '%', default: 7, min: -10, max: 30, step: 0.5, info: 'Average yearly growth before inflation. Around 6% to 7% is a common long-run planning figure for stocks; it is not a promise.' },
    { id: 'status', label: 'Filing status', type: 'select', options: FILING_STATUS_OPTIONS.filter((o) => o.value === 'single' || o.value === 'mfj'), default: 'single', segmented: true, info: 'Roth IRA income limits depend on whether you file as single or married filing jointly.' },
    { id: 'magi', label: 'Modified adjusted gross income (MAGI)', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, info: 'Roughly your adjusted gross income from your tax return, with a few deductions added back. For most people it is close to AGI.' },
  ],
  outputs: [
    { id: 'balanceAtRetirement', label: 'Balance at retirement', format: 'currency', primary: true, info: 'Your Roth IRA value at your retirement age. Qualified withdrawals are tax-free.' },
    { id: 'allowed', label: `Allowed contribution this year`, format: 'currency', info: `The most you can put in this year (${TAX_YEAR} rules) given your age and income. Your planned amount is capped at this.` },
    { id: 'totalContributed', label: 'Total you contribute', format: 'currency', info: 'The yearly contributions added from now until retirement, not counting your current balance.' },
    { id: 'taxFreeGrowth', label: 'Tax-free growth', format: 'currency', info: 'Final balance minus your current balance and everything you contribute. This is the part that grows tax-free.' },
    { id: 'years', label: 'Years of contributions', format: 'integer', suffix: 'years', info: 'Retirement age minus current age.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const retireAge = num(v.retireAge);
    const balance = num(v.balance) ?? 0;
    const planned = num(v.contribution);
    const rp = num(v.ret);
    const magi = num(v.magi);
    const status = v.status === 'mfj' ? 'mfj' : 'single';
    if (age === null || retireAge === null || planned === null || rp === null || magi === null) return { balanceAtRetirement: null };
    if (age < 18 || age > 99) return { balanceAtRetirement: null, error: 'Age must be between 18 and 99.' };
    if (retireAge <= age) return { balanceAtRetirement: null, error: 'Retirement age must be higher than your current age.' };
    if (retireAge > 100) return { balanceAtRetirement: null, error: 'Retirement age must be 100 or below.' };
    if (balance < 0 || planned < 0 || magi < 0) return { balanceAtRetirement: null, error: 'Amounts cannot be negative.' };
    if (rp < -10 || rp > 30) return { balanceAtRetirement: null, error: 'Annual return must be between -10% and 30%.' };

    const n = Math.floor(retireAge - age);
    const r = rp / 100;
    const catchUp = age >= 50;
    const base = IRA_LIMIT + (catchUp ? IRA_CATCHUP : 0);
    const { lower, upper } = PHASE_OUT[status];
    const limit = allowedLimit(base, magi, lower, upper);
    const allowed = Math.min(planned, limit);
    const capped = planned > limit;

    // Annual compounding, contribution at the end of each year.
    const balAt = (k: number) => balance * (1 + r) ** k + allowed * (r === 0 ? k : ((1 + r) ** k - 1) / r);
    const final = balAt(n);
    const totalContributed = allowed * n;
    const growth = final - balance - totalContributed;

    const ages = Array.from({ length: n + 1 }, (_, k) => age + k);
    const ks = ages.map((_, k) => k);
    const [area, donut] = growthCharts(ages, ks.map((k) => balance + allowed * k), ks.map(balAt), 'Money you put in', 'Tax-free growth');
    const charts: ChartSpec[] = [{ ...area, title: 'Roth IRA balance by age', xLabel: 'Age', xFormat: { format: 'integer' } } as ChartSpec, donut];

    const limitText = `${money(base, 0)} limit${catchUp ? ' including the 50+ catch-up' : ''}`;
    let incomeText: string;
    if (magi <= lower) incomeText = `Your MAGI is at or below ${money(lower, 0)}, so the full ${limitText} applies.`;
    else if (magi >= upper) incomeText = `Your MAGI is at or above ${money(upper, 0)}, so you cannot contribute directly to a Roth IRA this year.`;
    else incomeText = `Your MAGI is inside the ${money(lower, 0)} to ${money(upper, 0)} phase-out range, which cuts the ${limitText} to ${money(limit, 0)}.`;
    const cappedText = capped ? ` You planned ${money(planned, 0)}, so it is capped at ${money(allowed, 0)} here.` : '';

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    let badge: string;
    if (limit === 0) { tone = 'bad'; badge = 'Over income limit'; }
    else if (capped) { tone = 'warn'; badge = 'Capped at limit'; }
    else if (limit < base) { tone = 'ok'; badge = 'Reduced limit'; }
    else { tone = 'good'; badge = 'Full limit available'; }

    const steps = [
      `${TAX_YEAR} limit: ${money(IRA_LIMIT, 0)}${catchUp ? ` + ${money(IRA_CATCHUP, 0)} catch-up (age 50+) = ${money(base, 0)}` : ''}`,
      magi <= lower || magi >= upper
        ? `Income check: MAGI ${money(magi, 0)} vs phase-out ${money(lower, 0)} to ${money(upper, 0)} gives a limit of ${money(limit, 0)}`
        : `Phase-out: ${money(base, 0)} x (${money(magi, 0)} - ${money(lower, 0)}) / ${money(upper - lower, 0)} is subtracted, rounded up to the next $10 (minimum $200) = ${money(limit, 0)}`,
      `Contribution used: the smaller of ${money(planned, 0)} and ${money(limit, 0)} = ${money(allowed, 0)}`,
      `Balance after ${n} years = ${money(balance, 0)} x (1 + ${rp}%)^${n} + ${money(allowed, 0)} x ((1 + ${rp}%)^${n} - 1) / ${rp}% = ${money(final, 0)}`,
    ];

    return {
      balanceAtRetirement: final,
      allowed,
      totalContributed,
      taxFreeGrowth: growth,
      years: n,
      tone,
      badge,
      note: `${incomeText}${cappedText} By age ${age + n} your balance could reach ${money(final, 0)}, of which ${money(growth, 0)} is tax-free growth. Contributions are assumed at the end of each year with annual compounding, at this year's allowed amount.`,
      steps,
      chart: charts,
    };
  },
  content: {
    formula: [
      'Balance = B x (1 + r)^n + C x ((1 + r)^n - 1) / r  (C x n if r = 0)',
      'B = current balance, C = allowed yearly contribution, r = annual return, n = years to retirement',
      'Reduced limit = limit - limit x (MAGI - lower) / (upper - lower), rounded up to the next $10, minimum $200',
    ],
    body: [
      'A Roth IRA is funded with money you have already paid income tax on. In return, the growth is tax-free and qualified withdrawals in retirement are tax-free too. This calculator projects the balance at your retirement age and first checks that the amount you plan to contribute is allowed.',
      `The ${TAX_YEAR} limit for all your IRAs combined is ${money(IRA_LIMIT, 0)}, or ${money(IRA_LIMIT + IRA_CATCHUP, 0)} if you are 50 or older. You also need earned income at least as large as your contribution, which this calculator does not check. If your income is high, the Roth limit shrinks and eventually reaches zero.`,
      'Convention used: one contribution at the end of every year until your retirement age, with the return compounding annually. We use this year\'s allowed amount for every year, with no future limit increases and no change in your income. Fees, taxes on withdrawals before age 59 and a half and inflation are ignored, so the result is in future dollars.',
    ],
    sections: [
      {
        heading: `${TAX_YEAR} Roth IRA income limits`,
        paragraphs: [
          `For ${TAX_YEAR}, the Roth IRA contribution limit starts to shrink when your modified adjusted gross income (MAGI) passes ${money(PHASE_OUT.single.lower, 0)} for single filers or ${money(PHASE_OUT.mfj.lower, 0)} for married couples filing jointly. It reaches zero at ${money(PHASE_OUT.single.upper, 0)} (single) or ${money(PHASE_OUT.mfj.upper, 0)} (joint).`,
          'Inside the range, the IRS worksheet reduces your limit in proportion to how far through the range you are, rounds the result up to the next $10, and never goes below $200 while any contribution is allowed. This calculator follows that rule. Married filing separately and head of household have their own rules and are not covered here.',
        ],
      },
      {
        heading: 'Over the income limit?',
        paragraphs: [
          'If your income is too high for direct contributions, some people use a Roth conversion, often called a backdoor Roth. It has its own tax rules, so check the IRS guidance or ask a tax professional. A Roth 401(k) at work has no income limit.',
        ],
      },
    ],
    faq: [
      { q: `What is the Roth IRA contribution limit for ${TAX_YEAR}?`, a: `${money(IRA_LIMIT, 0)}, or ${money(IRA_LIMIT + IRA_CATCHUP, 0)} if you are 50 or older, shared across all your traditional and Roth IRAs. The limit can be lower if your income is in the phase-out range.` },
      { q: 'What are the Roth IRA income limits?', a: `For ${TAX_YEAR}, the limit phases out between ${money(PHASE_OUT.single.lower, 0)} and ${money(PHASE_OUT.single.upper, 0)} of MAGI for single filers, and between ${money(PHASE_OUT.mfj.lower, 0)} and ${money(PHASE_OUT.mfj.upper, 0)} for married filing jointly.` },
      { q: 'How much could I have at 65 with the defaults?', a: 'At age 30 with $10,000 saved, $7,500 a year and a 7% return, you would have about $1,143,542 at 65. You would contribute $262,500 and the other $871,042 is tax-free growth.' },
      { q: 'What happens if I plan to contribute more than I am allowed?', a: 'The calculator caps your plan at the allowed amount and says so in the note. For example, a single filer aged 30 with MAGI of $154,321 can contribute $6,840, so a planned $10,000 is cut to $6,840.' },
      { q: 'How is the reduced limit worked out?', a: 'You subtract limit x (MAGI - lower) / (upper - lower) from the limit, round up to the next $10, and use at least $200. A single filer aged 30 with MAGI of $160,500 is halfway through the range, so the $7,500 limit drops to $3,750.' },
      { q: 'Does the 50+ catch-up apply automatically?', a: `Yes. If your age is 50 or more, ${money(IRA_CATCHUP, 0)} is added to the ${money(IRA_LIMIT, 0)} base limit. The phase-out then applies to the larger ${money(IRA_LIMIT + IRA_CATCHUP, 0)} figure. For example, a married couple filing jointly at age 55 with MAGI of $247,000 gets $4,300.` },
      { q: 'Are Roth IRA withdrawals really tax-free?', a: 'Qualified withdrawals are: generally after age 59 and a half and once the account has been open five years. You can also take out your own contributions at any time without tax. Rules for earnings are in IRS Publication 590-B.' },
    ],
    sources: [
      { label: 'IRS: 401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500 (Notice 2025-67)', url: 'https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500' },
      { label: 'IRS Publication 590-A: Contributions to Individual Retirement Arrangements', url: 'https://www.irs.gov/publications/p590a' },
      { label: 'IRS Publication 590-B: Distributions from Individual Retirement Arrangements', url: 'https://www.irs.gov/publications/p590b' },
    ],
  },
  related: ['roth-vs-traditional', '401k-max-out', 'retirement', 'compound-interest'],
  examples: [
    // defaults: limit 7500, n = 35. Balance = 10000 x 1.07^35 + 7500 x (1.07^35 - 1)/0.07 = 1143542.40; contributed 262500; growth = 871042.40
    {
      values: { age: 30, retireAge: 65, balance: 10000, contribution: 7500, ret: 7, status: 'single', magi: 100000 },
      expect: { balanceAtRetirement: 1143542.4, allowed: 7500, totalContributed: 262500, taxFreeGrowth: 871042.4, years: 35, badge: 'Full limit available', tone: 'good' },
    },
    // single MAGI 160500: (160500-153000)/15000 = 0.5; 7500 - 3750 = 3750. Balance = 3750 x (1.07^35 - 1)/0.07 = 518388.29; contributed 131250
    {
      values: { age: 30, retireAge: 65, balance: 0, contribution: 7500, ret: 7, status: 'single', magi: 160500 },
      expect: { allowed: 3750, balanceAtRetirement: 518388.29, totalContributed: 131250, taxFreeGrowth: 387138.29, badge: 'Capped at limit' },
    },
    // MFJ age 55: limit 8600; (247000-242000)/10000 = 0.5; 8600 - 4300 = 4300; n=10, 5%: 50000 x 1.05^10 + 4300 x (1.05^10 - 1)/0.05 = 81444.73 + 54084.94 = 135529.67; contributed 43000
    {
      values: { age: 55, retireAge: 65, balance: 50000, contribution: 4300, ret: 5, status: 'mfj', magi: 247000 },
      expect: { allowed: 4300, balanceAtRetirement: 135529.67, totalContributed: 43000, taxFreeGrowth: 42529.67, badge: 'Reduced limit' },
    },
    // single MAGI 154321: reduction 7500 x 1321/15000 = 660.5; 7500 - 660.5 = 6839.5, rounded up to 6840. 0% return, 10 years: 20000 + 68400 = 88400
    {
      values: { age: 30, retireAge: 40, balance: 20000, contribution: 10000, ret: 0, status: 'single', magi: 154321 },
      expect: { allowed: 6840, balanceAtRetirement: 88400, totalContributed: 68400, taxFreeGrowth: 0 },
    },
    // single MAGI 167950: reduction 7500 x 14950/15000 = 7475; 25 -> minimum $200
    {
      values: { age: 30, retireAge: 31, balance: 0, contribution: 7500, ret: 0, status: 'single', magi: 167950 },
      expect: { allowed: 200, balanceAtRetirement: 200 },
    },
    // single MAGI 170000: above 168000 so no direct contribution; balance just grows. 1000 x 1.1^2 = 1210
    {
      values: { age: 30, retireAge: 32, balance: 1000, contribution: 7500, ret: 10, status: 'single', magi: 170000 },
      expect: { allowed: 0, balanceAtRetirement: 1210, badge: 'Over income limit', tone: 'bad' },
    },
  ],
});

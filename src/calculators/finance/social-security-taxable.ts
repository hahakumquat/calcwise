import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

// IRS Pub. 915 worksheet logic. Provisional income (PI) = other income + tax-exempt interest + 50% of benefits.
// PI <= base: 0 taxable. Otherwise tier 1 = min(50% of benefits, 50% x min(PI - base, adjusted - base)),
// taxable = min(85% of benefits, tier 1 + 85% x max(0, PI - adjusted)).
export default defineCalculator({
  slug: 'social-security-taxable',
  title: 'Social Security Taxable Benefits Calculator',
  category: 'finance',
  description: 'Find how much of your Social Security benefits is taxable. Enter benefits, other income and tax-exempt interest to see provisional income and the taxable share.',
  keywords: ['social security taxable calculator', 'is social security taxable', 'provisional income calculator', 'how much of social security is taxable', 'social security 85 percent taxable'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'status', label: 'Filing status', type: 'select', segmented: true, default: 'single', options: [{ value: 'single', label: 'Single' }, { value: 'mfj', label: 'Married filing jointly' }], info: 'Sets which thresholds apply. Married filing separately is not modelled.' },
    { id: 'benefits', label: 'Social Security benefits (yearly)', type: 'number', prefix: '$', default: 24000, min: 0, step: 500, info: 'Total benefits for the year before Medicare premiums are taken out (box 5 of Form SSA-1099). For a couple, add both together.' },
    { id: 'other', label: 'Other income (yearly)', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'Wages, pensions, IRA withdrawals, taxable interest, dividends and gains: everything on your return except Social Security.' },
    { id: 'exempt', label: 'Tax-exempt interest', type: 'number', prefix: '$', default: 0, min: 0, step: 100, info: 'Interest from municipal bonds and similar. It is not taxed itself but it counts toward provisional income.' },
    { id: 'base_s', label: 'Base threshold (single)', type: 'number', prefix: '$', default: 25000, min: 0, step: 500, showWhen: { input: 'status', is: 'single' }, info: 'Above this provisional income, up to 50% of benefits can be taxable. Set by law and not adjusted for inflation.' },
    { id: 'adj_s', label: 'Adjusted threshold (single)', type: 'number', prefix: '$', default: 34000, min: 0, step: 500, showWhen: { input: 'status', is: 'single' }, info: 'Above this provisional income, up to 85% of benefits can be taxable. Set by law and not adjusted for inflation.' },
    { id: 'base_m', label: 'Base threshold (married filing jointly)', type: 'number', prefix: '$', default: 32000, min: 0, step: 500, showWhen: { input: 'status', is: 'mfj' }, info: 'Above this provisional income, up to 50% of benefits can be taxable. Set by law and not adjusted for inflation.' },
    { id: 'adj_m', label: 'Adjusted threshold (married filing jointly)', type: 'number', prefix: '$', default: 44000, min: 0, step: 500, showWhen: { input: 'status', is: 'mfj' }, info: 'Above this provisional income, up to 85% of benefits can be taxable. Set by law and not adjusted for inflation.' },
  ],
  outputs: [
    { id: 'taxable', label: 'Taxable Social Security', format: 'currency', precision: 0, primary: true, info: 'The part of your benefits added to taxable income. It is then taxed at your normal rate.' },
    { id: 'pi', label: 'Provisional income', format: 'currency', precision: 0, info: 'Other income + tax-exempt interest + 50% of benefits.' },
    { id: 'pct', label: 'Share of benefits taxable', format: 'percent', precision: 1, info: 'Taxable benefits divided by total benefits. It can never exceed 85%.' },
  ],
  compute: (v) => {
    const single = v.status !== 'mfj';
    const b = num(v.benefits);
    const o = num(v.other);
    const e = num(v.exempt);
    const base = num(single ? v.base_s : v.base_m);
    const adj = num(single ? v.adj_s : v.adj_m);
    if ([b, o, e, base, adj].some((x) => x === null)) return { taxable: null };
    if ([b, o, e, base, adj].some((x) => (x as number) < 0)) return { taxable: null, error: 'Values cannot be negative.' };
    if (adj! < base!) return { taxable: null, error: 'The adjusted threshold must be at least the base threshold.' };

    const pi = o! + e! + 0.5 * b!;
    let tier1 = 0;
    let tier2 = 0;
    if (pi > base!) {
      tier1 = Math.min(0.5 * b!, 0.5 * Math.min(pi - base!, adj! - base!));
      tier2 = 0.85 * Math.max(0, pi - adj!);
    }
    const taxable = Math.min(0.85 * b!, tier1 + tier2);
    const pct = b! > 0 ? taxable / b! : 0;
    const tone = taxable === 0 ? 'good' : pct >= 0.85 ? 'warn' : 'ok';

    return {
      taxable,
      pi,
      pct,
      tone,
      badge: taxable === 0 ? 'None taxable' : `${(pct * 100).toFixed(1)}% taxable`,
      note: taxable === 0
        ? `Provisional income of ${money(pi)} is at or below the ${money(base!)} base threshold, so none of your benefits is taxable. Thresholds are not indexed to inflation.`
        : pct >= 0.85 - 1e-9
          ? `Provisional income of ${money(pi)} is high enough that the 85% maximum applies: ${money(taxable)} of ${money(b!)} is taxable. Federal tax only. State tax and married filing separately are not modelled.`
          : `Provisional income of ${money(pi)} puts ${money(taxable)} of your ${money(b!)} in taxable income. That is added to your other income and taxed at your normal rate. State tax is not modelled.`,
      chart: {
        type: 'bar' as const,
        title: 'Your benefits',
        categories: ['Benefits'],
        series: [
          { name: 'Taxable', values: [taxable] },
          { name: 'Not taxable', values: [b! - taxable] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Provisional income = ${money(o!)} + ${money(e!)} + 50% × ${money(b!)} = ${money(pi)}`,
        pi > base!
          ? `Tier 1 = smaller of 50% × ${money(b!)} and 50% × smaller of (${money(pi)} − ${money(base!)}) and (${money(adj!)} − ${money(base!)}) = ${money(tier1)}`
          : `${money(pi)} is not above the ${money(base!)} base threshold, so nothing is taxable`,
        `Tier 2 = 85% × amount of ${money(pi)} above ${money(adj!)} = ${money(tier2)}`,
        `Taxable = smaller of 85% × ${money(b!)} = ${money(0.85 * b!)} and ${money(tier1)} + ${money(tier2)} = ${money(taxable)}`,
      ],
    };
  },
  content: {
    formula: [
      'Provisional income = other income + tax-exempt interest + 50% of benefits',
      'Tier 1 = smaller of 50% of benefits and 50% × smaller of (income − base) and (adjusted − base)',
      'Tier 2 = 85% × (provisional income − adjusted threshold), never below 0',
      'Taxable = smaller of 85% of benefits and (tier 1 + tier 2)',
    ],
    body: [
      'Social Security benefits are not always tax free. Whether they are taxed depends on your provisional income, which is your other income, plus any tax-exempt interest, plus half of your benefits. The more of it above two thresholds, the more of your benefits becomes taxable, up to a cap of 85%.',
      'Example: you are single with $24,000 of benefits and $20,000 of other income. Provisional income is $20,000 + $12,000 = $32,000. That is $7,000 above the $25,000 base threshold, so tier 1 is 50% × $7,000 = $3,500. You are below the $34,000 adjusted threshold, so $3,500 of your benefits is taxable, or 14.6%.',
      'The thresholds are $25,000 and $34,000 for single filers and $32,000 and $44,000 for married filing jointly. They were set in law decades ago and are not adjusted for inflation, which is why more retirees owe tax on benefits each year. Because each extra dollar of income inside the tiers also pulls more benefits into tax, the effective rate on extra income (such as IRA withdrawals) can be well above your bracket rate. Planning withdrawals around the thresholds can help. You can edit the thresholds above if the rules change. This estimates federal tax on benefits only: state tax and married filing separately are not modelled. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much of my Social Security is taxable?', a: 'It depends on provisional income. At or below the base threshold ($25,000 single, $32,000 joint) none is taxable. Between the base and adjusted thresholds up to 50% can be, and above the adjusted threshold up to 85% can be. Use the calculator for your own numbers.' },
      { q: 'Can all of my Social Security be taxed?', a: 'No. At most 85% of your benefits is ever taxable. For example, with $30,000 of benefits and $100,000 of other income as a couple, the formula gives more than 85%, so the taxable amount is capped at $25,500.' },
      { q: 'What counts toward provisional income?', a: 'Your other income (wages, pensions, IRA withdrawals, interest, dividends, gains), plus tax-exempt interest, plus half of your Social Security benefits. Enter everything except Social Security as other income.' },
      { q: 'Are the thresholds adjusted for inflation?', a: 'No. The $25,000/$34,000 (single) and $32,000/$44,000 (joint) thresholds are fixed by law, so inflation and cost-of-living raises pull more people over them over time.' },
      { q: 'What about state tax and married filing separately?', a: 'Neither is modelled here. Many states do not tax benefits but some do, so check yours. Married filing separately usually has a much lower threshold if you lived with your spouse, so use the IRS worksheet for that case.' },
      { q: 'Why does an extra dollar of income cost so much more in retirement?', a: 'Inside the tiers, each extra $1 of other income also pulls more benefits into tax. Between the base and adjusted thresholds, $1 more income adds $0.50 of taxable benefits. Above the adjusted threshold it adds $0.85, until the 85% cap is reached. So a $1,000 IRA withdrawal can add up to $1,850 of taxable income. This is often called the tax torpedo.' },
      { q: 'At what income do 85% of my benefits become taxable?', a: 'It depends on your benefits. As an example, a single filer with $24,000 of benefits reaches the 85% cap ($20,400) at about $40,706 of other income, since provisional income is then about $52,706. Above that, extra income no longer pulls in more benefits.' },
      { q: 'Do Roth withdrawals and qualified charitable distributions count?', a: 'Qualified Roth withdrawals are not part of your income, so they do not raise provisional income. A qualified charitable distribution from an IRA is excluded from income too, so it can keep other income lower. Enter only the amounts that appear in your income.' },
      { q: 'Is taxable benefit the same as tax owed?', a: 'No. It is the amount added to your taxable income. You then pay tax on it at your normal rate, so the tax is only a fraction of that amount.' },
    ],
    sources: [
      { label: 'IRS Publication 915: Social Security and Equivalent Railroad Retirement Benefits', url: 'https://www.irs.gov/publications/p915' },
    ],
  },
  related: ['social-security-earnings-test', 'social-security-breakeven', 'social-security-cola', 'income-tax', 'roth-vs-traditional', 'qcd-tax-value'],
  examples: [
    // single; PI = 20,000 + 0 + 12,000 = 32,000; tier1 = min(12,000, 0.5 x min(7,000, 9,000) = 3,500) = 3,500; taxable 3,500; 3,500/24,000
    { values: { status: 'single', benefits: 24000, other: 20000, exempt: 0, base_s: 25000, adj_s: 34000 }, expect: { pi: 32000, taxable: 3500, pct: 3500 / 24000 } },
    // single; PI = 40,000 + 15,000 = 55,000; tier1 = min(15,000, 0.5 x min(30,000, 9,000) = 4,500) = 4,500; tier2 = 0.85 x 21,000 = 17,850; total 22,350 < 25,500
    { values: { status: 'single', benefits: 30000, other: 40000, exempt: 0, base_s: 25000, adj_s: 34000 }, expect: { pi: 55000, taxable: 22350, pct: 0.745 } },
    // joint; PI = 100,000 + 15,000 = 115,000; tier1 = min(15,000, 0.5 x 12,000 = 6,000) = 6,000; tier2 = 0.85 x 71,000 = 60,350; 66,350 capped at 0.85 x 30,000 = 25,500
    { values: { status: 'mfj', benefits: 30000, other: 100000, exempt: 0, base_m: 32000, adj_m: 44000 }, expect: { pi: 115000, taxable: 25500, pct: 0.85 } },
    // single; PI = 10,000 + 2,000 + 10,000 = 22,000 <= 25,000 -> 0
    { values: { status: 'single', benefits: 20000, other: 10000, exempt: 2000, base_s: 25000, adj_s: 34000 }, expect: { pi: 22000, taxable: 0, pct: 0 } },
    // joint; PI = 30,000 + 0 + 15,000 = 45,000; tier1 = min(15,000, 0.5 x min(13,000, 12,000) = 6,000) = 6,000; tier2 = 0.85 x 1,000 = 850; 6,850
    { values: { status: 'mfj', benefits: 30000, other: 30000, exempt: 0, base_m: 32000, adj_m: 44000 }, expect: { pi: 45000, taxable: 6850, pct: 6850 / 30000 } },
  ],
});

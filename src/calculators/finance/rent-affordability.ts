import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import {
  asStatus,
  CURRENCY,
  federalIncomeTax,
  ficaTax,
  FILING_STATUS_OPTIONS,
  money,
  moneyDonut,
  pct,
  STANDARD_DEDUCTION,
  TAX_YEAR,
} from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'rent-affordability',
  title: 'Rent Affordability Calculator',
  category: 'finance',
  description: `How much rent can you afford? Check rent against your ${TAX_YEAR} take-home pay with the 30% rule, the 40x rule and the 50/30/20 budget.`,
  keywords: ['rent affordability calculator', 'how much rent can i afford', '30% rule rent', '40x rent rule', '50/30/20 budget calculator', 'rent to income ratio', 'rent vs take home pay'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    { id: 'salary', label: 'Annual gross salary', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'Your yearly pay before taxes, from your offer letter or the gross line on a pay stub.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'The filing status you will use on your federal return. It sets your brackets and standard deduction.' },
    { id: 'stateRate', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, optional: true, help: 'A flat estimate. Use 0 for states without income tax.', info: 'Your approximate state income tax rate. States like Texas and Florida have none.' },
    { id: 'rent', label: 'Monthly rent (whole place)', type: 'number', prefix: '$', default: 1500, min: 0, step: 50, info: 'The total monthly rent for the home, before splitting with anyone.' },
    { id: 'roommates', label: 'People splitting the rent', type: 'number', default: 1, min: 1, max: 10, step: 1, optional: true, help: 'Including you. 1 means you pay it all.', info: 'The rent is divided equally by this number, and your share is what gets compared with your pay.' },
  ],
  outputs: [
    { id: 'net', label: 'Estimated monthly take-home', format: 'currency', primary: true, info: 'Your salary after federal income tax, Social Security, Medicare and state tax, divided by 12.' },
    { id: 'share', label: 'Your monthly rent share', format: 'currency', info: 'Monthly rent divided by the number of people splitting it.' },
    { id: 'pctNet', label: 'Rent as % of take-home', format: 'percent', precision: 1, info: 'Your rent share divided by your monthly take-home. 30% or less is comfortable.' },
    { id: 'pctGross', label: 'Rent as % of gross', format: 'percent', precision: 1, info: 'Your rent share divided by your monthly gross pay. This is the version the classic 30% rule uses.' },
    { id: 'maxGross', label: 'Max rent at 30% of gross', format: 'currency', info: '30% of your monthly gross pay, the common rule of thumb.' },
    { id: 'maxNet', label: 'Max rent at 30% of take-home', format: 'currency', info: '30% of your monthly take-home. It is stricter than the gross version because taxes come out first.' },
    { id: 'incomeNeeded', label: 'Income landlords usually ask for', format: 'currency', info: 'The 40x rule: annual income of at least 40 times your monthly rent share.' },
    { id: 'needs', label: '50/30/20 needs budget', format: 'currency', info: '50% of take-home, for rent, utilities, groceries, transport, insurance and minimum debt payments.' },
    { id: 'wants', label: '50/30/20 wants budget', format: 'currency', info: '30% of take-home, for dining out, subscriptions, hobbies and travel.' },
    { id: 'savings', label: '50/30/20 savings and debt payoff', format: 'currency', info: '20% of take-home, for savings, investing and paying down debt faster than the minimum.' },
    { id: 'needsLeft', label: 'Left in needs budget after rent', format: 'currency', help: 'Negative means rent alone is over the 50% needs slice.', info: 'The needs budget minus your rent share. This must cover all your other needs.' },
  ],
  compute: (v) => {
    const gross = num(v.salary);
    const rent = num(v.rent);
    if (gross === null || gross <= 0 || rent === null || rent < 0) return { net: null };
    const status = asStatus(v.status);
    const stateRate = num(v.stateRate) ?? 0;
    const peopleRaw = num(v.roommates) ?? 1;
    if (stateRate < 0 || peopleRaw < 1) return { net: null };
    const people = Math.round(peopleRaw);

    const taxable = Math.max(0, gross - STANDARD_DEDUCTION[status]);
    const federal = federalIncomeTax(taxable, status).tax;
    const fica = ficaTax(gross, status);
    const ficaTotal = fica.socialSecurity + fica.medicare;
    const state = (gross * stateRate) / 100;
    const netAnnual = gross - federal - ficaTotal - state;
    const net = netAnnual / 12;
    if (net <= 0) return { net: null, error: 'Estimated take-home pay is zero or less. Check the salary and state rate.' };

    const monthlyGross = gross / 12;
    const share = rent / people;
    const pctNet = share / net;
    const pctGross = share / monthlyGross;
    const maxGross = monthlyGross * 0.3;
    const maxNet = net * 0.3;
    const incomeNeeded = share * 40;
    const needs = net * 0.5;
    const wants = net * 0.3;
    const savings = net * 0.2;
    const needsLeft = needs - share;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    let badge: string;
    if (pctNet <= 0.3) {
      tone = 'good';
      badge = `Comfy: rent is ${pct(pctNet, 0)} of take-home`;
    } else if (pctNet <= 0.4) {
      tone = 'ok';
      badge = `Doable: rent is ${pct(pctNet, 0)} of take-home`;
    } else if (pctNet <= 0.5) {
      tone = 'warn';
      badge = `Tight: rent eats ${pct(pctNet, 0)} of take-home`;
    } else {
      tone = 'bad';
      badge = `Rent eats ${pct(pctNet, 0)} of take-home`;
    }

    // Donut: if rent fits inside the needs slice, show the full 50/30/20 split.
    // Otherwise show rent and whatever is left of take-home after it.
    const slices =
      share <= needs
        ? [
            { label: 'Rent', value: share },
            { label: 'Other needs', value: needs - share },
            { label: 'Wants', value: wants },
            { label: 'Savings', value: savings },
          ]
        : [
            { label: 'Rent', value: share },
            { label: 'Left after rent', value: Math.max(0, net - share) },
          ];
    const charts: ChartSpec[] = [
      moneyDonut('Your monthly take-home', slices, pct(pctNet, 0), 'goes to rent'),
      { type: 'bar', title: 'Your rent vs the 30% limits', categories: ['Your rent share', '30% of take-home', '30% of gross'], series: [{ name: 'Per month', values: [share, maxNet, maxGross] }], format: CURRENCY },
    ];

    const verdict =
      share <= maxNet
        ? `Your rent share is within the 30% of take-home limit of ${money(maxNet, 0)}.`
        : `Your rent share is ${money(share - maxNet, 0)} a month over the 30% of take-home limit of ${money(maxNet, 0)}.`;
    const fortyX = gross >= incomeNeeded ? 'You pass the 40x rule.' : `You miss the 40x rule: landlords would look for about ${money(incomeNeeded, 0)} a year.`;

    return {
      net,
      share,
      pctNet,
      pctGross,
      maxGross,
      maxNet,
      incomeNeeded,
      needs,
      wants,
      savings,
      needsLeft,
      tone,
      badge,
      chart: charts,
      steps: [
        `Federal income tax = tax on (${money(gross, 0)} - ${money(STANDARD_DEDUCTION[status], 0)} standard deduction) = ${money(federal)}`,
        `Social Security + Medicare = ${money(fica.socialSecurity)} + ${money(fica.medicare)} = ${money(ficaTotal)}`,
        `State tax = ${money(gross, 0)} × ${stateRate}% = ${money(state)}`,
        `Monthly take-home = (${money(gross, 0)} - ${money(federal)} - ${money(ficaTotal)} - ${money(state)}) ÷ 12 = ${money(net)}`,
        ...(people > 1 ? [`Your rent share = ${money(rent, 0)} ÷ ${people} = ${money(share)}`] : []),
        `Rent as % of take-home = ${money(share)} ÷ ${money(net)} = ${pct(pctNet, 1)}`,
        `50/30/20 = ${money(needs)} needs, ${money(wants)} wants, ${money(savings)} savings`,
      ],
      note: `${verdict} ${fortyX} Estimate for ${TAX_YEAR}: standard deduction, no 401(k) or other pre-tax deductions, one flat state rate. Not financial advice.`,
    };
  },
  content: {
    formula: [
      'Take-home = gross - federal income tax - Social Security - Medicare - state tax',
      'Rent share = monthly rent ÷ people splitting it',
      'Rent % of take-home = rent share ÷ (take-home ÷ 12)',
      '30% limit = 0.30 × monthly gross (or monthly take-home)',
      '40x rule: annual income ≥ 40 × monthly rent',
      '50/30/20 = 50% needs, 30% wants, 20% savings, each of take-home',
    ],
    body: [
      'Rent is the biggest bill for most renters, so the first question is how much of your pay it takes. This calculator turns your salary into an estimated monthly take-home figure, then compares your rent with the usual rules of thumb: the 30% rule, the 40x rule landlords use, and the 50/30/20 budget.',
      'The honest number to measure against is take-home pay, because that is the money you actually have. A rent that is 30% of your gross salary can be closer to 35% to 40% of what lands in your account. That is why the calculator shows both.',
      'If you split the place, enter the whole rent and how many people share it. Your share is the whole rent divided equally by that number. These are rules of thumb, not laws. High-cost cities push everyone over 30%, and a low-rent apartment can free up a lot of savings.',
    ],
    sections: [
      {
        heading: 'The 30% rule',
        paragraphs: [
          'The classic guideline says rent should be no more than 30% of your gross income. It comes from US housing policy, where households paying more than 30% of income on housing are called cost-burdened. Because it uses gross pay it is generous. This calculator also shows 30% of take-home, which is the stricter and more realistic ceiling.',
        ],
      },
      {
        heading: 'The 40x rent rule',
        paragraphs: [
          'Many landlords and property managers ask for an annual income of at least 40 times the monthly rent. A $1,500 apartment needs $60,000 a year. It is the same idea as the 30% rule (12 ÷ 40 = 30%), so a rent at exactly 30% of gross just passes. Some landlords accept a guarantor, a bigger deposit or proof of savings if you fall short.',
        ],
      },
      {
        heading: 'The 50/30/20 budget',
        paragraphs: [
          'Senator Elizabeth Warren and her daughter Amelia Warren Tyagi proposed this split in their 2005 book All Your Worth. Spend 50% of after-tax income on needs, 30% on wants and put 20% toward savings and debt payoff. Rent counts as a need, so your needs slice has to cover rent plus utilities, groceries, transport, insurance and minimum debt payments. The last output shows how much of the needs slice is left after rent.',
        ],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: [
          'It uses the standard deduction, one flat state rate applied to your gross salary, and no 401(k), health premiums or other pre-tax deductions, so take-home will differ from your real paycheck. Utilities, renters insurance, parking and fees are not included in rent. For a precise paycheck, use the take-home pay calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How much rent can I afford on $60,000 a year?', a: 'Single, with a 5% state tax rate, take-home is $47,390 a year, or $3,949.17 a month. The 30% of gross rule gives a maximum rent of $1,500 a month. The stricter 30% of take-home rule gives $1,184.75.' },
      { q: 'Is $1,500 rent too much on $60,000?', a: 'With the same assumptions, $1,500 is 38.0% of take-home and 30% of gross, so the verdict is doable but not comfortable. It also leaves $474.58 of the $1,974.58 needs budget for everything else, like utilities, food and transport.' },
      { q: 'What is the 40x rent rule?', a: 'Landlords often want your annual gross income to be at least 40 times the monthly rent. For $1,500 rent that is $60,000. The calculator shows this as the income landlords usually ask for, and says whether your salary passes.' },
      { q: 'How does splitting rent change the result?', a: 'Your share is the whole rent divided by the number of people. On $120,000 salary, single, no state tax, a $2,400 two-person rent is $1,200 each. Take-home is $7,770.83 a month, so rent is 15.4% of take-home and 12% of gross.' },
      { q: 'What does the 50/30/20 rule say?', a: 'Spend 50% of take-home on needs, 30% on wants and save or pay down debt with 20%. On $7,770.83 a month that is $3,885.42 for needs, $2,331.25 for wants and $1,554.17 for savings.' },
      { q: 'What if my rent is more than half of my take-home?', a: 'The badge turns red once rent passes 50% of take-home. At a $40,000 salary, single, 5% state tax, $1,800 rent is 66.8% of take-home ($2,693.33 a month), which is $453.33 more than the whole needs budget of $1,346.67. The chart then shows rent against what is left rather than a full 50/30/20 split.' },
    ],
    sources: [
      { label: 'Elizabeth Warren and Amelia Warren Tyagi, All Your Worth (2005)', url: 'https://www.simonandschuster.com/books/All-Your-Worth/Elizabeth-Warren/9780743269889' },
      { label: 'HUD: Defining housing affordability (the 30% standard)', url: 'https://www.huduser.gov/portal/pdredge/pdr-edge-featd-article-081417.html' },
      { label: 'IRS Rev. Proc. 2025-32: 2026 tax brackets and standard deductions', url: 'https://www.irs.gov/irb/2025-45_IRB' },
      { label: 'SSA: Contribution and benefit base', url: 'https://www.ssa.gov/oact/cola/cbb.html' },
    ],
  },
  related: ['take-home-pay', 'bonus-tax', 'home-affordability', '401k-max-out'],
  examples: [
    {
      // taxable 60,000 - 16,100 = 43,900: 12,400×10% + 31,500×12% = 1,240 + 3,780 = 5,020.
      // FICA 7.65% × 60,000 = 4,590; state 5% = 3,000; net 47,390/yr = 3,949.1667/mo.
      // Share 1,500; 1,500 ÷ 3,949.1667 = 0.379827; gross 1,500 ÷ 5,000 = 0.30.
      // Max 30% gross 1,500; 30% net 1,184.75; 40x = 60,000; 50/30/20 = 1,974.5833 / 1,184.75 / 789.8333; left 474.5833.
      values: { salary: 60000, status: 'single', stateRate: 5, rent: 1500, roommates: 1 },
      expect: { net: 3949.1667, share: 1500, pctNet: 0.379827, pctGross: 0.3, maxGross: 1500, maxNet: 1184.75, incomeNeeded: 60000, needs: 1974.5833, wants: 1184.75, savings: 789.8333, needsLeft: 474.5833 },
      tolerance: 1e-4,
    },
    {
      // taxable 103,900: 1,240 + 38,000×12% (4,560) + 53,500×22% (11,770) = 17,570. FICA 9,180. No state. Net 93,250/yr = 7,770.8333/mo.
      // Rent 2,400 ÷ 2 = 1,200; gross 1,200 ÷ 10,000 = 0.12; 30% gross 3,000; 30% net 2,331.25; 40x = 48,000.
      // 50/30/20 = 3,885.4167 / 2,331.25 / 1,554.1667; left 2,685.4167.
      values: { salary: 120000, status: 'single', stateRate: 0, rent: 2400, roommates: 2 },
      expect: { net: 7770.8333, share: 1200, pctNet: 0.154425, pctGross: 0.12, maxGross: 3000, maxNet: 2331.25, incomeNeeded: 48000, needs: 3885.4167, savings: 1554.1667, needsLeft: 2685.4167 },
      tolerance: 1e-4,
    },
    {
      // taxable 23,900: 1,240 + 11,500×12% (1,380) = 2,620. FICA 3,060; state 2,000. Net 32,320/yr = 2,693.3333/mo.
      // 1,800 ÷ 2,693.3333 = 21,600 ÷ 32,320 = 0.668317; gross 1,800 ÷ 3,333.3333 = 0.54. Needs 1,346.6667; left -453.3333.
      values: { salary: 40000, status: 'single', stateRate: 5, rent: 1800, roommates: 1 },
      expect: { net: 2693.3333, pctNet: 0.668317, pctGross: 0.54, needs: 1346.6667, needsLeft: -453.3333, incomeNeeded: 72000 },
      tolerance: 1e-4,
    },
  ],
});

import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, CURRENCY, money } from '../../lib/helpers/finance';

interface Plan {
  price: number;
  downPct: number;
  rate: number;
  term: number;
  taxPct: number;
  maintPct: number;
  closingPct: number;
  sellPct: number;
  appPct: number;
  rent: number;
  rentGrowthPct: number;
  invPct: number;
}

/** Net cost of owning for `years` years, then selling. Upfront cash is charged an opportunity cost at the investment return. */
function buyCost(p: Plan, years: number) {
  const loan = p.price * (1 - p.downPct / 100);
  const n = years * 12;
  const r = p.rate / 100 / 12;
  const pmt = amortizedPayment(loan, p.rate, p.term * 12);
  const balance = r === 0 ? loan - pmt * n : loan * (1 + r) ** n - (pmt * ((1 + r) ** n - 1)) / r;
  const upfront = p.price * (p.downPct / 100) + p.price * (p.closingPct / 100);
  const running = n * (pmt + (p.price * (p.taxPct + p.maintPct)) / 100 / 12);
  const saleValue = p.price * (1 + p.appPct / 100) ** years;
  const proceeds = saleValue * (1 - p.sellPct / 100) - balance;
  const opportunity = upfront * ((1 + p.invPct / 100) ** years - 1);
  return { pmt, balance, upfront, running, saleValue, proceeds, opportunity, net: upfront + running - proceeds + opportunity };
}

/** Total rent paid over `years` years, with rent rising once a year. */
function rentCost(p: Plan, years: number) {
  let total = 0;
  for (let y = 0; y < years; y++) total += 12 * p.rent * (1 + p.rentGrowthPct / 100) ** y;
  return total;
}

export default defineCalculator({
  slug: 'rent-vs-buy',
  title: 'Rent vs Buy Calculator',
  category: 'finance',
  seoTitle: 'Rent vs Buy Calculator: Which Costs Less?',
  description: 'Compare the true net cost of renting and buying a home over your time horizon, including interest, taxes, upkeep, selling costs and home price growth.',
  keywords: ['rent vs buy calculator', 'should i rent or buy', 'rent or buy a house', 'buying vs renting', 'break-even rent vs buy', 'is it cheaper to rent or buy'],
  updated: '2026-11-17',
  inputs: [
    { id: 'price', label: 'Home price', type: 'number', prefix: '$', default: 400000, min: 1, step: 5000, info: 'The purchase price of the home you are considering.' },
    { id: 'down', label: 'Down payment', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 1, info: 'The share of the price you pay in cash. The rest is the mortgage.' },
    { id: 'rate', label: 'Mortgage interest rate', type: 'number', suffix: '%', default: 6.5, min: 0, max: 30, step: 0.05, info: 'The annual rate on a fixed-rate mortgage, from a lender quote.' },
    { id: 'term', label: 'Mortgage term', type: 'number', suffix: 'years', default: 30, min: 5, max: 40, step: 5, info: 'The length of the loan. It must be at least as long as your stay.' },
    { id: 'tax', label: 'Property tax per year', type: 'number', suffix: '% of price', default: 1.1, min: 0, max: 10, step: 0.05, info: 'Annual property tax as a share of the home price. Your county assessor publishes local rates.' },
    { id: 'maint', label: 'Insurance and upkeep per year', type: 'number', suffix: '% of price', default: 1.5, min: 0, max: 10, step: 0.1, info: 'Homeowners insurance, repairs and HOA fees together, as a share of the price. A common planning figure is 1% to 2%.' },
    { id: 'closing', label: 'Buying closing costs', type: 'number', suffix: '% of price', default: 3, min: 0, max: 10, step: 0.5, info: 'Lender fees, title and other costs paid when you buy.' },
    { id: 'sell', label: 'Selling costs', type: 'number', suffix: '% of sale price', default: 6, min: 0, max: 15, step: 0.5, info: 'Agent commissions and fees paid when you sell.' },
    { id: 'appreciation', label: 'Home price growth per year', type: 'number', suffix: '%', default: 3, min: -10, max: 15, step: 0.5, info: 'How fast you expect the home value to rise. Negative means prices fall.' },
    { id: 'rent', label: 'Monthly rent for a similar home', type: 'number', prefix: '$', default: 2400, min: 0, step: 50, info: 'What it would cost to rent a comparable home today.' },
    { id: 'rentGrowth', label: 'Rent increase per year', type: 'number', suffix: '%', default: 3, min: -10, max: 15, step: 0.5, info: 'How much you expect rent to rise each year.' },
    { id: 'invest', label: 'Return on cash you keep invested', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.5, info: 'What the down payment and closing costs would earn if you rented and invested them instead.' },
    { id: 'years', label: 'How long you will stay', type: 'number', suffix: 'years', default: 7, min: 1, max: 30, step: 1, info: 'Years until you sell. Short stays favour renting because buying and selling costs are large.' },
  ],
  outputs: [
    { id: 'difference', label: 'Buying beats renting by', format: 'currency', primary: true, info: 'Net cost of renting minus net cost of buying over your stay. Positive means buying is cheaper; negative means renting is cheaper.' },
    { id: 'buyNet', label: 'Net cost of buying', format: 'currency', info: 'Down payment, closing costs, mortgage payments, tax and upkeep, plus the investment return you give up, minus what you get back when you sell.' },
    { id: 'rentNet', label: 'Total cost of renting', format: 'currency', info: 'All the rent you pay over the stay, with the yearly increase.' },
    { id: 'breakEven', label: 'Break-even year', format: 'text', info: 'The first year of staying when buying costs no more than renting. "Not within 30 years" if it never does.' },
    { id: 'payment', label: 'Monthly mortgage payment', format: 'currency', info: 'Principal and interest only, before tax and upkeep.' },
    { id: 'equity', label: 'Cash back when you sell', format: 'currency', info: 'Sale price minus selling costs minus the remaining loan balance.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const rent = num(v.rent);
    const years = num(v.years);
    if (price === null || price <= 0 || rent === null || rent < 0 || years === null || years < 1) return { difference: null };
    const p: Plan = {
      price,
      downPct: num(v.down) ?? 20,
      rate: num(v.rate) ?? 0,
      term: Math.round(num(v.term) ?? 30),
      taxPct: num(v.tax) ?? 0,
      maintPct: num(v.maint) ?? 0,
      closingPct: num(v.closing) ?? 0,
      sellPct: num(v.sell) ?? 0,
      appPct: num(v.appreciation) ?? 0,
      rent,
      rentGrowthPct: num(v.rentGrowth) ?? 0,
      invPct: num(v.invest) ?? 0,
    };
    const horizon = Math.round(years);
    if (p.downPct < 0 || p.downPct > 100 || p.term < 1 || horizon > p.term) return { difference: null, error: 'Your stay cannot be longer than the mortgage term.' };

    const buy = buyCost(p, horizon);
    const rentTotal = rentCost(p, horizon);
    const diff = rentTotal - buy.net;

    const ys: number[] = [];
    const buyLine: number[] = [];
    const rentLine: number[] = [];
    let breakEven: number | null = null;
    for (let y = 1; y <= p.term && y <= 30; y++) {
      const b = buyCost(p, y).net;
      const rr = rentCost(p, y);
      if (y <= Math.max(horizon, 10)) {
        ys.push(y);
        buyLine.push(b);
        rentLine.push(rr);
      }
      if (breakEven === null && b <= rr) breakEven = y;
    }
    const chart: ChartSpec = {
      type: 'line',
      title: 'Cumulative net cost if you sell in year…',
      x: ys,
      xLabel: 'Years',
      yFormat: CURRENCY,
      series: [
        { name: 'Buy (net of sale)', values: buyLine },
        { name: 'Rent', values: rentLine },
      ],
      markers: [{ x: horizon, label: 'Your stay' }],
    };

    const cheaper = diff >= 0;
    return {
      difference: diff,
      buyNet: buy.net,
      rentNet: rentTotal,
      breakEven: breakEven === null ? 'Not within 30 years' : `Year ${breakEven}`,
      payment: buy.pmt,
      equity: buy.proceeds,
      chart,
      tone: cheaper ? 'good' : 'warn',
      badge: cheaper ? `Buying wins by ${money(diff, 0)}` : `Renting wins by ${money(-diff, 0)}`,
      steps: [
        `Loan = ${money(price)} × (1 − ${p.downPct}%) = ${money(price * (1 - p.downPct / 100))}; payment ${money(buy.pmt)} a month`,
        `Buying: upfront ${money(buy.upfront, 0)} + payments, tax and upkeep ${money(buy.running, 0)} + lost investment return ${money(buy.opportunity, 0)} − cash back ${money(buy.proceeds, 0)} = ${money(buy.net, 0)}`,
        `Renting: ${horizon} years of rent rising ${p.rentGrowthPct}% a year = ${money(rentTotal, 0)}`,
      ],
      note: 'A simplified model: it ignores tax deductions, the investment return on monthly savings, and rent or price changes within a year.',
    };
  },
  content: {
    formula: [
      'Buy net cost = down payment + closing costs + (mortgage payment + tax + upkeep) × months + lost investment return − (sale price × (1 − selling costs) − loan balance)',
      'Rent cost = sum of 12 × rent × (1 + rent growth)^year',
      'Lost investment return = (down payment + closing costs) × ((1 + return)^years − 1)',
    ],
    body: [
      'Whether renting or buying costs less depends mostly on how long you stay. Buying has big one-off costs, closing costs when you buy and agent fees when you sell, so a short stay rarely pays them back. Over a longer stay, your mortgage payments build equity and the home may rise in value, which tilts the result toward buying.',
      'This calculator adds up everything you would spend on each path over your stay. For buying that is the down payment, closing costs, mortgage payments, property tax and upkeep, minus what you get back when you sell. It also charges the buyer for the investment return the down payment could have earned elsewhere. For renting it is the total rent, rising each year.',
      'The chart shows the cumulative net cost if you sold in each year, so you can see where the lines cross: the break-even year. Change the home price growth, rent increase and mortgage rate to see how sensitive the answer is. Small changes in assumptions can flip the result, so treat it as a guide to compare, not a prediction.',
    ],
    sections: [
      {
        heading: 'What this model leaves out',
        paragraphs: [
          'It does not include the mortgage interest tax deduction, the investment return on money a renter saves each month when owning costs more, or utilities that differ between the two. Property tax and upkeep are fixed at the starting price rather than growing with the home value. Renters insurance and moving costs are ignored.',
        ],
      },
    ],
    faq: [
      { q: 'Is it cheaper to rent or buy?', a: 'With the default inputs ($400,000 home, 20% down, 6.5% rate, $2,400 rent, 7 years) buying comes out about $21,626 cheaper than renting ($199,053 net cost against $220,679 of rent), and the break-even year is year 6. Change the inputs to match your own market, because local prices, rents and rates vary widely.' },
      { q: 'How long do I need to stay for buying to make sense?', a: 'With the default inputs the break-even is year 6, so a 7-year stay just clears it. Selling costs of around 6% and closing costs of about 3% usually take several years of lower monthly costs or price growth to recover.' },
      { q: 'Why does the calculator charge buyers an opportunity cost?', a: 'Money used for a down payment cannot be invested elsewhere. The calculator charges the buyer the return that cash could have earned, so renting and buying are compared fairly. Set the return to 0% to switch this off.' },
      { q: 'Does this include the mortgage interest deduction?', a: 'No. Deductions depend on your tax situation and many households take the standard deduction, so including it would overstate the benefit of buying for them.' },
    ],
    sources: [
      { label: 'CFPB: Owning a Home', url: 'https://www.consumerfinance.gov/owning-a-home/' },
    ],
  },
  related: ['mortgage', 'home-affordability', 'rent-affordability', 'refinance', 'net-worth'],
  examples: [
    // Zero everything: loan 240,000 at 0%, 360 payments of 666.667; after 60 months balance 200,000.
    // Buy: upfront 60,000 + running 40,000 − proceeds (300,000 − 200,000 = 100,000) = 0. Rent 1,000 × 60 = 60,000.
    { values: { price: 300000, down: 20, rate: 0, term: 30, tax: 0, maint: 0, closing: 0, sell: 0, appreciation: 0, rent: 1000, rentGrowth: 0, invest: 0, years: 5 }, expect: { buyNet: 0, rentNet: 60000, difference: 60000, payment: 666.6667, equity: 100000 }, tolerance: 1e-3 },
    // Add 3% closing (9,000), 6% selling: proceeds 300,000 × 0.94 − 200,000 = 82,000; tax 1% + upkeep 1% = 6,000/yr × 5 = 30,000.
    // Buy = 60,000 + 9,000 + 40,000 + 30,000 − 82,000 = 57,000. Rent 1,500 × 12 × (1 + 1.03 + 1.0609 + 1.092727 + 1.12550881) = 95,564.44458.
    { values: { price: 300000, down: 20, rate: 0, term: 30, tax: 1, maint: 1, closing: 3, sell: 6, appreciation: 0, rent: 1500, rentGrowth: 3, invest: 0, years: 5 }, expect: { buyNet: 57000, rentNet: 95564.44458 }, tolerance: 1e-3 },
    // 10% growth for 2 years: sale 363,000; balance 240,000 − 16,000 = 224,000; proceeds 139,000. Upfront 60,000 + running 16,000.
    // Opportunity 60,000 × (1.05² − 1) = 6,150. Buy = 76,000 + 6,150 − 139,000 = −56,850. Rent 2,000 × 24 = 48,000.
    { values: { price: 300000, down: 20, rate: 0, term: 30, tax: 0, maint: 0, closing: 0, sell: 0, appreciation: 10, rent: 2000, rentGrowth: 0, invest: 5, years: 2 }, expect: { buyNet: -56850, rentNet: 48000, difference: 104850 }, tolerance: 1e-3 },
  ],
});

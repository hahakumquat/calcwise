import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'rent-on-card',
  title: 'Pay Rent by Credit Card: Fee vs Rewards',
  category: 'finance',
  description: 'Paying rent by card costs a processing fee but earns points. See the monthly and yearly net, with any sign-up bonus, and the rewards rate needed to break even.',
  keywords: ['pay rent with credit card calculator', 'rent on credit card fee vs rewards', 'is paying rent with a credit card worth it', 'rent payment processing fee', 'credit card rent break even', 'rent rewards points calculator'],
  updated: '2026-11-23',
  inputs: [
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', default: 2000, min: 0, step: 50, info: 'The amount you would pay by card each month.' },
    { id: 'fee', label: 'Processing fee', type: 'number', suffix: '%', default: 2.9, min: 0, max: 10, step: 0.1, info: 'Rent payment services often charge about 2.5% to 3%, but it varies by service, and some landlords or cards differ. Use the figure shown at checkout.' },
    { id: 'points', label: 'Points earned per $1', type: 'number', default: 1, min: 0, step: 0.5, info: 'Rewards points per dollar on rent. Many cards earn 1 point per dollar; check your card terms, as rent may not earn bonus categories.' },
    { id: 'cpp', label: 'Value of one point', type: 'number', suffix: '¢', default: 1, min: 0, step: 0.1, info: 'What a point is worth to you in cents. 1.0 is the same as cash back. Higher values assume you redeem well.' },
    { id: 'bonus', label: 'Sign-up bonus value (optional)', type: 'number', prefix: '$', default: 0, min: 0, step: 50, optional: true, info: 'The dollar value of a bonus that this rent spend helps you earn. Counted once, in year one. Leave 0 if you do not need the rent to unlock it.' },
  ],
  outputs: [
    { id: 'net', label: 'Net per month (rewards − fee)', format: 'currency', primary: true, info: 'Monthly rewards value minus the monthly processing fee, before any bonus.' },
    { id: 'feeMonth', label: 'Fee per month', format: 'currency', info: 'Rent × processing fee %.' },
    { id: 'rewardsMonth', label: 'Rewards value per month', format: 'currency', info: 'Rent × points per dollar × cents per point ÷ 100.' },
    { id: 'netYear', label: 'Net in year one', format: 'currency', info: 'Net per month × 12, plus the sign-up bonus counted once.' },
    { id: 'breakeven', label: 'Break-even rewards rate', format: 'percent', precision: 2, info: 'Your rewards must be worth at least this much per dollar of rent. It equals the fee %.' },
  ],
  compute: (v) => {
    const rent = num(v.rent);
    const feePct = num(v.fee);
    const points = num(v.points);
    const cpp = num(v.cpp);
    const bonus = num(v.bonus) ?? 0;
    if (rent === null || feePct === null || points === null || cpp === null) return { net: null };
    if (rent < 0 || feePct < 0 || points < 0 || cpp < 0 || bonus < 0) return { net: null, error: 'Values cannot be negative.' };
    if (rent === 0) return { net: null, note: 'Enter your monthly rent to see the result.' };
    const rate = points * cpp; // cents of value per dollar = percent
    const fee = (rent * feePct) / 100;
    const rewards = (rent * rate) / 100;
    const net = rewards - fee;
    const netYear = net * 12 + bonus;
    const tone = netYear > 0 ? 'good' : netYear === 0 ? 'ok' : rewards < fee / 2 ? 'bad' : 'warn';
    return {
      net,
      feeMonth: fee,
      rewardsMonth: rewards,
      netYear,
      breakeven: feePct / 100,
      tone,
      badge: netYear > 0 ? (net < 0 ? 'Bonus carries it in year one' : 'Rewards beat the fee') : netYear === 0 ? 'Break-even' : 'Fee costs more than rewards',
      chart: {
        type: 'bar',
        title: 'Year one: fees vs rewards',
        categories: bonus > 0 ? ['Fees paid', 'Rewards', 'Sign-up bonus'] : ['Fees paid', 'Rewards'],
        series: [{ name: 'Per year', values: bonus > 0 ? [fee * 12, rewards * 12, bonus] : [fee * 12, rewards * 12] }],
        format: { format: 'currency' },
      },
      steps: [
        `Fee: ${usd(rent)} × ${feePct}% = ${usd(fee)} a month`,
        `Rewards rate: ${points} points × ${cpp}¢ = ${rate}¢ per dollar, so ${usd(rent)} × ${rate}% = ${usd(rewards)} a month`,
        `Net: ${usd(rewards)} − ${usd(fee)} = ${usd(net)} a month`,
        `Year one: ${usd(net)} × 12${bonus > 0 ? ` + ${usd(bonus)} bonus` : ''} = ${usd(netYear)}`,
        `Break-even: rewards must be worth ${feePct}¢ per dollar; yours are ${rate}¢`,
      ],
      note: 'Only worth it if you pay the card in full each month; interest wipes out any rewards. Fees, terms and whether rent earns points vary, so check them before you pay.',
    };
  },
  content: {
    formula: [
      'Fee = rent × processing fee %',
      'Rewards value = rent × points per $1 × cents per point ÷ 100',
      'Net per month = rewards value − fee',
      'Net in year one = net per month × 12 + sign-up bonus',
      'Break-even rewards rate = processing fee %',
    ],
    body: [
      'Many landlords do not take cards, so renters use a payment service that does and charges a processing fee, commonly around 2.5% to 3%. The card then earns points or cash back on the rent. This calculator sets the fee against the rewards so you can see whether the trade is worth it.',
      'The break-even is simple: the rewards you earn per dollar must be worth at least as much as the fee per dollar. Most cards earn 1 to 2 cents of value per dollar, so for most people a 2% to 3% fee costs more than the rewards pay. It tends to win only with a high-rate card (for example 2 points per dollar at 1.5 cents each) or a large sign-up bonus.',
      'The sign-up bonus is the usual reason to do this. If the rent spend is what gets you over a minimum-spend requirement, enter the bonus value and it is counted once in year one. Only count it if you would not meet the requirement otherwise. After year one the bonus is gone, so the monthly net is the better guide to the long run.',
      'This does not model interest, annual fees, caps on earning, or a card that does not give points on rent. If you carry a balance, interest will cost far more than any reward. For the points side see the points value calculator, and for bonus spending see the sign-up bonus pace calculator.',
    ],
    faq: [
      { q: 'Is paying rent by credit card worth it?', a: 'Usually not, unless you have a big sign-up bonus or a high-rate card. At the defaults, $2,000 rent with a 2.9% fee costs $58 a month, while 1 point per dollar at 1 cent earns $20, so you lose $38 a month, or $456 a year.' },
      { q: 'When does it break even?', a: 'When your rewards rate equals the fee. With a 2.9% fee you need 2.9 cents of value per dollar. For example, 2 points per dollar at 1.5 cents is 3%, which earns $60 on $2,000 against a $58 fee: a net gain of $2 a month, or $24 a year.' },
      { q: 'How does a sign-up bonus change it?', a: 'It is added once to year one. With a $200 bonus at the default settings, year one is $200 − $456 = −$256, so the bonus helps but does not cover the loss. A bonus of about $456 would just break even. Only count a bonus the rent spend actually unlocks.' },
      { q: 'What fee should I enter?', a: 'The one shown at checkout. Rent payment services commonly charge around 2.5% to 3%, but it varies by service, and some landlords, cards and payment methods differ, so do not assume 2.9%.' },
      { q: 'What if I carry a balance?', a: 'Then do not do this. Card interest is typically far higher than a fee of 3%, and it would cancel out the rewards many times over.' },
    ],
    sources: [
      { label: 'CFPB: Credit cards', url: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/' },    ],
  },
  related: ['points-value', 'signup-bonus-pace', 'credit-card-annual-fee', 'rent-affordability', 'credit-card-payoff', 'cash-back-rewards'],
  examples: [
    // defaults: fee 2000 × 2.9% = 58; rate 1 × 1 = 1% so rewards 20; net -38; year -456; breakeven 0.029
    { values: { rent: 2000, fee: 2.9, points: 1, cpp: 1, bonus: 0 }, expect: { feeMonth: 58, rewardsMonth: 20, net: -38, netYear: -456, breakeven: 0.029 }, tolerance: 1e-6 },
    // 2 × 1.5 = 3% so rewards 60; fee 58; net +2; year 24
    { values: { rent: 2000, fee: 2.9, points: 2, cpp: 1.5, bonus: 0 }, expect: { feeMonth: 58, rewardsMonth: 60, net: 2, netYear: 24, breakeven: 0.029 }, tolerance: 1e-6 },
    // rent 1500, fee 2.5% = 37.5; 1 × 1 = 1% so rewards 15; net -22.5; year -270 + 600 bonus = 330
    { values: { rent: 1500, fee: 2.5, points: 1, cpp: 1, bonus: 600 }, expect: { feeMonth: 37.5, rewardsMonth: 15, net: -22.5, netYear: 330, breakeven: 0.025 }, tolerance: 1e-6 },
  ],
});

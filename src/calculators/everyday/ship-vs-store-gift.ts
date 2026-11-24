import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'ship-vs-store-gift',
  title: 'Ship It or Fetch It: Online vs In-Store Cost',
  category: 'everyday',
  description: 'Compare buying a gift online with shipping against driving to the store. Count shipping, miles and your time to see which costs less.',
  keywords: ['online vs in-store cost', 'is it cheaper to buy online or in store', 'shipping vs driving to the store', 'last minute gift shopping cost', 'cost of driving to a store'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'online', label: 'Online price', type: 'number', prefix: '$', default: 59.99, min: 0, step: 0.01, info: 'The item price online, before shipping.' },
    { id: 'shipping', label: 'Shipping', type: 'number', prefix: '$', default: 7.95, min: 0, step: 0.05, info: 'Shipping and handling online. Enter 0 if free.' },
    { id: 'store', label: 'Store price', type: 'number', prefix: '$', default: 64.99, min: 0, step: 0.01, info: 'The item price in the store.' },
    { id: 'miles', label: 'Round-trip miles', type: 'number', default: 12, min: 0, step: 1, info: 'Distance to the store and back.' },
    { id: 'rate', label: 'Cost per mile', type: 'number', prefix: '$', default: 0.67, min: 0, step: 0.01, info: 'Your own cost per mile driven. Use fuel only for a lower figure.' },
    { id: 'minutes', label: 'Minutes in the store trip', type: 'number', default: 40, min: 0, step: 5, info: 'Total time for the trip, including driving and parking.' },
    { id: 'hour', label: 'Value of an hour', type: 'number', prefix: '$', default: 20, min: 0, step: 1, info: 'What an hour of your time is worth to you. Enter 0 to ignore time.' },
  ],
  outputs: [
    { id: 'diff', label: 'Online is cheaper by', format: 'currency', precision: 2, primary: true, info: 'Store total with time − online total. Negative means the store is cheaper.' },
    { id: 'onlineTotal', label: 'Online total', format: 'currency', precision: 2, info: 'Online price + shipping.' },
    { id: 'storeTotal', label: 'Store total (with time)', format: 'currency', precision: 2, info: 'Store price + driving cost + time cost.' },
    { id: 'diffNoTime', label: 'Difference before time', format: 'currency', precision: 2, info: 'Store price + driving cost − online total.' },
  ],
  compute: (v) => {
    const online = num(v.online);
    const ship = num(v.shipping);
    const store = num(v.store);
    const miles = num(v.miles);
    const rate = num(v.rate);
    const minutes = num(v.minutes);
    const hour = num(v.hour);
    if ([online, ship, store, miles, rate, minutes, hour].some((x) => x === null)) return { diff: null };
    if ([online, ship, store, miles, rate, minutes, hour].some((x) => (x as number) < 0)) return { diff: null };
    const onlineTotal = online! + ship!;
    const drive = miles! * rate!;
    const timeCost = (minutes! / 60) * hour!;
    const storeBase = store! + drive;
    const storeTotal = storeBase + timeCost;
    const diff = storeTotal - onlineTotal;
    const diffNoTime = storeBase - onlineTotal;
    return {
      diff,
      onlineTotal,
      storeTotal,
      diffNoTime,
      tone: diff > 0 ? 'good' : diff < 0 ? 'warn' : 'ok',
      badge: diff > 0 ? `Online is cheaper by ${money(diff)}` : diff < 0 ? `The store is cheaper by ${money(-diff)}` : 'Exactly even',
      note: `Online costs ${money(onlineTotal)}. The store costs ${money(store!)} plus ${money(drive)} to drive plus ${money(timeCost)} of your time, ${money(storeTotal)} in all. ${diff >= 0 ? 'Online' : 'The store'} wins by ${money(Math.abs(diff))}, or by ${money(Math.abs(diffNoTime))} before counting time. Delivery dates are not modelled.`,
      chart: {
        type: 'bar' as const,
        title: 'Total cost',
        categories: ['Online', 'Store'],
        series: [
          { name: 'Item and shipping', values: [onlineTotal, store!] },
          { name: 'Driving', values: [0, drive] },
          { name: 'Your time', values: [0, timeCost] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Online = ${money(online!)} + ${money(ship!)} = ${money(onlineTotal)}`,
        `Driving = ${miles} mi × ${money(rate!)} = ${money(drive)}`,
        `Time = ${minutes} ÷ 60 × ${money(hour!)} = ${money(timeCost)}`,
        `Store = ${money(store!)} + ${money(drive)} + ${money(timeCost)} = ${money(storeTotal)}`,
        `Difference = ${money(storeTotal)} − ${money(onlineTotal)} = ${money(diff)}`,
      ],
    };
  },
  content: {
    formula: [
      'Online total = online price + shipping',
      'Driving cost = round-trip miles × cost per mile',
      'Time cost = minutes ÷ 60 × value of an hour',
      'Store total = store price + driving cost + time cost',
      'Difference = store total − online total',
    ],
    body: [
      'A store price that looks lower can lose once you count the drive and the hour it takes. This calculator puts shipping on one side and miles and minutes on the other.',
      'Example: $59.99 online plus $7.95 shipping is $67.94. In the store the item is $64.99, a 12-mile round trip at $0.67 is $8.04, and 40 minutes at $20 an hour is $13.33. The store total is $86.36, so online is cheaper by $18.42, or by $5.09 before counting time.',
      'Delivery dates are not modelled: if the gift must arrive by a deadline, the cheaper option may not be the right one. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Should I count my time?', a: 'Only if you would otherwise use it for something that matters to you. Set the value of an hour to 0 to leave time out.' },
      { q: 'What cost per mile should I use?', a: 'Use your own figure. A lower fuel-only number suits a car you would drive anyway; a full cost per mile includes wear and depreciation.' },
      { q: 'What if shipping is free?', a: 'Enter 0 for shipping. Online then costs just the item price.' },
      { q: 'Does it handle returns or delivery risk?', a: 'No. It compares the cost of buying only, and does not model delivery dates or returns.' },
      { q: 'What if I would pass the store anyway?', a: 'Enter 0 for miles and minutes, since the trip would cost you nothing extra.' },
    ],
    sources: [],
  },
  related: ['free-shipping-threshold', 'cost-per-mile', 'real-hourly-wage', 'gift-budget'],
  examples: [
    // online 59.99+7.95=67.94; drive 12*.67=8.04; time 40/60*20=13.3333; store 64.99+8.04+13.3333=86.3633; diff 18.4233; noTime 5.09
    { values: { online: 59.99, shipping: 7.95, store: 64.99, miles: 12, rate: 0.67, minutes: 40, hour: 20 }, expect: { onlineTotal: 67.94, storeTotal: 64.99 + 8.04 + 40 / 3, diff: 64.99 + 8.04 + 40 / 3 - 67.94, diffNoTime: 5.09 } },
    // free ship, same price, no trip cost: online 50, store 50 -> 0
    { values: { online: 50, shipping: 0, store: 50, miles: 0, rate: 0.67, minutes: 0, hour: 20 }, expect: { onlineTotal: 50, storeTotal: 50, diff: 0, diffNoTime: 0 } },
  ],
});

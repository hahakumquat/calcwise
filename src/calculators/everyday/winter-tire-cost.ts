import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'winter-tire-cost',
  title: 'Winter Tire Cost Per Year Calculator',
  category: 'everyday',
  description: 'Work out what a second set of winter tires really costs per year: the tires, optional rims, swap fees and storage, spread over the seasons they last.',
  keywords: ['winter tire cost calculator', 'are winter tires worth it cost', 'second set of tires on rims', 'winter tire swap cost per year', 'snow tire cost per year', 'seasonal tire changeover cost'],
  updated: '2026-11-23',
  inputs: [
    { id: 'tires', label: 'Price of the winter tires', type: 'number', prefix: '$', default: 600, min: 0, step: 25, info: 'The full set of four, including mounting and balancing the first time.' },
    { id: 'rims', label: 'Price of extra rims', type: 'number', prefix: '$', default: 400, min: 0, step: 25, info: 'Enter 0 if you mount the tires on your existing rims each season.' },
    { id: 'life', label: 'Winters the set lasts', type: 'number', suffix: 'winters', default: 6, min: 1, max: 20, step: 1, info: 'How many winter seasons you expect before replacing the set.' },
    { id: 'fee', label: 'Cost per changeover', type: 'number', prefix: '$', default: 40, min: 0, step: 5, info: 'What the shop charges to swap the set, or to remount tires on rims.' },
    { id: 'swaps', label: 'Changeovers per year', type: 'number', default: 2, min: 0, max: 4, step: 1, info: 'Usually two: on in the fall, off in the spring.' },
    { id: 'storage', label: 'Storage per year', type: 'number', prefix: '$', default: 0, min: 0, step: 10, info: 'Shop storage fee for the set you are not using. Enter 0 if you store it at home.' },
    { id: 'wear', label: 'Wear saved on your other tires per year', type: 'number', prefix: '$', default: 0, min: 0, step: 10, info: 'Your other set is not used in winter, so it lasts longer. Optional, and your own estimate.' },
  ],
  outputs: [
    { id: 'perYear', label: 'Cost per year', format: 'currency', primary: true, info: 'Tires and rims spread over their life, plus yearly swap and storage costs, minus wear saved.' },
    { id: 'upfront', label: 'Upfront cost', format: 'currency', info: 'Tires plus rims.' },
    { id: 'running', label: 'Swap and storage per year', format: 'currency', info: 'Changeover fees plus storage.' },
    { id: 'total', label: 'Total over the life of the set', format: 'currency', info: 'Cost per year × winters the set lasts.' },
  ],
  compute: (v) => {
    const tires = num(v.tires);
    const rims = num(v.rims);
    const life = num(v.life);
    const fee = num(v.fee);
    const swaps = num(v.swaps);
    const storage = num(v.storage) ?? 0;
    const wear = num(v.wear) ?? 0;
    if (tires === null || rims === null || life === null || fee === null || swaps === null) return { perYear: null };
    if (tires < 0 || rims < 0 || fee < 0 || swaps < 0 || storage < 0 || wear < 0) return { perYear: null, error: 'Values cannot be negative.' };
    if (life < 1) return { perYear: null, error: 'The set must last at least 1 winter.' };
    if (tires + rims === 0) return { perYear: null, note: 'Enter the price of the tires to see the result.' };
    const upfront = tires + rims;
    const running = fee * swaps + storage;
    const perYear = upfront / life + running - wear;
    const total = perYear * life;
    return {
      perYear,
      upfront,
      running,
      total,
      tone: 'ok',
      badge: 'About ' + usd(perYear / 12) + ' a month, all year',
      chart: {
        type: 'bar',
        title: 'Where each year of cost comes from',
        categories: ['Tires and rims', 'Swaps and storage', 'Wear saved'],
        series: [{ name: 'Per year', values: [upfront / life, running, -wear] }],
        format: { format: 'currency' },
      },
      steps: [
        `Upfront: ${usd(tires)} + ${usd(rims)} = ${usd(upfront)}`,
        `Spread over ${life} winters: ${usd(upfront)} ÷ ${life} = ${usd(upfront / life)} a year`,
        `Swaps and storage: ${usd(fee)} × ${swaps} + ${usd(storage)} = ${usd(running)} a year`,
        `Cost per year: ${usd(upfront / life)} + ${usd(running)} − ${usd(wear)} = ${usd(perYear)}`,
      ],
      note: 'A straight spread of cost with no interest. It does not compare safety or grip, and your insurance or local rules may matter. Prices, tire life and wear savings are your own figures.',
    };
  },
  content: {
    formula: [
      'Upfront = tires + extra rims',
      'Running cost per year = changeover fee × changeovers + storage',
      'Cost per year = upfront ÷ winters the set lasts + running cost − wear saved on your other tires',
    ],
    body: [
      'A second set of tires looks expensive at the checkout, but the cost is spread over several winters. Spreading it out, and adding the swap fees you pay every year, gives a fairer yearly number to weigh against other costs.',
      'Rims make swaps cheaper because the shop only has to switch the wheels instead of remounting tires, but they add to the price up front. Enter 0 for rims if you remount tires on your existing wheels, and put the shop\'s mount-and-balance fee in the changeover cost.',
      'Your other tires sit in the garage in winter, so they wear more slowly. If you can put a number on that, enter it as wear saved; leaving it at 0 keeps the result on the cautious side.',
      'This calculator only deals with cost. It does not judge whether winter tires are worth it for you, which depends on your roads, climate and driving.',
    ],
    faq: [
      { q: 'How much do winter tires cost per year?', a: 'In the default example, $600 of tires and $400 of rims over 6 winters is $166.67 a year, plus two $40 changeovers, for $246.67 a year in total.' },
      { q: 'Is it cheaper to buy a second set of rims?', a: 'It costs more up front, but each swap is usually cheaper than remounting tires. Whether it comes out ahead depends on the swap fee and how many winters the set lasts. Try both with rims at 0 and at the rim price.' },
      { q: 'Do winter tires save wear on my other tires?', a: 'Yes. Each set is only on the car part of the year, so both last more seasons. That saving is optional here because it depends on how many miles you drive.' },
      { q: 'How many winters do winter tires last?', a: 'It depends on mileage, tread depth and storage. Check the tread and the tire\'s age with your shop; the figure here is your own estimate.' },
    ],
    sources: [
      { label: 'NHTSA: Tires', url: 'https://www.nhtsa.gov/equipment/tires' },
    ],
  },
  related: ['tire-pressure-cold', 'cost-per-mile', 'ev-vs-gas-cost'],
  examples: [
    // upfront 1000; 1000/6 = 166.6667; running 80; perYear 246.6667; total 1480
    { values: { tires: 600, rims: 400, life: 6, fee: 40, swaps: 2, storage: 0, wear: 0 }, expect: { perYear: 246.6667, upfront: 1000, running: 80, total: 1480 }, tolerance: 0.001 },
    // 700/5 = 140; running 100*2+60 = 260; minus wear 150 -> 250; total 1250
    { values: { tires: 700, rims: 0, life: 5, fee: 100, swaps: 2, storage: 60, wear: 150 }, expect: { perYear: 250, running: 260, total: 1250 }, tolerance: 1e-6 },
  ],
});

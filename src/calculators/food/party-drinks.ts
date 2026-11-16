import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// All drink-rate constants are a party-planning rule of thumb, NOT a verified published standard.
// We could not open the Omni Calculator page or the NIAAA page from our build environment,
// so the per-hour rule below is our own rule of thumb (search snippets of similar calculators
// quote 2 in the first hour and about 1 per hour after, and a 10-20% buffer).
const FIRST_HOUR = 2; // drinks per drinking guest in hour one (rule of thumb)
const LATER_HOURS = 1; // drinks per guest per later hour (rule of thumb)
const BUFFER = 0.15; // +15% so you do not run out (rule of thumb)
const GLASSES_PER_BOTTLE = 5; // 750 ml bottle / 150 ml glass = 5 (arithmetic)
const SHOTS_PER_BOTTLE = 17; // 750 ml / 44 ml (1.5 US fl oz) = 17.0, one standard spirits serving
const FLUTES_PER_BOTTLE = 6; // approx. toast pours from a 750 ml bottle (about 125 ml each)

const ceil = (x: number) => Math.ceil(x - 1e-9);
const r1 = (x: number) => Math.round(x * 10) / 10;

export default defineCalculator({
  slug: 'party-drinks',
  title: "New Year's Eve Party Drinks Calculator",
  category: 'food',
  description: "How many drinks, bottles of wine and bubbly to buy for a New Year's Eve party, from guests, hours and your beer, wine and spirits mix. Never drink and drive.",
  keywords: ['party drink calculator', 'new years eve drinks calculator', 'how many bottles of wine for a party', 'how many drinks per person per hour', 'champagne for new year toast', 'party alcohol calculator'],
  inputs: [
    { id: 'guests', label: 'Drinking guests', type: 'number', default: 20, min: 1, step: 1, info: 'Guests who will drink alcohol.' },
    { id: 'hours', label: 'Party length', type: 'number', default: 5, min: 1, step: 0.5, suffix: 'hours', info: 'Hours guests will be drinking, at least 1.' },
    { id: 'beer', label: 'Beer share', type: 'number', default: 30, min: 0, max: 100, step: 5, suffix: '%', info: 'The four shares (beer, wine, spirits, bubbly) must add up to 100%.' },
    { id: 'wine', label: 'Wine share', type: 'number', default: 40, min: 0, max: 100, step: 5, suffix: '%', info: 'Still wine, poured at 150 ml per glass.' },
    { id: 'spirits', label: 'Spirits share', type: 'number', default: 20, min: 0, max: 100, step: 5, suffix: '%', info: 'Liquor and cocktails, about 1.5 fl oz per drink.' },
    { id: 'bubbly', label: 'Bubbly share', type: 'number', default: 10, min: 0, max: 100, step: 5, suffix: '%', info: 'Champagne or sparkling wine served as regular drinks, not the midnight toast.' },
    { id: 'nondrinkers', label: 'Non-drinkers (optional)', type: 'number', default: 0, min: 0, step: 1, info: 'Used only to count sparkling juice bottles for the midnight toast.' },
  ],
  outputs: [
    { id: 'totalDrinks', label: 'Total drinks to buy', primary: true, precision: 0, info: 'Per guest: 2 drinks in hour one plus 1 per later hour, times guests, plus 15%.' },
    { id: 'beerCans', label: 'Beers (12 oz)', precision: 0, info: 'Beer share of drinks, rounded up.' },
    { id: 'wineBottles', label: 'Wine bottles (750 ml)', precision: 0, info: 'Wine drinks / 5 glasses per bottle, rounded up.' },
    { id: 'spiritBottles', label: 'Spirits bottles (750 ml)', precision: 0, info: 'Spirits drinks / 17 servings of 1.5 fl oz per bottle, rounded up.' },
    { id: 'bubblyBottles', label: 'Bubbly bottles (750 ml)', precision: 0, info: 'Bubbly drinks / 5 glasses per bottle, rounded up.' },
    { id: 'toastBottles', label: 'Midnight toast bottles', precision: 0, info: 'One flute per drinking guest, about 6 flutes per 750 ml bottle, rounded up. Extra to the bubbly above.' },
    { id: 'juiceBottles', label: 'Sparkling juice for toast', precision: 0, info: 'One flute per non-drinker, 6 per bottle, rounded up.' },
  ],
  compute: (v) => {
    const guests = num(v.guests);
    const hours = num(v.hours);
    const nd = num(v.nondrinkers) ?? 0;
    const beer = num(v.beer) ?? 0;
    const wine = num(v.wine) ?? 0;
    const spirits = num(v.spirits) ?? 0;
    const bubbly = num(v.bubbly) ?? 0;
    if (guests === null || guests < 1) return { totalDrinks: null, error: 'Enter at least one drinking guest.' };
    if (hours === null || hours < 1) return { totalDrinks: null, error: 'Enter a party length of at least 1 hour.' };
    if (nd < 0 || beer < 0 || wine < 0 || spirits < 0 || bubbly < 0) return { totalDrinks: null, error: 'Values cannot be negative.' };
    const sum = beer + wine + spirits + bubbly;
    if (Math.abs(sum - 100) > 0.01) return { totalDrinks: null, error: `The four shares add up to ${r1(sum)}%. Make them add up to 100%.` };

    const perGuest = FIRST_HOUR + (hours - 1) * LATER_HOURS;
    const base = guests * perGuest;
    const total = base * (1 + BUFFER);
    const beerDrinks = total * beer / 100;
    const wineDrinks = total * wine / 100;
    const spiritDrinks = total * spirits / 100;
    const bubblyDrinks = total * bubbly / 100;
    const beerCans = ceil(beerDrinks);
    const wineBottles = ceil(wineDrinks / GLASSES_PER_BOTTLE);
    const spiritBottles = ceil(spiritDrinks / SHOTS_PER_BOTTLE);
    const bubblyBottles = ceil(bubblyDrinks / GLASSES_PER_BOTTLE);
    const toastBottles = ceil(guests / FLUTES_PER_BOTTLE);
    const juiceBottles = ceil(nd / FLUTES_PER_BOTTLE);

    return {
      totalDrinks: total,
      beerCans,
      wineBottles,
      spiritBottles,
      bubblyBottles,
      toastBottles,
      juiceBottles,
      tone: 'good',
      badge: `About ${Math.ceil(total)} drinks. Arrange a ride home`,
      chart: {
        type: 'bar',
        title: 'Drinks by type',
        categories: ['Beer', 'Wine', 'Spirits', 'Bubbly'],
        series: [{ name: 'Drinks', values: [beerDrinks, wineDrinks, spiritDrinks, bubblyDrinks] }],
        format: { format: 'number' },
      },
      steps: [
        `Per guest = ${FIRST_HOUR} + ${hours - 1} later hour(s) × ${LATER_HOURS} = ${r1(perGuest)} drinks`,
        `All guests = ${guests} × ${r1(perGuest)} = ${r1(base)}; plus ${BUFFER * 100}% buffer = ${r1(total)} drinks`,
        `Wine = ${r1(wineDrinks)} glasses / ${GLASSES_PER_BOTTLE} per bottle = ${Math.round(wineDrinks / GLASSES_PER_BOTTLE * 100) / 100} bottles, so buy ${wineBottles}`,
        `Midnight toast = ${guests} flutes / ${FLUTES_PER_BOTTLE} per bottle, so buy ${toastBottles}`,
      ],
      note: 'Never drink and drive. Arrange a ride, a designated driver or a place to stay before the party starts.',
    };
  },
  content: {
    formula: [
      'Drinks per guest = 2 + (hours − 1) × 1',
      'Total drinks = guests × drinks per guest × 1.15',
      'Wine bottles = total × wine share ÷ 5 glasses (150 ml) per 750 ml bottle',
    ],
    body: [
      'Enter how many guests will drink, how long the party lasts and how you expect the drinks to split between beer, wine, spirits and bubbly. The calculator gives total drinks and how many bottles or cans to buy, plus extra bottles for the midnight toast.',
      'The per-hour rule is a party-planning rule of thumb: 2 drinks per guest in the first hour, then 1 per hour, plus a 15% buffer. We could not verify it against a published standard, so treat it as a starting point and adjust for your crowd. Similar calculators use comparable figures, but rates vary with the guests and the occasion.',
      'A US standard drink contains 14 grams of pure alcohol, which is about 12 fl oz of regular beer, 5 fl oz of wine or 1.5 fl oz of 80-proof spirits (NIAAA). A 750 ml bottle of wine is 5 glasses of 150 ml, which is slightly more than a 5 fl oz standard pour. Pours in a real glass are often bigger, so a generous host may want an extra bottle.',
      'Never drink and drive. Arrange a ride, a designated driver or somewhere to stay before the party starts, and have water and non-alcoholic drinks available.',
    ],
    faq: [
      { q: 'How many drinks per person for a 5-hour party?', a: 'With this rule of thumb, 2 drinks in the first hour plus 1 for each of the 4 later hours is 6 drinks per guest. For 20 drinking guests that is 120 drinks, or 138 with the 15% buffer.' },
      { q: 'How many bottles of wine do I need?', a: 'A 750 ml bottle gives 5 glasses of 150 ml. If 40% of 138 drinks is wine, that is 55.2 glasses, or 11.04 bottles, so buy 12.' },
      { q: 'How much champagne do I need for a midnight toast?', a: 'Plan about 6 flutes per 750 ml bottle. For 20 guests that is 3.33 bottles, so buy 4. This is in addition to any bubbly in your drink mix.' },
      { q: 'What is a standard drink?', a: 'In the US a standard drink holds 14 grams of pure alcohol: about 12 fl oz of regular beer, 5 fl oz of wine or 1.5 fl oz of 80-proof spirits (NIAAA).' },
      { q: 'Is the drinks-per-hour rule exact?', a: 'No. It is a rule of thumb, not a verified standard. Hot rooms, long dinners and enthusiastic guests all change it, which is why the calculator adds a 15% buffer.' },
    ],
    sources: [
      { label: 'NIAAA: What is a standard drink? (US standard drink = 14 grams of pure alcohol)', url: 'https://www.niaaa.nih.gov/alcohols-effects-health/what-standard-drink' },
      { label: 'Omni Calculator: Party Drink Calculator (comparable rule of thumb, not verified by us)', url: 'https://www.omnicalculator.com/food/party-drink' },
    ],
  },
  related: ['party-food-quantity', 'recipe-scaler', 'cooking-converter'],
  examples: [
    // 20 x (2 + 4x1 = 6) = 120; x1.15 = 138. Beer 30% = 41.4 -> 42; wine 40% = 55.2 / 5 = 11.04 -> 12;
    // spirits 20% = 27.6 / 17 = 1.62 -> 2; bubbly 10% = 13.8 / 5 = 2.76 -> 3; toast 20 / 6 = 3.33 -> 4.
    { values: { guests: 20, hours: 5, beer: 30, wine: 40, spirits: 20, bubbly: 10, nondrinkers: 0 }, expect: { totalDrinks: 138, beerCans: 42, wineBottles: 12, spiritBottles: 2, bubblyBottles: 3, toastBottles: 4, juiceBottles: 0 } },
    // 10 x (2 + 2x1 = 4) = 40; x1.15 = 46; all wine: 46 / 5 = 9.2 -> 10; toast 10 / 6 = 1.67 -> 2; 7 non-drinkers / 6 -> 2.
    { values: { guests: 10, hours: 3, beer: 0, wine: 100, spirits: 0, bubbly: 0, nondrinkers: 7 }, expect: { totalDrinks: 46, wineBottles: 10, beerCans: 0, toastBottles: 2, juiceBottles: 2 } },
    // 12 x 2 = 24; x1.15 = 27.6; 50% beer = 13.8 -> 14; 50% spirits = 13.8 / 17 = 0.81 -> 1.
    { values: { guests: 12, hours: 1, beer: 50, wine: 0, spirits: 50, bubbly: 0, nondrinkers: 0 }, expect: { totalDrinks: 27.6, beerCans: 14, spiritBottles: 1 } },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'heating-degree-days',
  title: 'Heating Degree Days Calculator',
  category: 'everyday',
  description: 'Work out heating degree days (HDD) from average daily high and low temperatures, a base temperature and a number of days, and compare with last year.',
  keywords: ['heating degree days calculator', 'HDD calculator', 'degree day calculator', 'how to calculate heating degree days', 'base 65 degree days'],
  inputs: [
    {
      id: 'unit', label: 'Units', type: 'select', default: 'us', segmented: true,
      options: [{ value: 'us', label: '°F' }, { value: 'si', label: '°C' }],
      info: 'Pick Fahrenheit or Celsius for every temperature on this page. Degree days come out in the same unit.',
    },
    { id: 'high', label: 'Average daily high', type: 'number', default: 40, step: 1, info: 'Typical daytime high over the period, in the units chosen above.' },
    { id: 'low', label: 'Average daily low', type: 'number', default: 20, step: 1, info: 'Typical overnight low over the period, in the units chosen above.' },
    { id: 'days', label: 'Days in the period', type: 'number', default: 31, min: 1, max: 366, step: 1, info: 'How many days to total, for example 31 for a January.' },
    { id: 'base', label: 'Base temperature', type: 'number', optional: true, step: 1, placeholder: '65 °F / 18 °C', info: 'Outdoor mean below which heating is assumed to be needed. Leave blank for the standard: 65 °F (18.3 °C, often rounded to 18 °C).' },
    { id: 'last', label: 'Last year\'s HDD for the same period', type: 'number', optional: true, min: 0, step: 1, placeholder: 'Optional', info: 'Optional. Enter last year\'s total to see how much colder or milder this period is, in the same units.' },
  ],
  outputs: [
    { id: 'total', label: 'Total heating degree days', precision: 0, primary: true, info: 'Daily HDD multiplied by the number of days.' },
    { id: 'daily', label: 'HDD per day', precision: 1, info: 'Base temperature minus the mean of the high and low, never below zero.' },
    { id: 'mean', label: 'Mean daily temperature', precision: 1, suffix: '°', info: '(High + low) ÷ 2.' },
    { id: 'vs', label: 'Change vs last year', format: 'percent', precision: 1, info: 'This period\'s total divided by last year\'s, minus 1.' },
  ],
  compute: (v) => {
    const si = v.unit === 'si';
    const hi = num(v.high);
    const lo = num(v.low);
    const days = num(v.days);
    if (hi === null || lo === null || days === null) return { total: null };
    if (days < 1 || days > 366) return { total: null, error: 'Enter between 1 and 366 days.' };
    if (lo > hi) return { total: null, error: 'The average low cannot be higher than the average high.' };
    const base = num(v.base) ?? (si ? 18 : 65);
    const last = num(v.last);
    const mean = (hi + lo) / 2;
    const daily = Math.max(0, base - mean);
    const total = daily * days;
    const u = si ? '°C' : '°F';
    const out: Record<string, unknown> = { total, daily, mean, vs: null };
    const steps = [
      `Mean = (${hi} + ${lo}) / 2 = ${mean} ${u}`,
      `Daily HDD = max(0, ${base} − ${mean}) = ${daily}`,
      `Total = ${daily} × ${days} days = ${Math.round(total * 10) / 10}`,
    ];
    let note: string | undefined;
    if (daily === 0) {
      note = 'The mean is at or above the base temperature, so no heating is assumed to be needed.';
    }
    if (last !== null && last > 0) {
      const vs = total / last - 1;
      out.vs = vs;
      steps.push(`vs last year = ${Math.round(total * 10) / 10} / ${last} − 1 = ${(vs * 100).toFixed(1)}%`);
      note = vs > 0.005 ? 'Colder than last year, so expect a bigger heating bill if your habits are unchanged.'
        : vs < -0.005 ? 'Milder than last year, so expect a smaller heating bill if your habits are unchanged.'
        : 'About the same as last year.';
    }
    const tone: 'good' | 'ok' | 'warn' | 'bad' = daily === 0 ? 'good' : daily < (si ? 10 : 18) ? 'ok' : 'warn';
    const badge = daily === 0 ? 'No heating' : daily < (si ? 10 : 18) ? 'Mild' : 'Cold';
    const chart = {
      type: 'bar' as const,
      title: 'Heating degree days per day',
      categories: [...(last !== null && last > 0 ? ['Last year (avg)'] : []), 'This period'],
      series: [{ name: 'HDD per day', values: [...(last !== null && last > 0 ? [last / days] : []), daily] }],
      format: { format: 'number' as const },
    };
    return { ...out, chart, steps, note, tone, badge } as never;
  },
  content: {
    formula: [
      'Mean temperature = (high + low) / 2',
      'Daily HDD = max(0, base − mean)',
      'Total HDD = daily HDD × days',
    ],
    body: [
      'Heating degree days (HDD) measure how cold a period was in terms of heating demand. Each day counts the number of degrees its average temperature falls below a base temperature, 65 °F in the United States. A day averaging 30 °F is 35 HDD; a day averaging 65 °F or warmer is zero.',
      'Because fuel use rises roughly in proportion to HDD, the total is a fair way to compare one winter or month with another. If this January is 16.7% higher than last January, your heating bill should be about that much higher for the same house and thermostat, all else equal.',
      'This calculator uses the simple method with the average of the daily high and low. Weather services total each day separately, so a month with a few very cold days and some warm ones can differ a little from a calculation made on monthly averages. The 65 °F base is a convention; a well-insulated home may need heat only below 55 to 60 °F, so you can change the base.',
    ],
    faq: [
      { q: 'How many heating degree days is a 31-day month averaging 40 °F high and 20 °F low?', a: 'The mean is 30 °F, so each day is 65 − 30 = 35 HDD and the month totals 35 × 31 = 1,085 HDD at the standard 65 °F base.' },
      { q: 'What if last year had 930 HDD?', a: 'Then 1,085 HDD is 16.7% higher (1,085 / 930 − 1), which means a colder period and more heating demand.' },
      { q: 'What happens when it is warm?', a: 'Degree days never go negative. A 60 °F high with a 50 °F low has a mean of 55 °F, giving 10 HDD a day. An 80 °F high with a 60 °F low has a mean of 70 °F, so 0 HDD.' },
      { q: 'Why is 65 °F the base?', a: 'It is the long-standing US convention used by NOAA and the EIA: buildings are assumed to need little or no heating when the outdoor mean is at or above 65 °F. In Celsius the equivalent base is 18.3 °C, often rounded to 18 °C, which this calculator uses when you choose °C and leave the base blank.' },
    ],
    sources: [
      { label: 'NOAA Climate Prediction Center, Degree Days Statistics (65 °F base)', url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/cdus/degree_days/' },
      { label: 'U.S. Energy Information Administration, Degree days explained', url: 'https://www.eia.gov/energyexplained/units-and-calculators/degree-days.php' },
    ],
  },
  related: ['heating-cost', 'thermostat-setback'],
  examples: [
    // mean (40+20)/2 = 30; 65-30 = 35/day; 35*31 = 1085; 1085/930 - 1 = 0.166667
    { values: { unit: 'us', high: 40, low: 20, days: 31, last: 930 }, expect: { total: 1085, daily: 35, mean: 30, vs: 0.166667 } },
    // mean 55; 65-55 = 10/day; x30 = 300
    { values: { unit: 'us', high: 60, low: 50, days: 30 }, expect: { daily: 10, total: 300 } },
    // mean 70 >= 65 -> 0
    { values: { unit: 'us', high: 80, low: 60, days: 30 }, expect: { daily: 0, total: 0 } },
    // C: mean 0; base 18 -> 18/day; x10 = 180
    { values: { unit: 'si', high: 5, low: -5, days: 10 }, expect: { daily: 18, total: 180 } },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const m2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'thermostat-setback',
  title: 'Thermostat Setback Savings Calculator',
  category: 'everyday',
  description: 'Estimate how much you save on heating by turning the thermostat down at night or while away. Enter the setback, hours a day and your annual heating bill.',
  keywords: ['thermostat setback calculator', 'lower thermostat savings', 'how much does turning down the thermostat save', 'heating savings calculator', 'thermostat 8 hours savings', 'winter heating bill savings'],
  updated: '2026-11-21',
  inputs: [
    { id: 'bill', label: 'Annual heating bill', type: 'number', prefix: '$', default: 1200, min: 0, step: 50, info: 'What you spend on heating in a year. Use your own total for the heating fuel or electricity.' },
    {
      id: 'unit', label: 'Temperature unit', type: 'select', default: 'f',
      options: [{ value: 'f', label: 'Fahrenheit (°F)' }, { value: 'c', label: 'Celsius (°C)' }],
      info: 'The unit used for the setback below.',
    },
    { id: 'setback', label: 'Setback (degrees lower)', type: 'number', default: 8, min: 0, max: 30, step: 0.5, info: 'How many degrees lower you set the thermostat than normal.' },
    { id: 'hours', label: 'Hours a day at the lower setting', type: 'number', default: 8, min: 0, max: 24, step: 0.5, suffix: 'h', info: 'For example, overnight or while you are at work.' },
  ],
  outputs: [
    { id: 'savings', label: 'Estimated yearly savings', format: 'currency', primary: true, info: 'Annual heating bill × savings percentage.' },
    { id: 'pct', label: 'Share of your heating bill', format: 'percent', precision: 1, info: '1% per degree F for 8 hours, scaled by hours, capped at 10%.' },
    { id: 'newBill', label: 'Heating bill after setback', format: 'currency', info: 'Bill minus the estimated savings.' },
  ],
  compute: (v) => {
    const bill = num(v.bill), setback = num(v.setback), hours = num(v.hours);
    const unit = v.unit === 'c' ? 'c' : 'f';
    if (bill === null || setback === null || hours === null) return { savings: null, note: 'Enter your heating bill, the setback and the hours.' };
    if (bill < 0 || setback < 0 || hours < 0 || hours > 24) return { savings: null, error: 'Use a bill of 0 or more, a setback of 0 or more and 0 to 24 hours.' };
    const degF = unit === 'c' ? setback * 1.8 : setback;
    const raw = (degF * hours) / 8; // percent
    const capped = raw > 10;
    const pctNum = Math.min(raw, 10);
    const savings = (bill * pctNum) / 100;
    const newBill = bill - savings;
    return {
      savings,
      pct: pctNum / 100,
      newBill,
      tone: 'ok',
      badge: capped ? 'Capped at 10%' : `${n1(pctNum)}% saved`,
      chart: {
        type: 'bar',
        title: 'Yearly heating bill',
        categories: ['Before', 'After setback'],
        series: [{ name: 'Bill', values: [bill, newBill] }],
        format: { format: 'currency' },
      },
      steps: [
        ...(unit === 'c' ? [`Setback in °F = ${n1(setback)} °C × 1.8 = ${n1(degF)} °F`] : []),
        `Savings % = ${n1(degF)} °F × ${n1(hours)} h ÷ 8 = ${n1(raw)}%${capped ? ', capped at 10%' : ''}`,
        `Savings = $${m2(bill)} × ${n1(pctNum)}% = $${m2(savings)}`,
        `New bill = $${m2(bill)} − $${m2(savings)} = $${m2(newBill)}`,
      ],
    };
  },
  content: {
    formula: ['Setback in °F = setback in °C × 1.8 (if you use Celsius)', 'Savings % = setback °F × hours at setback ÷ 8, capped at 10%', 'Savings = annual heating bill × savings %'],
    body: [
      'Turning the heat down while you sleep or are out is one of the cheapest ways to cut a winter bill. The U.S. Department of Energy says that turning your thermostat back 7 to 10 °F for 8 hours a day can save as much as 10% a year on heating, or roughly 1% for every degree.',
      'This calculator applies that rule of thumb. It scales the saving with the hours you keep the lower setting and stops at the 10% ceiling. It is an estimate, not a measurement: real savings depend on your home, your climate and your heating system.',
      'If you have a heat pump, check before you set a big setback. Heat pumps can switch to costly backup heat to recover, so they need a thermostat designed for them.',
    ],
    faq: [
      { q: 'How much does an 8 degree setback save on a $1,200 bill?', a: 'An 8 °F setback for 8 hours is 8%, so it saves $96 a year on a $1,200 bill. A 12 °F setback is capped at 10%, which is $120.' },
      { q: 'How do I enter a setback in Celsius?', a: 'Choose Celsius and enter the degrees. The calculator converts them at 1.8 °F per °C, so 4 °C is 7.2 °F and saves 7.2% over 8 hours.' },
      { q: 'What if I keep it lower for more or fewer hours?', a: 'The saving scales with hours. A 7 °F setback for 9 hours gives 7 × 9 ÷ 8 = 7.875%, or $94.50 on a $1,200 bill.' },
      { q: 'Does this work for a heat pump?', a: 'Not reliably. Large setbacks can trigger expensive backup heat, so use a thermostat made for heat pumps and treat the result as an upper bound.' },
    ],
    sources: [
      { label: 'U.S. Department of Energy: Thermostats', url: 'https://www.energy.gov/energysaver/thermostats' },
    ],
  },
  related: ['heating-cost', 'electricity-cost', 'gas-cost', 'firewood-cord'],
  examples: [
    { values: { bill: 1200, unit: 'f', setback: 8, hours: 8 }, expect: { savings: 96, pct: 0.08, newBill: 1104 } },
    { values: { bill: 1200, unit: 'f', setback: 12, hours: 8 }, expect: { savings: 120, pct: 0.1, newBill: 1080 } },
    { values: { bill: 1200, unit: 'f', setback: 7, hours: 9 }, expect: { savings: 94.5, pct: 0.07875, newBill: 1105.5 } },
    { values: { bill: 1200, unit: 'c', setback: 4, hours: 8 }, expect: { savings: 86.4, pct: 0.072, newBill: 1113.6 } },
  ],
});

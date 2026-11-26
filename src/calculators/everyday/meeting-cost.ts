import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'meeting-cost',
  title: 'Meeting Cost Calculator',
  category: 'everyday',
  description: 'See what a meeting costs in people time: attendees, average hourly rate and length, per meeting, per minute and per year if it repeats.',
  keywords: ['meeting cost calculator', 'how much does a meeting cost', 'cost of a meeting', 'meeting cost per minute', 'recurring meeting cost', 'cost of weekly meeting'],
  updated: '2026-11-26',
  inputs: [
    { id: 'people', label: 'Attendees', type: 'number', default: 8, min: 1, step: 1, info: 'Everyone in the meeting, including you.' },
    { id: 'rate', label: 'Average hourly rate', type: 'number', prefix: '$', suffix: '/h', default: 60, min: 0, step: 1, info: 'Your own estimate of the average cost of one person-hour. 60 is only an example; use a figure that suits your team.' },
    { id: 'minutes', label: 'Meeting length', type: 'number', suffix: 'min', default: 60, min: 0, step: 5, info: 'How long the meeting lasts, in minutes.' },
    { id: 'times', label: 'Times per year', type: 'number', default: 50, min: 1, step: 1, info: 'How often it happens in a year. A weekly meeting is about 50; daily is about 250 working days.' },
  ],
  outputs: [
    { id: 'perMeeting', label: 'Cost per meeting', format: 'currency', primary: true, info: 'Attendees × hourly rate × hours.' },
    { id: 'perYear', label: 'Cost per year', format: 'currency', info: 'Cost per meeting × times per year.' },
    { id: 'perMinute', label: 'Cost per minute', format: 'currency', info: 'Attendees × hourly rate ÷ 60.' },
    { id: 'hoursYear', label: 'Person-hours per year', format: 'number', precision: 1, suffix: ' h', info: 'Attendees × hours × times per year.' },
  ],
  compute: (v) => {
    const people = num(v.people), rate = num(v.rate), minutes = num(v.minutes), times = num(v.times);
    if ([people, rate, minutes, times].some((x) => x === null)) return { perMeeting: null };
    if ([people, rate, minutes, times].some((x) => (x as number) < 0)) return { perMeeting: null, error: 'Values cannot be negative.' };
    const perMinute = ((people as number) * (rate as number)) / 60;
    const perMeeting = perMinute * (minutes as number);
    const perYear = perMeeting * (times as number);
    const hoursYear = ((people as number) * (minutes as number) * (times as number)) / 60;
    return {
      perMeeting, perYear, perMinute, hoursYear,
      tone: 'ok',
      badge: `${usd(perMinute)} every minute`,
      chart: {
        type: 'bar',
        title: 'What the meeting costs',
        categories: ['Per minute', 'Per meeting', 'Per year'],
        series: [{ name: 'Cost', values: [perMinute, perMeeting, perYear] }],
        format: { format: 'currency' },
      },
      steps: [
        `Per minute: ${people} people × ${usd(rate as number)} ÷ 60 = ${usd(perMinute)}`,
        `Per meeting: ${usd(perMinute)} × ${minutes} min = ${usd(perMeeting)}`,
        `Per year: ${usd(perMeeting)} × ${times} = ${usd(perYear)}`,
      ],
      note: 'Arithmetic on your own estimate of an average hourly rate. It does not measure whether a meeting is worth it.',
    };
  },
  content: {
    formula: [
      'Cost per minute = attendees × hourly rate ÷ 60',
      'Cost per meeting = cost per minute × meeting length (minutes)',
      'Cost per year = cost per meeting × times per year',
    ],
    body: [
      'Every meeting uses up people time, and that time has a cost even when nobody sees an invoice. This calculator multiplies attendees, an average hourly rate and the length of the meeting to show what it costs, and what a recurring one adds up to over a year.',
      'The hourly rate is your own estimate. It could be an average salary converted to an hourly figure or a rough internal rate. The default of $60 is only an example.',
      'A high number does not mean a meeting is a waste, and a low one does not make it useful. It is simple arithmetic to help you decide whether the people and time involved fit the purpose.',
    ],
    faq: [
      { q: 'What does the example meeting cost?', a: '8 people at $60 an hour for 60 minutes costs $480 per meeting, or $8.00 per minute. Held weekly, 50 times a year, that is $24,000 a year.' },
      { q: 'How many meetings are there in a year?', a: 'A weekly meeting is about 50 a year after holidays, a daily one about 250 working days. Enter whatever matches your schedule.' },
      { q: 'What hourly rate should I use?', a: 'Use your own estimate of an average cost per person-hour. The calculator does not know your team, so the default is only an example.' },
      { q: 'Does it include prep time or lost focus?', a: 'No. It counts only the time in the meeting. Add prep or follow-up minutes to the length if you want to include them.' },
    ],
    sources: [],
  },
  related: ['real-hourly-wage', 'salary-to-hourly'],
  examples: [
    // per minute 8*60/60 = 8; per meeting 8*60 = 480; year 480*50 = 24000; hours 8*1*50 = 400
    { values: { people: 8, rate: 60, minutes: 60, times: 50 }, expect: { perMeeting: 480, perYear: 24000, perMinute: 8, hoursYear: 400 }, tolerance: 0.001 },
    // 3 people, $40/h, 30 min, 10 times: per min 2; meeting 60; year 600; hours 3*0.5*10 = 15
    { values: { people: 3, rate: 40, minutes: 30, times: 10 }, expect: { perMeeting: 60, perYear: 600, perMinute: 2, hoursYear: 15 }, tolerance: 0.001 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtClock, parseClock } from '../../lib/helpers/health';

const CYCLE = 90; // minutes
const WAKE = { input: 'mode', is: 'wake' };
const BED = { input: 'mode', is: 'bed' };

export default defineCalculator({
  slug: 'sleep',
  title: 'Sleep Calculator',
  category: 'health',
  description: 'Find the best time to go to bed or wake up so you finish complete 90-minute sleep cycles.',
  keywords: ['bedtime calculator', 'when should I go to bed', 'wake up time', 'sleep cycles', 'REM cycle'],
  inputs: [
    {
      id: 'mode',
      label: 'I want to',
      type: 'select',
      default: 'wake',
      segmented: true,
      options: [
        { value: 'wake', label: 'Wake up at…' },
        { value: 'bed', label: 'Go to bed at…' },
      ],
      info: 'Choose “Wake up at” to get bedtimes, or “Go to bed at” to get alarm times.',
    },
    { id: 'time', label: 'Time', type: 'text', default: '06:30', placeholder: 'HH:MM, e.g. 06:30 or 10:45 pm', help: '24-hour "HH:MM", or add am/pm.', info: 'Your alarm time or planned bedtime. Use 24-hour time like 22:45, or 12-hour time with am/pm.' },
    { id: 'latency', label: 'Time to fall asleep', type: 'number', suffix: 'min', default: 15, min: 0, max: 120, info: 'How long it usually takes you to drift off after getting into bed. 10–20 minutes is typical.' },
  ],
  outputs: [
    { id: 'bedtime', label: 'Go to bed at (5 cycles, 7.5 h sleep)', primary: true, format: 'text', showWhen: WAKE, info: 'Bedtime that gives five full 90-minute cycles before your alarm, after allowing time to fall asleep.' },
    { id: 'wakeTime', label: 'Wake up at (5 cycles, 7.5 h sleep)', primary: true, format: 'text', showWhen: BED, info: 'Alarm time that lands at the end of your fifth 90-minute cycle, when sleep is lightest.' },
    { id: 'six', label: '6 cycles (9 h sleep)', format: 'text', info: 'Option with six full cycles — the upper end of the 7–9 hours most adults need.' },
    { id: 'four', label: '4 cycles (6 h sleep)', format: 'text', info: 'Option with four cycles. Fine occasionally, but too little sleep for most adults night after night.' },
    { id: 'three', label: '3 cycles (4.5 h sleep)', format: 'text', info: 'Emergency option with three cycles. Expect to feel short on sleep.' },
  ],
  compute: (v) => {
    const t = parseClock(v.time);
    const lat = num(v.latency) ?? 0;
    const wakeMode = v.mode !== 'bed';
    const primaryId = wakeMode ? 'bedtime' : 'wakeTime';
    if (t === null) return { [primaryId]: null, error: 'Enter a time like 06:30, 22:45 or 10:45 pm.' };
    if (lat < 0) return { [primaryId]: null };
    const at = (cycles: number) => fmtClock(wakeMode ? t - cycles * CYCLE - lat : t + lat + cycles * CYCLE);
    const verb = wakeMode ? 'Go to bed at' : 'Set your alarm for';
    const options = [6, 5, 4, 3];
    return {
      [primaryId]: at(5),
      six: at(6),
      four: at(4),
      three: at(3),
      chart: {
        type: 'bar',
        title: wakeMode ? 'Bedtime options and hours of sleep' : 'Wake-up options and hours of sleep',
        categories: options.map((c) => `${at(c)} (${c} cycles)`),
        series: [{ name: 'Sleep', values: options.map((c) => (c * CYCLE) / 60) }],
        format: { suffix: 'h' },
        highlight: 1,
      },
      steps: [
        wakeMode
          ? `${fmtClock(t)} − 5 × 90 min of sleep − ${lat} min to fall asleep = ${at(5)}`
          : `${fmtClock(t)} + ${lat} min to fall asleep + 5 × 90 min of sleep = ${at(5)}`,
      ],
      note: `${verb} ${at(5)} or ${at(6)} for a full night. Most adults need 7–9 hours.`,
    };
  },
  content: {
    formula: ['Bedtime = wake time − (cycles × 90 min) − time to fall asleep', 'Wake time = bedtime + time to fall asleep + (cycles × 90 min)'],
    body: [
      'During the night you move through repeating cycles of light sleep, deep sleep and REM (dreaming) sleep. Each cycle lasts roughly 90 minutes on average, though it can range from about 70 to 120 minutes. Waking at the end of a cycle, when sleep is lightest, tends to feel easier than being pulled out of deep sleep.',
      'This calculator counts back (or forward) in 90-minute steps and adds the time it typically takes you to drift off. Five or six cycles — 7.5 to 9 hours — fits the 7-plus hours that sleep experts recommend for adults. Three or four cycles are shown for nights when you are short on time, but regularly sleeping that little adds up to sleep debt.',
      'Treat the times as a guide rather than a precise prediction: cycle length varies between people and through the night. A consistent schedule, even on weekends, does more for how rested you feel than timing alone. Ongoing trouble sleeping is worth discussing with a doctor; this is not medical advice.',
    ],
    faq: [
      { q: 'How long does it take a normal person to fall asleep?', a: 'Typically 10–20 minutes. Falling asleep in under 5 minutes every night can be a sign that you are not getting enough sleep.' },
      { q: 'What time format can I enter?', a: 'Use 24-hour time like 06:30 or 22:45, or 12-hour time with am/pm such as 6:30 am or 10:45 pm.' },
    ],
  },
  related: ['water-intake', 'tdee', 'bmi', 'calories-burned'],
  examples: [
    { values: { mode: 'wake', time: '07:00', latency: 15 }, expect: { bedtime: '11:15 PM', six: '9:45 PM', four: '12:45 AM', three: '2:15 AM' } },
    { values: { mode: 'bed', time: '10:30 pm', latency: 15 }, expect: { wakeTime: '6:15 AM', six: '7:45 AM' } },
  ],
});

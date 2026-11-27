import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

/** "12 min 42 sec", rounded to the nearest second. */
function duration(minutes: number): string {
  const total = Math.round(minutes * 60);
  if (total === 0) return '0 sec';
  const m = Math.floor(total / 60);
  const s = total % 60;
  return [m ? `${m} min` : '', s ? `${s} sec` : ''].filter(Boolean).join(' ');
}

export default defineCalculator({
  slug: 'speech-length',
  title: 'Speech Length Calculator',
  category: 'text',
  description: 'Estimate how long a speech or talk will run from its word count and speaking pace, or find how many words fit a time slot.',
  metaDescription: 'Work out how long your speech takes from word count and speaking pace, with a pause allowance, or how many words you need to fill a set number of minutes.',
  keywords: ['speech length', 'speech time calculator', 'words per minute speaking', 'how long is my speech', 'presentation length', 'words for a 5 minute speech'],
  inputs: [
    { id: 'words', label: 'Word count', type: 'number', default: 1500, min: 0, step: 1, suffix: 'words', info: 'The number of words in your script. Paste it into the Word Counter if you are not sure.' },
    { id: 'pace', label: 'Speaking pace', type: 'number', default: 130, min: 1, max: 400, suffix: 'words/min', info: 'How many words you say per minute. Most talks land between 110 and 160. Time yourself reading a paragraph aloud for a personal figure.', help: 'Typical talks run 110–160.' },
    { id: 'pause', label: 'Pause allowance', type: 'number', default: 0, min: 0, max: 200, suffix: '%', info: 'Extra time added for pauses, slides, jokes and audience reactions, as a percentage of the plain speaking time. 10% adds one minute to a 10-minute read.' },
    { id: 'target', label: 'Target length (optional)', type: 'number', optional: true, min: 0, step: 0.5, suffix: 'minutes', info: 'Leave blank to skip. Enter the time slot you have to see how many words fit in it.' },
  ],
  outputs: [
    { id: 'time', label: 'Speech length', format: 'text', primary: true, info: 'Word count divided by pace, plus your pause allowance, rounded to the nearest second.' },
    { id: 'minutes', label: 'Minutes', format: 'number', precision: 2, suffix: 'min', info: 'The same length in decimal minutes.' },
    { id: 'wordsForTarget', label: 'Words for target length', format: 'integer', info: 'Target minutes times pace, divided by one plus the pause allowance, rounded to the nearest word. Shown when you enter a target.' },
    { id: 'diff', label: 'Versus target', format: 'text', info: 'How far your script is over or under the target length, shown when you enter a target.' },
  ],
  compute: (v) => {
    const words = num(v.words);
    const pace = num(v.pace) ?? 130;
    const pause = num(v.pause) ?? 0;
    const target = num(v.target);
    if (pace <= 0) return { time: null, error: 'Speaking pace must be greater than zero.' };
    if (pause < 0) return { time: null, error: 'Pause allowance cannot be negative.' };
    if (words === null || words < 0) return { time: null, error: 'Enter a word count of zero or more.' };
    const factor = 1 + pause / 100;
    const minutes = (words / pace) * factor;
    const out: Record<string, unknown> = { time: duration(minutes), minutes };
    let tone: 'good' | 'ok' | 'warn' | undefined;
    let badge = 'Estimate';
    if (target !== null && target > 0) {
      out.wordsForTarget = Math.round((target * pace) / factor);
      const d = minutes - target;
      if (Math.abs(d) * 60 < 15) {
        out.diff = 'On target';
        tone = 'good';
        badge = 'On target';
      } else {
        out.diff = `${duration(Math.abs(d))} ${d > 0 ? 'over' : 'under'}`;
        tone = d > 0 ? 'warn' : 'ok';
        badge = d > 0 ? 'Too long' : 'Room to spare';
      }
    }
    const paces = [100, 120, 130, 150, 170];
    return {
      ...(out as Record<string, number | string>),
      tone,
      badge,
      chart: {
        type: 'bar' as const,
        title: 'Length at different speaking paces',
        categories: paces.map((p) => `${p} wpm`),
        series: [{ name: 'Minutes', values: paces.map((p) => (words / p) * factor) }],
        format: { format: 'number' as const, suffix: ' min' },
      },
    };
  },
  content: {
    formula: ['Minutes = words ÷ pace × (1 + pause ÷ 100)', 'Words for a target = target minutes × pace ÷ (1 + pause ÷ 100)'],
    body: [
      'Enter your word count and how fast you speak. The calculator divides words by pace to get plain speaking time, then adds your pause allowance on top. Leave the allowance at zero for a straight read-through, or add 5–15% for breaths, emphasis and audience reactions.',
      'Pace depends on the speaker and the room. A fast, familiar topic with a friendly crowd can reach 160 words per minute, while a technical talk, a large room with an echo or a non-native audience calls for 100–120. Time yourself reading a paragraph aloud for the most accurate figure.',
      'To write to a time slot, fill in the target length. You get the number of words that fit, using the same pace and pause allowance. Everything is calculated in your browser.',
    ],
    faq: [
      { q: 'How long is a 1,500-word speech?', a: 'At 130 words per minute with a 10% pause allowance it runs 12.69 minutes, or about 12 min 42 sec. At 130 wpm with no pauses it is 11.54 minutes.' },
      { q: 'How many words do I need for a 5-minute talk?', a: 'At 130 words per minute with no pauses, 5 minutes is 650 words. With a 10% pause allowance the same slot holds about 591 words.' },
      { q: 'What speaking pace should I use?', a: 'Use 130 if you are unsure. Most presentations fall between 110 and 160 words per minute, and the right figure depends on the speaker, the topic and the room.' },
      { q: 'How slow does 110 words per minute make a speech?', a: 'A 1,500-word script takes 13.64 minutes at 110 wpm with no pauses, compared with 11.54 minutes at 130 wpm.' },
    ],
  },
  related: ['word-counter', 'reading-goal'],
  examples: [
    // 1500 / 130 = 11.5385; x 1.10 = 12.6923 min = 761.54 s -> 12 min 42 sec
    { values: { words: 1500, pace: 130, pause: 10 }, expect: { minutes: 12.69, time: '12 min 42 sec' }, tolerance: 0.01 },
    // 1500 / 110 = 13.6364 min
    { values: { words: 1500, pace: 110, pause: 0 }, expect: { minutes: 13.64 }, tolerance: 0.01 },
    // 5 x 130 / 1 = 650
    { values: { words: 1500, pace: 130, pause: 0, target: 5 }, expect: { wordsForTarget: 650 } },
    // 5 x 130 / 1.1 = 590.9 -> 591
    { values: { words: 1500, pace: 130, pause: 10, target: 5 }, expect: { wordsForTarget: 591 } },
  ],
});

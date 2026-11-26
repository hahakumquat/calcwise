import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'hockey-goalie-stats',
  title: 'Hockey Goalie Stats (Save %, GAA)',
  category: 'sports',
  description: 'Work out a hockey goalie\'s save percentage (SV%), goals-against average (GAA), saves and shots faced per 60 minutes from shots, goals and minutes played.',
  metaDescription: 'Calculate hockey save percentage, goals-against average (GAA) and shots against per 60 from shots faced, goals allowed and minutes. Free goalie calculator.',
  updated: '2026-11-26',
  keywords: ['save percentage calculator', 'goals against average calculator', 'hockey goalie stats', 'GAA calculator', 'SV% calculator', 'shots against per 60'],
  inputs: [
    { id: 'shots', label: 'Shots against', type: 'number', default: 27, min: 0, step: 1, info: 'All shots on goal the goalie faced, including the ones that went in.' },
    { id: 'goals', label: 'Goals against', type: 'number', default: 2, min: 0, step: 1, info: 'Goals allowed. Empty-net goals are usually left out of goalie stats.' },
    { id: 'minutes', label: 'Minutes played', type: 'number', default: 60, min: 0, step: 1, info: 'Time on ice for the goalie. A regulation game is 60 minutes.' },
  ],
  outputs: [
    { id: 'sv', label: 'Save percentage (SV%)', format: 'number', precision: 3, primary: true, info: 'Saves divided by shots against, shown as a decimal such as .926.' },
    { id: 'gaa', label: 'Goals-against average (GAA)', format: 'number', precision: 2, info: 'Goals against per 60 minutes: goals × 60 ÷ minutes.' },
    { id: 'saves', label: 'Saves', format: 'integer', info: 'Shots against minus goals against.' },
    { id: 'sp60', label: 'Shots against per 60', format: 'number', precision: 2, info: 'Shots faced per 60 minutes: shots × 60 ÷ minutes.' },
  ],
  compute: (v) => {
    const shots = num(v.shots);
    const goals = num(v.goals);
    const minutes = num(v.minutes);
    if (shots === null || goals === null || minutes === null) return { sv: null };
    if (shots < 0 || goals < 0 || minutes < 0) return { sv: null, error: 'Values cannot be negative.' };
    if (goals > shots) return { sv: null, error: 'Goals against cannot be more than shots against.' };
    if (shots <= 0) return { sv: null, error: 'Enter at least one shot against.' };
    if (minutes <= 0) return { sv: null, error: 'Minutes played must be more than zero.' };
    const saves = shots - goals;
    const sv = saves / shots;
    const gaa = (goals * 60) / minutes;
    const sp60 = (shots * 60) / minutes;
    return {
      sv, gaa, saves, sp60,
      chart: {
        type: 'bar', title: 'Per 60 minutes', categories: ['Shots against', 'Saves', 'Goals against'],
        series: [{ name: 'Per 60', values: [Math.round(sp60 * 100) / 100, Math.round((saves * 60 / minutes) * 100) / 100, Math.round(gaa * 100) / 100] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Saves = ${shots} − ${goals} = ${saves}`,
        `SV% = ${saves} ÷ ${shots} = ${sv.toFixed(3)}`,
        `GAA = ${goals} × 60 ÷ ${minutes} = ${gaa.toFixed(2)}`,
        `Shots per 60 = ${shots} × 60 ÷ ${minutes} = ${sp60.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Saves = shots against − goals against',
      'SV% = saves ÷ shots against',
      'GAA = goals against × 60 ÷ minutes played',
      'Shots per 60 = shots against × 60 ÷ minutes played',
    ],
    body: [
      'Save percentage (SV%) is the share of shots on goal a goalie stops. It is written as a three-digit decimal, so 25 saves on 27 shots is .926. Goals-against average (GAA) is how many goals a goalie allows per 60 minutes, which scales results from games of different lengths to a common full-game rate.',
      'For example, 27 shots with 2 goals against in 60 minutes gives 25 saves, SV% of .926 and a GAA of 2.00. In a longer game, 34 shots and 3 goals over 125 minutes gives 31 saves, SV% of .912 (31 ÷ 34 = 0.9118) and GAA of 1.44 (3 × 60 ÷ 125).',
      'SV% and GAA tell different stories. GAA depends on how many shots the team in front of the goalie allows, while SV% only looks at the shots faced. That is why many analysts prefer SV% for judging a goalie and use shots against per 60 to see how busy they were.',
      'This calculator uses simple totals you enter, so it works for a single game, a tournament or a whole season. Use total minutes for the period you are measuring.',
    ],
    faq: [
      { q: 'How do you calculate save percentage in hockey?', a: 'Subtract goals against from shots against to get saves, then divide saves by shots against. With 27 shots and 2 goals, that is 25 ÷ 27 = .926.' },
      { q: 'How do you calculate goals-against average?', a: 'Multiply goals against by 60 and divide by minutes played. Allowing 3 goals in 125 minutes is 3 × 60 ÷ 125 = 1.44.' },
      { q: 'What is a good save percentage?', a: 'In the NHL, a save percentage around .910 is typically near league average and .920 or higher is considered very good. Youth and amateur levels vary widely, so compare with your own league.' },
      { q: 'Why is SV% often preferred over GAA?', a: 'GAA depends on how many shots the defence allows, while SV% measures only how many of the shots faced were stopped.' },
      { q: 'Do empty-net goals count?', a: 'Official NHL goalie stats generally leave empty-net goals out of goals against. Enter the shots and goals the goalie actually faced.' },
    ],
    sources: [
      { label: 'NHL Stats glossary: save percentage and goals-against average', url: 'https://www.nhl.com/stats/glossary' },
    ],
  },
  related: ['shooting-efficiency', 'baseball-stats', 'pythagorean-win-expectation'],
  examples: [
    // 27 shots, 2 goals, 60 min: saves 25; SV 25/27; GAA 120/60 = 2; sp60 27
    { values: { shots: 27, goals: 2, minutes: 60 }, expect: { saves: 25, sv: 25 / 27, gaa: 2, sp60: 27 }, tolerance: 1e-9 },
    // 34 shots, 3 goals, 125 min: saves 31; SV 31/34; GAA 180/125 = 1.44; sp60 2040/125 = 16.32
    { values: { shots: 34, goals: 3, minutes: 125 }, expect: { saves: 31, sv: 31 / 34, gaa: 1.44, sp60: 16.32 }, tolerance: 1e-9 },
    // shutout: 20 shots, 0 goals, 60 min: SV 1, GAA 0
    { values: { shots: 20, goals: 0, minutes: 60 }, expect: { saves: 20, sv: 1, gaa: 0, sp60: 20 }, tolerance: 1e-9 },
  ],
});

import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'college-application-budget',
  title: 'College Application Budget: Fees and Waivers',
  category: 'other',
  description: 'Add up application fees, fee waivers, test score reports, transcripts and other costs to see the total cost of applying to college and the cost per school.',
  keywords: ['college application cost', 'college application fee calculator', 'application fee waiver budget', 'cost to apply to colleges', 'score report fees'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'schools', label: 'Schools you apply to', type: 'number', default: 8, min: 1, step: 1, info: 'How many applications you plan to send.' },
    { id: 'fee', label: 'Average application fee', type: 'number', prefix: '$', default: 60, min: 0, step: 1, info: 'The typical fee across your list. Check each school.' },
    { id: 'waivers', label: 'Fee waivers you expect', type: 'number', default: 2, min: 0, step: 1, info: 'Applications with no fee. Each school sets its own waiver rules.' },
    { id: 'reports', label: 'Score reports sent', type: 'number', default: 6, min: 0, step: 1, info: 'How many official test score reports you will send.' },
    { id: 'reportFee', label: 'Fee per score report', type: 'number', prefix: '$', default: 13, min: 0, step: 0.5, info: 'What the testing agency charges per report.' },
    { id: 'transcript', label: 'Transcript fee per school', type: 'number', prefix: '$', default: 5, min: 0, step: 0.5, info: 'What your school charges to send a transcript.' },
    { id: 'other', label: 'Other costs', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'Anything else, such as postage or a portfolio fee.' },
  ],
  outputs: [
    { id: 'total', label: 'Total cost of applying', format: 'currency', precision: 2, primary: true, info: 'Fees + score reports + transcripts + other costs.' },
    { id: 'perSchool', label: 'Cost per school', format: 'currency', precision: 2, info: 'Total ÷ schools.' },
    { id: 'fees', label: 'Application fees', format: 'currency', precision: 2, info: '(Schools − waivers) × fee.' },
    { id: 'scores', label: 'Score reports', format: 'currency', precision: 2, info: 'Reports × fee per report.' },
    { id: 'transcripts', label: 'Transcripts', format: 'currency', precision: 2, info: 'Schools × transcript fee.' },
  ],
  compute: (v) => {
    const n = num(v.schools);
    const fee = num(v.fee);
    const w = num(v.waivers);
    const r = num(v.reports);
    const rf = num(v.reportFee);
    const t = num(v.transcript);
    const o = num(v.other);
    if (n === null || fee === null || w === null || r === null || rf === null || t === null || o === null) return { total: null };
    if (n < 1 || fee < 0 || w < 0 || r < 0 || rf < 0 || t < 0 || o < 0) return { total: null };
    const paid = Math.max(0, n - w);
    const fees = paid * fee;
    const scores = r * rf;
    const transcripts = n * t;
    const total = fees + scores + transcripts + o;
    const perSchool = total / n;
    return {
      total,
      perSchool,
      fees,
      scores,
      transcripts,
      tone: 'ok',
      badge: `${money(perSchool)} per school`,
      note: `${paid} paid applications cost ${money(fees)}. With score reports, transcripts and other costs the total is ${money(total)}.`,
      chart: {
        type: 'bar' as const,
        title: 'Where the money goes',
        categories: ['Fees', 'Score reports', 'Transcripts', 'Other'],
        series: [{ name: 'Cost', values: [fees, scores, transcripts, o] }],
        format: CURRENCY,
        highlight: 0,
      },
      steps: [
        `Fees = (${n} − ${w}) × ${money(fee)} = ${money(fees)}`,
        `Score reports = ${r} × ${money(rf)} = ${money(scores)}`,
        `Transcripts = ${n} × ${money(t)} = ${money(transcripts)}`,
        `Total = ${money(fees)} + ${money(scores)} + ${money(transcripts)} + ${money(o)} = ${money(total)}`,
      ],
    };
  },
  content: {
    formula: [
      'Fees = (schools − waivers) × average fee',
      'Score reports = reports sent × fee per report',
      'Transcripts = schools × transcript fee',
      'Total = fees + score reports + transcripts + other costs; per school = total ÷ schools',
    ],
    body: [
      'Applying to college costs more than the headline application fee. Official score reports and transcripts are charged per school, and they add up across a long list.',
      'Example: 8 schools at $60 with 2 waived is $360. Six score reports at $13 are $78 and 8 transcripts at $5 are $40, so the total is $478.00, or $59.75 a school. Another: 5 schools at $75, no waivers, 5 reports at $12 and free transcripts come to $375 + $60 = $435.00, or $87.00 each.',
      'Every fee is your own input, and waiver eligibility is set by each school, so check their sites. No school fee is built in. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does it cost to apply to 8 colleges?', a: 'With a $60 average fee, 2 waivers, 6 score reports at $13 and $5 transcripts, it is $478.00 in this calculator. Your numbers will differ.' },
      { q: 'Does every school charge the same fee?', a: 'No. Enter an average for your list or run the calculator for different groups of schools.' },
      { q: 'Who qualifies for a fee waiver?', a: 'Each school and testing agency sets its own rules. Enter the number of waivers you expect, not the number you hope for.' },
      { q: 'Are waivers applied to score reports?', a: 'No. Waivers here only remove application fees. Enter a lower report count or a lower fee if you expect free reports.' },
    ],
    sources: [],
  },
  related: ['college-net-price', 'textbook-cost', 'semester-refund-budget'],
  examples: [
    // fees 6*60=360; scores 78; transcripts 40; total 478; per 59.75
    { values: { schools: 8, fee: 60, waivers: 2, reports: 6, reportFee: 13, transcript: 5, other: 0 }, expect: { total: 478, perSchool: 59.75, fees: 360, scores: 78, transcripts: 40 } },
    // fees 375; scores 60; transcripts 0; total 435; per 87
    { values: { schools: 5, fee: 75, waivers: 0, reports: 5, reportFee: 12, transcript: 0, other: 0 }, expect: { total: 435, perSchool: 87, fees: 375, scores: 60, transcripts: 0 } },
  ],
});

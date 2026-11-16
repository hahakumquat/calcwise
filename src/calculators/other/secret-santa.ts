import { defineCalculator } from '../../lib/types';
import { on, str } from '../../lib/helpers/text';

/** Uniform integer in [0, n) using crypto when available (same approach as random-number). */
function randInt(n: number): number {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.getRandomValues) {
    const lim = Math.floor(2 ** 32 / n) * n;
    const buf = new Uint32Array(1);
    do c.getRandomValues(buf);
    while (buf[0] >= lim);
    return buf[0] % n;
  }
  return Math.floor(Math.random() * n);
}

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

/**
 * Random assignment (giver i -> receiver out[i]) with no self-draws and no forbidden pairs, or null if none exists.
 * First tries random backtracking (uniform over valid draws when it finishes quickly); if that runs out of budget,
 * falls back to a randomised bipartite matching, which always finds a draw when one exists.
 */
function drawSantas(n: number, banned: Set<number>): number[] | null {
  const ok = (g: number, r: number) => g !== r && !banned.has(g * n + r);
  const out = new Array<number>(n).fill(-1);
  const taken = new Array<boolean>(n).fill(false);
  let budget = 20000;
  const order = shuffle([...Array(n).keys()]);
  const rec = (k: number): boolean => {
    if (k === n) return true;
    if (--budget < 0) return false;
    const g = order[k];
    for (const r of shuffle([...Array(n).keys()])) {
      if (taken[r] || !ok(g, r)) continue;
      taken[r] = true;
      out[g] = r;
      if (rec(k + 1)) return true;
      taken[r] = false;
      out[g] = -1;
    }
    return false;
  };
  if (rec(0)) return out;
  // Fallback: Kuhn's augmenting-path matching with random orders.
  const owner = new Array<number>(n).fill(-1); // receiver -> giver
  const prefs = shuffle([...Array(n).keys()]);
  const try1 = (g: number, seen: boolean[]): boolean => {
    for (const r of prefs) {
      if (seen[r] || !ok(g, r)) continue;
      seen[r] = true;
      if (owner[r] < 0 || try1(owner[r], seen)) {
        owner[r] = g;
        return true;
      }
    }
    return false;
  };
  for (const g of order) if (!try1(g, new Array<boolean>(n).fill(false))) return null;
  const res = new Array<number>(n).fill(-1);
  owner.forEach((g, r) => (res[g] = r));
  return res;
}

export default defineCalculator({
  slug: 'secret-santa',
  title: 'Secret Santa Generator',
  category: 'other',
  description: 'Draw Secret Santa pairings for 2 to 30 people. Nobody draws themselves, and you can block pairs such as partners. Runs in your browser.',
  keywords: ['secret santa', 'gift exchange', 'white elephant', 'kris kringle', 'name draw', 'secret santa generator', 'christmas gift draw'],
  random: true,
  layout: 'wide',
  inputs: [
    { id: 'names', label: 'Names', type: 'textarea', rows: 7, default: 'Ann\nBob\nCara\nDev\nEli', placeholder: 'One name per line, or separated by commas', info: 'Everyone taking part, one per line or separated by commas. Between 2 and 30 different names.' },
    { id: 'exclusions', label: 'Cannot draw (optional)', type: 'textarea', rows: 3, default: '', placeholder: 'Ann > Bob', info: 'One rule per line, written “Giver > Receiver”. Ann > Bob stops Ann drawing Bob, but Bob can still draw Ann. Add both lines to block both ways.' },
  ],
  outputs: [
    { id: 'result', label: 'Who gives to whom', format: 'code', primary: true, info: 'One line per person: the giver, an arrow, then the person they buy for. Everyone gives once and receives once.' },
    { id: 'n', label: 'People', format: 'integer', info: 'How many names were drawn.' },
    { id: 'rules', label: 'Blocked pairs', format: 'integer', info: 'How many “cannot draw” rules were applied.' },
  ],
  compute: (v) => {
    const raw = str(v.names)
      .split(/[\n,;]+/)
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
    if (raw.length === 0) return { result: null };
    const key = (s: string) => s.toLowerCase();
    const seen = new Set<string>();
    for (const nm of raw) {
      if (seen.has(key(nm))) return { result: null, error: `“${nm}” appears twice. Give each person a different name, for example “${nm} B.”.` };
      seen.add(key(nm));
    }
    const n = raw.length;
    if (n < 2) return { result: null, error: 'Add at least 2 names. Nobody can draw themselves, so one person has nobody to give to.' };
    if (n > 30) return { result: null, error: `That is ${n} names. This tool handles up to 30.` };
    const idx = new Map(raw.map((nm, i) => [key(nm), i]));
    const banned = new Set<number>();
    for (const line of str(v.exclusions).split('\n')) {
      const t = line.trim();
      if (!t) continue;
      const parts = t.split(/\s*(?:->|→|>)\s*/);
      if (parts.length !== 2 || !parts[0] || !parts[1]) return { result: null, error: `Could not read the rule “${t}”. Write it as “Giver > Receiver”.` };
      const a = idx.get(key(parts[0].replace(/\s+/g, ' ')));
      const b = idx.get(key(parts[1].replace(/\s+/g, ' ')));
      if (a === undefined || b === undefined) return { result: null, error: `The rule “${t}” uses a name that is not in the list above.` };
      if (a !== b) banned.add(a * n + b);
    }
    const draw = drawSantas(n, banned);
    if (!draw) return { result: null, error: 'No valid draw exists with these rules. Remove a “cannot draw” line and try again.' };
    const allowed = raw.map((_, g) => raw.filter((__, r) => r !== g && !banned.has(g * n + r)).length);
    return {
      result: raw.map((nm, g) => `${nm} → ${raw[draw[g]]}`).join('\n'),
      n,
      rules: banned.size,
      tone: 'good',
      badge: 'Draw complete',
      note: 'Show each person only their own line.',
      chart: {
        type: 'bar',
        title: 'Possible recipients per person',
        categories: raw,
        series: [{ name: 'Choices', values: allowed }],
        format: { format: 'integer' },
      },
    };
  },
  content: {
    body: [
      'Type in everyone’s name, add any pairs that should not match (partners, last year’s match), and press Regenerate until you are happy. The tool gives every person exactly one recipient and makes sure nobody draws their own name. The draw is built from your browser’s secure random generator.',
      'Everything happens on this page. Names and rules are not saved, sent or shared, and they are gone when you close the tab. That also means the draw cannot be recovered later, so copy the result before you leave.',
    ],
    sections: [
      {
        heading: 'How the draw works',
        paragraphs: [
          'The tool searches for an assignment where each person gives to one person and receives from one person, skipping the self-draws and the pairs you blocked. It tries random choices first and, if the rules make that slow, switches to a method that is guaranteed to find a draw whenever one exists.',
          'A rule is one-directional. “Ann > Bob” stops Ann drawing Bob only. To keep two people apart in both directions, add “Bob > Ann” as well.',
        ],
      },
      {
        heading: 'Keeping the draw secret',
        paragraphs: [
          'The list on screen shows everyone’s match, including the organiser’s. If you want to be surprised too, ask someone else to run the draw, or run it and send each person only their own line without reading the rest. Better still, take the draw on a screen only the giver sees.',
        ],
      },
    ],
    faq: [
      { q: 'Can I run this if I am taking part?', a: 'Yes, but you will see every pairing. To stay surprised, ask a friend to press the button and message each person only their own line, or have each person run it alone and look only at their own result. Draw on a screen only the giver sees.' },
      { q: 'Why does a group of 3 only have two possible draws?', a: 'With 3 people and no self-draws, the only valid draws are the two circles A to B to C to A and A to C to B to A. With 2 people the draw is always A to B and B to A. Blocking pairs can leave only one valid draw, or none.' },
      { q: 'What does “No valid draw exists” mean?', a: 'Your rules leave at least one person with nobody to give to, or make it impossible for everyone to receive a gift. Remove or loosen a “cannot draw” line. Each person needs at least one allowed recipient.' },
      { q: 'Are names stored or sent anywhere?', a: 'No. The draw runs in your browser and nothing is saved or uploaded.' },
      { q: 'How many people can I add?', a: 'From 2 to 30 different names. Names are compared ignoring capital letters, so two people called “sam” and “Sam” need different names.' },
    ],
  },
  related: ['gift-budget', 'random-number', 'bill-splitter'],
  examples: [
    // 2 people: the only derangement is A->B, B->A.
    { values: { names: 'A, B', exclusions: '' }, expect: { result: 'A → B\nB → A', n: 2, rules: 0 } },
    // 3 people, A cannot draw B: of the two 3-cycles only A->C->B->A remains (A->C, C->B, B->A).
    { values: { names: 'A\nB\nC', exclusions: 'A > B' }, expect: { result: 'A → C\nB → A\nC → B', rules: 1 } },
    // 1 name is not enough.
    { values: { names: 'Solo', exclusions: '' }, expect: { error: 'Add at least 2 names. Nobody can draw themselves, so one person has nobody to give to.' } },
    // A cannot draw B or C, and cannot draw self: no valid draw.
    { values: { names: 'A, B, C', exclusions: 'A > B\nA > C' }, expect: { error: 'No valid draw exists with these rules. Remove a “cannot draw” line and try again.' } },
  ],
});

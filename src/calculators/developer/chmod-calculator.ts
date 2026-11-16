import { defineCalculator } from '../../lib/types';

const CLASSES = [
  { key: 'u', label: 'Owner (user)' },
  { key: 'g', label: 'Group' },
  { key: 'o', label: 'Everyone else (other)' },
] as const;
const BITS = [
  { key: 'r', label: 'read', n: 4, info: 'Read: view a file’s contents, or list a directory.' },
  { key: 'w', label: 'write', n: 2, info: 'Write: change a file, or add and remove files in a directory.' },
  { key: 'x', label: 'execute', n: 1, info: 'Execute: run a file as a program, or enter (cd into) a directory.' },
] as const;

const inputs = CLASSES.flatMap((c) =>
  BITS.map((b) => ({
    id: c.key + b.key,
    label: `${c.label}: ${b.label}`,
    type: 'toggle' as const,
    default: !(b.key === 'w' && c.key !== 'u'),
    info: b.info,
  })),
);

/** Test helper: a full set of toggle values from an ls-style string like 'rwxr-xr-x'. */
function mode(sym: string, ...special: string[]): Record<string, string> {
  const out: Record<string, string> = { setuid: 'off', setgid: 'off', sticky: 'off' };
  CLASSES.forEach((c, ci) => BITS.forEach((b, bi) => { out[c.key + b.key] = sym[ci * 3 + bi] === b.key ? 'on' : 'off'; }));
  for (const sp of special) out[sp] = 'on';
  return out;
}

export default defineCalculator({
  slug: 'chmod-calculator',
  title: 'Chmod Permission Calculator',
  category: 'developer',
  description: 'Tick read, write and execute boxes to get the Unix chmod number (like 755) and symbolic form (rwxr-xr-x), with setuid, setgid and sticky.',
  keywords: ['chmod calculator', 'chmod 755', 'chmod 644', 'unix permissions', 'linux file permissions', 'octal permissions', 'rwx'],
  layout: 'wide',
  inputs: [
    ...inputs,
    { id: 'setuid', label: 'Setuid', type: 'toggle', default: false, info: 'Setuid: the program runs with its owner’s privileges instead of the user who launched it. Use with great care.' },
    { id: 'setgid', label: 'Setgid', type: 'toggle', default: false, info: 'Setgid: a program runs with its group’s privileges; on a directory, new files inherit the directory’s group.' },
    { id: 'sticky', label: 'Sticky bit', type: 'toggle', default: false, info: 'Sticky: in a shared directory such as /tmp, only a file’s owner can delete or rename it.' },
  ],
  outputs: [
    { id: 'octal', label: 'Octal (chmod number)', format: 'code', primary: true, info: 'The number to pass to chmod. Each digit is owner, group, other; read = 4, write = 2, execute = 1, added together.' },
    { id: 'symbolic', label: 'Symbolic (ls -l style)', format: 'code', info: 'The nine-character string you see in ls -l, after the file-type letter. s, S, t and T show special bits.' },
    { id: 'command', label: 'Command', format: 'code', info: 'Replace “file” with your file or directory name.' },
    { id: 'plain', label: 'In plain English', format: 'text', info: 'What each class is allowed to do.' },
  ],
  compute: (v) => {
    const on = (id: string) => v[id] === 'on';
    const digit = (k: string) => BITS.reduce((s, b) => s + (on(k + b.key) ? b.n : 0), 0);
    const special = (on('setuid') ? 4 : 0) + (on('setgid') ? 2 : 0) + (on('sticky') ? 1 : 0);
    const [u, g, o] = CLASSES.map((c) => digit(c.key));
    const octal = (special ? String(special) : '') + `${u}${g}${o}`;
    const sym = (k: string, sp: boolean, ch: string) => {
      const r = on(k + 'r') ? 'r' : '-';
      const w = on(k + 'w') ? 'w' : '-';
      let x = on(k + 'x') ? 'x' : '-';
      if (sp) x = x === 'x' ? ch : ch.toUpperCase();
      return r + w + x;
    };
    const symbolic = sym('u', on('setuid'), 's') + sym('g', on('setgid'), 's') + sym('o', on('sticky'), 't');
    const words = (k: string) => {
      const a = BITS.filter((b) => on(k + b.key)).map((b) => b.label);
      return a.length ? a.join(', ') : 'nothing';
    };
    return {
      octal,
      symbolic,
      command: `chmod ${octal} file`,
      plain: `Owner: ${words('u')}. Group: ${words('g')}. Everyone else: ${words('o')}.`,
    };
  },
  content: {
    formula: ['digit = 4 × read + 2 × write + 1 × execute (one digit each for owner, group, other)', 'special digit (leading) = 4 × setuid + 2 × setgid + 1 × sticky'],
    body: [
      'Every file on Linux and macOS has three sets of permissions: one for its owner, one for the owner’s group, and one for everyone else. Each set can allow read (r), write (w) and execute (x). chmod writes those nine switches as three octal digits, because read, write and execute are worth 4, 2 and 1, and every combination from 0 to 7 is a different sum.',
      'So 755 means the owner gets 7 (4 + 2 + 1, rwx) while group and others get 5 (4 + 1, r-x): they can read and run it but not change it. 644 (rw-r--r--) is the usual choice for ordinary files, and 600 (rw-------) keeps a file private, as SSH requires for private keys.',
      'A fourth, leading digit holds the special bits: setuid (4), setgid (2) and sticky (1). 1777 is the classic mode for /tmp. This tool runs in your browser and never touches your files; you still run the chmod command yourself.',
    ],
    faq: [
      { q: 'What does chmod 755 mean?', a: 'Owner can read, write and execute (7); group and others can read and execute (5). Symbolically that is rwxr-xr-x. It is the usual mode for scripts, programs and directories.' },
      { q: 'What does chmod 644 mean?', a: 'Owner can read and write (6); group and others can only read (4). Symbolically rw-r--r--, the usual mode for ordinary files.' },
      { q: 'Is chmod 777 safe?', a: 'Rarely. It lets every user on the system change or replace the file. Prefer the narrowest mode that works, such as 755 or 775.' },
      { q: 'What do the capital S and T mean?', a: 'A lowercase s or t means the special bit is set and the execute bit is set too. A capital S or T means the special bit is set but execute is not, which is usually a mistake.' },
    ],
    sources: [{ label: 'POSIX chmod specification (The Open Group)', url: 'https://pubs.opengroup.org/onlinepubs/9699919799/utilities/chmod.html' }],
  },
  related: ['number-base-converter', 'cron-explainer', 'hash-generator'],
  examples: [
    { values: mode('rwxr-xr-x'), expect: { octal: '755', symbolic: 'rwxr-xr-x', command: 'chmod 755 file' } },
    { values: mode('rw-r--r--'), expect: { octal: '644', symbolic: 'rw-r--r--' } },
    { values: mode('rw-------'), expect: { octal: '600', symbolic: 'rw-------' } },
    { values: mode('rwx------'), expect: { octal: '700', symbolic: 'rwx------' } },
    { values: mode('rwxrwxrwx', 'sticky'), expect: { octal: '1777', symbolic: 'rwxrwxrwt' } },
    { values: mode('rwxr-xr-x', 'setuid'), expect: { octal: '4755', symbolic: 'rwsr-xr-x' } },
    { values: mode('rwxr--r-x', 'setgid'), expect: { octal: '2745', symbolic: 'rwxr-Sr-x' } },
    { values: mode('---------'), expect: { octal: '000', symbolic: '---------', plain: 'Owner: nothing. Group: nothing. Everyone else: nothing.' } },
  ],
});

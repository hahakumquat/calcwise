/** Shared text helpers for text and developer tools. Pure, dependency-free, browser + Node. */
import type { ChartFormat, ChartSpec } from '../types';

export const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
export const on = (v: unknown): boolean => v === 'on' || v === true;

// ---------------------------------------------------------------- UTF-8
export function utf8Encode(s: string): Uint8Array {
  const out: number[] = [];
  for (const ch of s) {
    let c = ch.codePointAt(0)!;
    if (c >= 0xd800 && c <= 0xdfff) c = 0xfffd; // lone surrogate
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return Uint8Array.from(out);
}

/** Strict UTF-8 decoder; returns null on malformed input. */
export function utf8Decode(b: Uint8Array): string | null {
  let s = '';
  for (let i = 0; i < b.length; ) {
    const c = b[i];
    let cp: number;
    let n: number;
    if (c < 0x80) { cp = c; n = 0; }
    else if (c >= 0xc2 && c < 0xe0) { cp = c & 31; n = 1; }
    else if (c >= 0xe0 && c < 0xf0) { cp = c & 15; n = 2; }
    else if (c >= 0xf0 && c < 0xf5) { cp = c & 7; n = 3; }
    else return null;
    if (i + n >= b.length + (n ? 0 : 1)) return null;
    for (let k = 1; k <= n; k++) {
      const cc = b[i + k];
      if (cc === undefined || (cc & 0xc0) !== 0x80) return null;
      cp = (cp << 6) | (cc & 63);
    }
    if ((n === 2 && cp < 0x800) || (n === 3 && (cp < 0x10000 || cp > 0x10ffff)) || (cp >= 0xd800 && cp <= 0xdfff)) return null;
    s += String.fromCodePoint(cp);
    i += n + 1;
  }
  return s;
}

export const byteLength = (s: string) => utf8Encode(s).length;

// ---------------------------------------------------------------- Base64
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64Encode(bytes: Uint8Array, urlSafe = false): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? B64[n & 63] : '=';
  }
  if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return out;
}

/** Accepts standard or URL-safe Base64, with or without padding and whitespace. Returns null if invalid. */
export function base64Decode(s: string): Uint8Array | null {
  const clean = s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  if (!/^[A-Za-z0-9+/]*$/.test(clean) || clean.length % 4 === 1) return null;
  const out: number[] = [];
  let buf = 0;
  let bits = 0;
  for (const ch of clean) {
    buf = (buf << 6) | B64.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buf >> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

// ---------------------------------------------------------------- Words & case
/** Words = runs of letters/digits (apostrophes and hyphens inside words allowed). */
export function words(s: string): string[] {
  return s.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? [];
}

/** Splits identifiers and phrases into lowercase-agnostic parts: "parseHTTPResponse_v2" → parse, HTTP, Response, v2. */
export function splitIdentifier(s: string): string[] {
  return (
    s
      .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'via', 'vs']);

export function titleCase(s: string): string {
  let idx = 0;
  return s.toLowerCase().replace(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu, (w, offset: number, all: string) => {
    const first = idx++ === 0;
    const afterColon = /[:.!?]\s*$/.test(all.slice(0, offset));
    return !first && !afterColon && SMALL_WORDS.has(w) ? w : cap(w);
  });
}

export function sentenceCase(s: string): string {
  return s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, pre: string, c: string) => pre + c.toUpperCase()).replace(/\bi\b/g, 'I');
}

export function convertCase(s: string, mode: string): string {
  switch (mode) {
    case 'upper':
      return s.toUpperCase();
    case 'lower':
      return s.toLowerCase();
    case 'title':
      return titleCase(s);
    case 'sentence':
      return sentenceCase(s);
  }
  // Identifier cases operate line by line so a list of names converts in one go.
  return s
    .split('\n')
    .map((line) => {
      const parts = splitIdentifier(line);
      if (!parts.length) return line;
      switch (mode) {
        case 'camel':
          return parts.map((p, i) => (i ? cap(p) : p.toLowerCase())).join('');
        case 'pascal':
          return parts.map(cap).join('');
        case 'snake':
          return parts.map((p) => p.toLowerCase()).join('_');
        case 'kebab':
          return parts.map((p) => p.toLowerCase()).join('-');
        case 'constant':
          return parts.map((p) => p.toUpperCase()).join('_');
        default:
          return line;
      }
    })
    .join('\n');
}

export function slugify(s: string, sep = '-', lower = true): string {
  let t = s.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  t = t.replace(/ß/g, 'ss').replace(/æ/gi, 'ae').replace(/ø/gi, 'o').replace(/đ/gi, 'd').replace(/ł/gi, 'l').replace(/&/g, ' and ');
  if (lower) t = t.toLowerCase();
  return t
    .replace(/['’]/g, '')
    .replace(/[^A-Za-z0-9]+/g, sep)
    .replace(new RegExp(`^${escapeRegExp(sep)}+|${escapeRegExp(sep)}+$`, 'g'), '');
}

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const splitLines = (s: string) => s.replace(/\r\n?/g, '\n').split('\n');

// ---------------------------------------------------------------- Diff
export type DiffOp = { op: ' ' | '+' | '-'; line: string };

/** Line diff via longest common subsequence. O(n·m) — fine for pasted text. */
export function lineDiff(a: string[], b: string[]): DiffOp[] {
  // Trim common prefix/suffix to keep the table small.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const A = a.slice(start, endA);
  const B = b.slice(start, endB);
  const n = A.length;
  const m = B.length;
  const L: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const mid: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      mid.push({ op: ' ', line: A[i] });
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) mid.push({ op: '-', line: A[i++] });
    else mid.push({ op: '+', line: B[j++] });
  }
  while (i < n) mid.push({ op: '-', line: A[i++] });
  while (j < m) mid.push({ op: '+', line: B[j++] });
  return [
    ...a.slice(0, start).map((line) => ({ op: ' ' as const, line })),
    ...mid,
    ...a.slice(endA).map((line) => ({ op: ' ' as const, line })),
  ];
}

// ---------------------------------------------------------------- CSV
/** RFC 4180-style parser: quoted fields, escaped quotes (""), embedded delimiters and newlines. */
export function parseCsv(text: string, delim = ','): { rows: string[][]; error?: string } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let line = 1;
  let quoteLine = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else {
        if (c === '\n') line++;
        field += c;
      }
    } else if (c === '"' && field === '') {
      inQuotes = true;
      quoteLine = line;
    } else if (c === delim) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      line++;
    } else field += c;
  }
  if (inQuotes) return { rows, error: `Unclosed quoted field starting on line ${quoteLine}.` };
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return { rows: rows.filter((r) => !(r.length === 1 && r[0] === '')) };
}

export function csvField(v: string, delim = ','): string {
  return /[",\r\n]/.test(v) || v.includes(delim) || /^\s|\s$/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// ---------------------------------------------------------------- JSON
/**
 * Describes why `text` is not valid JSON as "Invalid JSON at line X, column Y: reason (near "…")".
 * Uses its own scanner so the wording and position are identical in every browser and in Node.
 */
export function jsonErrorLocation(text: string): string {
  const { pos, msg } = findJsonError(text) ?? { pos: 0, msg: 'invalid JSON' };
  const before = text.slice(0, pos);
  const line = before.split('\n').length;
  const col = pos - before.lastIndexOf('\n');
  const near = text.slice(pos, pos + 20).split('\n')[0];
  return `Invalid JSON at line ${line}, column ${col}: ${msg}${near ? ` (near "${near}")` : ''}`;
}

/** First syntax problem in `text` (offset + reason), or null if it is valid JSON. */
export function findJsonError(text: string): { pos: number; msg: string } | null {
  let i = 0;
  const ws = () => {
    while (i < text.length && ' \t\n\r'.includes(text[i])) i++;
  };
  const fail = (msg: string): never => {
    throw { pos: Math.min(i, text.length), msg };
  };
  const show = (c: string | undefined) => (c === undefined ? 'end of input' : `"${c}"`);
  const string = () => {
    i++;
    for (;;) {
      if (i >= text.length) fail('unterminated string');
      const c = text[i];
      if (c === '"') return void i++;
      if (c === '\\') {
        const e = text[i + 1];
        if (e === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) fail('invalid \\u escape');
          i += 6;
        } else if (e !== undefined && '"\\/bfnrt'.includes(e)) i += 2;
        else fail('invalid escape sequence');
      } else if (c < ' ') fail(c === '\n' ? 'line break inside a string' : 'control character inside a string');
      else i++;
    }
  };
  const value = (): void => {
    ws();
    const c = text[i];
    if (c === '{') {
      i++;
      ws();
      if (text[i] === '}') return void i++;
      for (;;) {
        ws();
        if (text[i] === '}') fail('trailing comma before "}"');
        if (text[i] !== '"') fail(text[i] === "'" ? 'keys must use double quotes' : `expected a "quoted" key but found ${show(text[i])}`);
        string();
        ws();
        if (text[i] !== ':') fail(`expected ":" after key but found ${show(text[i])}`);
        i++;
        value();
        ws();
        if (text[i] === ',') i++;
        else if (text[i] === '}') return void i++;
        else fail(`expected "," or "}" but found ${show(text[i])}`);
      }
    } else if (c === '[') {
      i++;
      ws();
      if (text[i] === ']') return void i++;
      for (;;) {
        ws();
        if (text[i] === ']') fail('trailing comma before "]"');
        value();
        ws();
        if (text[i] === ',') i++;
        else if (text[i] === ']') return void i++;
        else fail(`expected "," or "]" but found ${show(text[i])}`);
      }
    } else if (c === '"') string();
    else if (c === "'") fail('strings must use double quotes');
    else if (c !== undefined && /[-0-9]/.test(c)) {
      const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i));
      if (!m) fail('invalid number');
      i += m![0].length;
    } else {
      for (const lit of ['true', 'false', 'null']) if (text.startsWith(lit, i)) return void (i += lit.length);
      fail(c === undefined ? 'unexpected end of input' : `unexpected ${show(c)}`);
    }
  };
  try {
    value();
    ws();
    if (i < text.length) fail(`unexpected ${show(text[i])} after the end of the JSON value`);
    return null;
  } catch (e) {
    return e as { pos: number; msg: string };
  }
}

// ---------------------------------------------------------------- Randomness
/** Uniform random integer in [0, n) using crypto.getRandomValues when available, else Math.random. */
export function randomInt(n: number): number {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c?.getRandomValues) {
    const limit = Math.floor(0x100000000 / n) * n;
    const buf = new Uint32Array(1);
    for (;;) {
      c.getRandomValues(buf);
      if (buf[0] < limit) return buf[0] % n;
    }
  }
  return Math.floor(Math.random() * n);
}

export function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (c?.getRandomValues) c.getRandomValues(out);
  else for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
  return out;
}

export const plural = (n: number, w: string, p = w + 's') => `${n.toLocaleString('en-US')} ${n === 1 ? w : p}`;

// ---------------------------------------------------------------- Charts
/** Very common English words, skipped when ranking "top words". */
export const STOP_WORDS = new Set(
  ('a an and are as at be but by for from has have he her his i if in into is it its me my no not of on or our she so ' +
    'than that the their them then there these they this to too us was we were what when which who will with you your ' +
    "it's don't i'm can just do does did been being am also about would could should").split(' '),
);

/** Counts letters, digits, whitespace and everything else (punctuation, symbols, emoji). */
export function charMix(text: string): { label: string; value: number }[] {
  let letters = 0, digits = 0, spaces = 0, other = 0;
  for (const ch of text) {
    if (/\p{L}|\p{M}/u.test(ch)) letters++;
    else if (/\p{N}/u.test(ch)) digits++;
    else if (/\s/.test(ch)) spaces++;
    else other++;
  }
  return [
    { label: 'Letters', value: letters },
    { label: 'Digits', value: digits },
    { label: 'Spaces & line breaks', value: spaces },
    { label: 'Punctuation & symbols', value: other },
  ];
}

export function mixDonut(text: string, title = 'Character mix'): ChartSpec {
  const n = Array.from(text).length;
  return { type: 'donut', title, slices: charMix(text), format: { format: 'integer' }, centerLabel: 'characters', centerValue: n.toLocaleString('en-US') };
}

export function bar(
  title: string,
  categories: string[],
  values: number[],
  opts: { name?: string; horizontal?: boolean; format?: ChartFormat; highlight?: number } = {},
): ChartSpec {
  return {
    type: 'bar',
    title,
    categories,
    series: [{ name: opts.name ?? title, values }],
    format: opts.format ?? { format: 'integer' },
    horizontal: opts.horizontal,
    highlight: opts.highlight,
  };
}

/** Drops empty charts (no data) so the renderer never gets something it cannot draw. */
export function charts(...xs: (ChartSpec | null | undefined | false)[]): ChartSpec[] {
  return xs.filter((c): c is ChartSpec => {
    if (!c) return false;
    if (c.type === 'bar') return c.categories.length > 0 && c.series.some((s) => s.values.some((v) => v !== 0));
    if (c.type === 'donut') return c.slices.some((x) => x.value > 0);
    return true;
  });
}

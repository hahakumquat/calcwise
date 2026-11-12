import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { bar, charts, on, slugify, splitLines, str } from '../../lib/helpers/text';

const STOP_WORDS = new Set(['a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'or', 'is', 'are']);

export default defineCalculator({
  slug: 'slug-generator',
  title: 'URL Slug Generator',
  category: 'text',
  description: 'Turn a title or phrase into a clean, lowercase, hyphenated URL slug.',
  keywords: ['slugify', 'url slug', 'permalink', 'seo url', 'friendly url'],
  layout: 'wide',
  inputs: [
    { id: 'text', info: 'The page title or phrase to turn into a slug. Put several titles on separate lines to convert them all at once.', label: 'Title or text', type: 'textarea', rows: 3, default: '10 Tips & Tricks for Café-Quality Coffee at Home!', help: 'One slug per line.' },
    {
      id: 'sep', info: 'The character placed between words. Hyphens are standard for URLs; underscores suit file names and identifiers.',
      label: 'Separator',
      type: 'select',
      default: '-',
      segmented: true,
      options: [
        { value: '-', label: 'Hyphen -' },
        { value: '_', label: 'Underscore _' },
      ],
    },
    { id: 'lower', info: 'Convert to lowercase. URLs are case-sensitive on many servers, so lowercase slugs avoid duplicate pages.', label: 'Lowercase', type: 'toggle', default: true },
    { id: 'stopWords', info: 'Drop short filler words such as "a", "the" and "of" to make the slug shorter.', label: 'Remove short filler words (a, the, of…)', type: 'toggle', default: false },
    { id: 'maxLen', info: 'Optional upper limit on length. The slug is cut at the last whole word that fits.', label: 'Maximum length', type: 'number', optional: true, min: 1, placeholder: 'No limit', suffix: 'characters' },
  ],
  outputs: [
    { id: 'slug', info: 'The URL-safe slug: only plain letters, digits and the separator.', label: 'Slug', format: 'code', primary: true },
    { id: 'length', info: 'Number of characters in the (first) slug. Under about 60 is a good target.', label: 'Length', format: 'integer', suffix: 'characters' },
  ],
  compute: (v) => {
    const sep = str(v.sep) === '_' ? '_' : '-';
    const max = num(v.maxLen);
    const slugs = splitLines(str(v.text))
      .filter((l) => l.trim())
      .map((line) => {
        let s = slugify(line, sep, on(v.lower));
        if (on(v.stopWords)) {
          const parts = s.split(sep);
          const kept = parts.filter((p) => !STOP_WORDS.has(p.toLowerCase()));
          s = (kept.length ? kept : parts).join(sep);
        }
        if (max && max > 0 && s.length > max) {
          // Cut at a separator so words are not chopped in half.
          const cut = s.slice(0, max + 1);
          const at = cut.lastIndexOf(sep);
          s = (at > 0 ? cut.slice(0, at) : s.slice(0, max)).replace(new RegExp(`\\${sep}+$`), '');
        }
        return s;
      });
    const slug = slugs.join('\n');
    const firstLine = splitLines(str(v.text)).find((l) => l.trim()) ?? '';
    return {
      slug,
      length: slugs[0]?.length ?? 0,
      chart: charts(bar('Length before and after', ['Original title', 'Slug'], [Array.from(firstLine).length, slugs[0]?.length ?? 0], { name: 'Characters', horizontal: true, highlight: 1 })),
    };
  },
  content: {
    body: [
      'A slug is the readable part of a URL that identifies a page, like "best-hiking-boots" in example.com/blog/best-hiking-boots. Good slugs are short, lowercase, use hyphens between words and contain only plain letters and digits, so they never need percent-encoding.',
      'The generator strips accents (café becomes cafe), spells out ampersands as "and", drops apostrophes so "don\'t" becomes "dont" rather than "don-t", and collapses every other run of punctuation or spaces into a single separator. A maximum length trims at a word boundary instead of cutting a word in half.',
      'Search engines read hyphens as word separators but treat underscores as joining characters, which is why hyphens are the usual choice for URLs. Underscores are handy for file names and identifiers.',
    ],
    faq: [
      { q: 'Should I remove words like "the" and "of"?', a: 'Shorter slugs are easier to share and read, so dropping filler words is common. Keep them when removing them changes the meaning or makes the slug awkward.' },
      { q: 'Can I change a slug after a page is published?', a: 'You can, but add a permanent (301) redirect from the old URL so existing links and search rankings carry over.' },
      { q: 'What happens to non-Latin scripts?', a: 'Letters that cannot be reduced to plain A–Z (for example Chinese or Arabic) are removed. For those languages, consider writing the slug by hand or using a transliteration.' },
    ],
  },
  related: ['case-converter', 'url-encoder', 'character-counter'],
  examples: [
    { values: { text: '10 Tips & Tricks for Café-Quality Coffee at Home!', sep: '-', lower: 'on', stopWords: 'off', maxLen: null }, expect: { slug: '10-tips-and-tricks-for-cafe-quality-coffee-at-home', length: 50 } },
    { values: { text: "Don't Panic: The Guide", sep: '_', lower: 'on', stopWords: 'on', maxLen: null }, expect: { slug: 'dont_panic_guide' } },
    { values: { text: 'The quick brown fox jumps', sep: '-', lower: 'on', stopWords: 'off', maxLen: 12 }, expect: { slug: 'the-quick' } },
  ],
});

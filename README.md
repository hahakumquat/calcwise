# Calcwise

Fast, beautiful, private calculators and tools for finance, health, math, statistics, text and code, built as a static [Astro](https://astro.build) site.

- **Every page is static HTML** with results pre-computed at build time, so pages load instantly and search engines index the answers.
- **Results update as you type.** Inputs accept arithmetic (`500000*1.1`), units switch in place (lb ↔ kg converts your value), and the full state is kept in the URL so every result is shareable.
- **Private:** all calculation happens in the browser.
- **Polished UI:** light and dark themes, responsive down to 320px, keyboard search (`⌘K` or `/`), accessible controls.
- **SEO built in:** canonical URLs, sitemap, FAQ and breadcrumb structured data, per-page descriptions.
- **Ads off by default:** set `PUBLIC_ADSENSE_CLIENT` and `PUBLIC_AD_SLOT_*` at build time to enable AdSense placements.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # validates every calculator and runs its examples
npm run build      # static site in dist/
```

Requires Node 18.20+ or 20.3+.

## Adding a calculator

Each calculator is one file: `src/calculators/<category>/<slug>.ts`. The site picks it up automatically: page, category listing, search, sitemap and related links.

```ts
import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'tip',
  title: 'Tip Calculator',
  category: 'everyday',
  description: 'Work out the tip and split the bill.',
  inputs: [
    { id: 'bill', label: 'Bill', type: 'number', prefix: '$', default: 60 },
    { id: 'pct', label: 'Tip', type: 'number', suffix: '%', default: 18 },
  ],
  outputs: [{ id: 'tip', label: 'Tip', format: 'currency', primary: true }],
  compute: (v) => ({ tip: (num(v.bill) ?? 0) * (num(v.pct) ?? 0) / 100 }),
  examples: [{ values: { bill: 50, pct: 20 }, expect: { tip: 10 } }],
});
```

- Inputs: `number` (optionally unit-aware), `select`, `list`, `text`, `date`, `textarea`, `toggle`. See [`src/lib/types.ts`](src/lib/types.ts).
- Unit-aware numbers reach `compute()` in base units (m, kg, s, m², m³, …). See [`src/lib/units.ts`](src/lib/units.ts).
- Shared numeric helpers (normal/t/χ² distributions, quantiles, dates) are in [`src/lib/math.ts`](src/lib/math.ts).
- `npm test` checks schema rules (one primary output, valid units, defaults compute without throwing) and every `examples` entry.

## Deploy

Any static host works (Cloudflare Pages, Netlify, Vercel, GitHub Pages). Set `SITE_URL` to your domain at build time so canonical URLs and the sitemap are correct.

## Disclaimer

Results are estimates for educational purposes and are not financial, medical, legal or tax advice.

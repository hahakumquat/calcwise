# CappyCalc

Free online calculators with charts, live at https://cappycalc.com. Static Astro 5 site, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. Revenue comes from Google AdSense; growth comes from Google search and social media.

Tagline: "The answer, beautifully fast." Brand voice on the site: clear, calm, plain English. Brand voice on social: Gen-Z, self-deprecating, meme-literate ("at this rate i'll retire at 80, i'm cooked T_T").

## Commands

- `npm ci` — install
- `npm test` — checks every calculator's examples and schema (must print `0 problem(s)`)
- `npm run check` — TypeScript type check
- `npm run build` — static build into `dist/`
- `npm run smoke` — checks the built `dist/` for SEO and safety basics (run after build)
- `npm run verify` — everything above in one go, with the production AdSense id: the gate before any push to `main`
- `scripts/live-check.sh` — checks the live site; runs automatically as the deploy workflow's `verify` job
- `npm run dev` — dev server on http://localhost:4321

## Layout

- `src/calculators/<category>/<slug>.ts` — one calculator per file, `defineCalculator({...})`, auto-discovered. Inputs, outputs, `compute()`, charts, `content` (body, sections, FAQ, sources), `related`, `examples` (used by tests). Copy a neighbour when adding one.
- `src/lib/types.ts` — the calculator schema. `src/lib/categories.ts` + `src/lib/category-seo.ts` — categories and their SEO/guides.
- `src/lib/helpers/` — shared math (finance, fire, etc.). `src/lib/chart.ts` — SVG charts. `src/lib/paths.ts` — always build links with `path()` / `absUrl()`.
- `src/pages/` — homepage, `[category]/index.astro`, `[category]/[slug].astro`, sitemap, robots, privacy, 404.
- `src/layouts/Base.astro` — `<head>` (SEO, og:image, AdSense), header, footer.
- `src/components/CalculatorWidget.astro` + `src/scripts/calc-client.ts` — the live calculator UI, result "stage" card, charts, share image (`src/scripts/share-card.ts`).
- `public/` — favicon, `og.png`, `ads.txt`.
- `scripts/media/lib.mjs` — marketing media renderer (Playwright), run by GitHub Actions on the `marketing` branch. PNG assets only; the owner edits videos.

## Rules for every change

- `npm run verify` must pass before pushing to `main`.
- Never change: `public/ads.txt`, the AdSense publisher id, the `PUBLIC_*`/`SITE_URL`/`BASE_PATH` repo variables, the custom domain, `src/pages/privacy.astro` (except to keep it accurate), or the deploy workflow's trigger/permissions.
- Never add tracking, sign-ups, popups, or anything that collects user data. Calculators run in the browser only.
- No placement that encourages accidental ad clicks; no more than 3 ad slots per page; never label content "ads" misleadingly. (AdSense policy violations can ban the account.)
- Math must be correct and sourced. Every new calculator needs `examples` with hand-checked expected values and FAQ answers that match what the calculator actually computes.
- Keep titles ≤ 60 chars including " | CappyCalc", meta descriptions 70–160 chars, one `<h1>` per page.
- Mobile first: check 375px wide. Respect dark mode (use the CSS tokens in `src/styles/global.css`).
- Do not commit secrets. Do not commit large media to `main` (marketing media goes on the `marketing` branch).

## The team

Role agents live in `.claude/agents/`. The cycle process (runs every few hours) is in `.claude/team/PLAYBOOK.md`; shared state is in `.claude/team/` (backlog, decisions, log).

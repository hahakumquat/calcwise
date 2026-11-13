import { defineConfig } from 'astro/config';

// Deploy-time settings:
//   SITE_URL  — the site's origin, used for canonical URLs, JSON-LD and the sitemap.
//   BASE_PATH — sub-path the site is served from, e.g. "/calcwise" on GitHub Pages ("/" for a custom domain).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://calcwise.example',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
});

import { defineConfig } from 'astro/config';

// Set SITE_URL when deploying so canonical URLs and the sitemap are correct.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://calcwise.example',
});

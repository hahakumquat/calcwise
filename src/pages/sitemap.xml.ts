import type { APIRoute } from 'astro';
import { CALCULATORS, CATEGORIES_WITH_CALCS, calcUrl } from '../lib/registry';

export const GET: APIRoute = ({ site }) => {
  const urls = ['/', '/categories', ...CATEGORIES_WITH_CALCS.map((c) => `/${c.id}`), ...CALCULATORS.map(calcUrl)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, site).href}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};

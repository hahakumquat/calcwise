import type { APIRoute } from 'astro';
import { absUrl } from '../lib/paths';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\nSitemap: ${absUrl('/sitemap.xml', site)}\n`, { headers: { 'Content-Type': 'text/plain' } });

import type { NextConfig } from 'next';

/**
 * All content-negotiation is done here in rewrites, not inside the page /
 * route handler. Rewrites transform the incoming URL into a distinct
 * internal destination BEFORE Next.js (or the Vercel CDN) sees it, so each
 * canonical response maps to a unique URL and the CDN caches each one
 * independently.
 *
 * If content negotiation were done inside the page component based on the
 * `Accept` or `User-Agent` request headers, the CDN would cache the FIRST
 * response under the request URL and serve it to every subsequent caller
 * regardless of their headers (unless we also set `Vary`, which is easy
 * to forget and easy to get wrong). Keeping the negotiation in rewrites
 * avoids that class of bug entirely.
 *
 * Negotiation order (first match wins):
 *   1. Explicit `?format=raw|json|html` query string (wins over headers).
 *   2. `Accept: application/json` header.
 *   3. `User-Agent` matching `curl` or `wget`.
 *   4. Fallback: serve the HTML page.
 */
const nextConfig: NextConfig = {
	transpilePackages: ['shiki'],
	async rewrites() {
		return [
			// ----------------------------------------------------------------
			// Root path `/` → default repo (importpw/import).
			// ----------------------------------------------------------------
			{
				source: '/',
				has: [{ type: 'query', key: 'format', value: 'raw' }],
				destination: '/api/raw/importpw/import',
			},
			{
				source: '/',
				has: [{ type: 'query', key: '_format', value: 'raw' }],
				destination: '/api/raw/importpw/import',
			},
			{
				source: '/',
				has: [{ type: 'query', key: 'format', value: 'json' }],
				destination: '/api/data/importpw/import',
			},
			{
				source: '/',
				has: [{ type: 'query', key: '_format', value: 'json' }],
				destination: '/api/data/importpw/import',
			},
			{
				source: '/',
				has: [
					{
						type: 'header',
						key: 'accept',
						value: 'application/json',
					},
				],
				destination: '/api/data/importpw/import',
			},
			{
				source: '/',
				has: [
					{
						type: 'header',
						key: 'user-agent',
						value: '.*(curl|wget).*',
					},
				],
				destination: '/api/raw/importpw/import',
			},
			{
				source: '/',
				destination: '/importpw/import',
			},

			// ----------------------------------------------------------------
			// All non-api paths (exclude /api/* so we never rewrite an
			// auth / data / raw / exec / og route back into itself).
			// ----------------------------------------------------------------
			{
				source: '/:path((?!api/).+)',
				has: [{ type: 'query', key: 'format', value: 'raw' }],
				destination: '/api/raw/:path',
			},
			{
				source: '/:path((?!api/).+)',
				has: [{ type: 'query', key: '_format', value: 'raw' }],
				destination: '/api/raw/:path',
			},
			{
				source: '/:path((?!api/).+)',
				has: [{ type: 'query', key: 'format', value: 'json' }],
				destination: '/api/data/:path',
			},
			{
				source: '/:path((?!api/).+)',
				has: [{ type: 'query', key: '_format', value: 'json' }],
				destination: '/api/data/:path',
			},
			{
				source: '/:path((?!api/).+)',
				has: [
					{
						type: 'header',
						key: 'accept',
						value: 'application/json',
					},
				],
				destination: '/api/data/:path',
			},
			{
				source: '/:path((?!api/).+)',
				has: [
					{
						type: 'header',
						key: 'user-agent',
						value: '.*(curl|wget).*',
					},
				],
				destination: '/api/raw/:path',
			},
		];
	},
};

export default nextConfig;

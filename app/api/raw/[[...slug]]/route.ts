import { basename } from 'node:path';
import { loadFromPath } from '../../../../lib/load';

export const dynamic = 'force-dynamic';

interface RouteContext {
	params: Promise<{ slug?: string[] }>;
}

export async function GET(req: Request, ctx: RouteContext) {
	const { slug } = await ctx.params;
	const pathname = slug ? `/${slug.join('/')}` : '/';

	// For raw responses we don't need the readme body, just the resolved
	// `rawUrl` so we can proxy the file directly.
	const { rawUrl, data } = await loadFromPath(
		pathname,
		new Headers(req.headers),
		{ includeContent: false }
	);

	const res = await fetch(rawUrl, { cache: 'no-store' });
	if (res.status === 404) {
		// If we couldn't even resolve the repo or commit via the GitHub
		// API, that's a strong signal the repo is private (or gone). In
		// that case, redirect the client to the raw URL so `import` can
		// retry with its own credentials via `curl`.
		//
		// Conversely, if the repo/commit resolved fine but the raw file
		// is 404, that's a genuine missing file — pass the 404 through
		// so the caller sees the real error instead of being bounced
		// around.
		const likelyPrivate = !data.foundRepo || !data.foundCommit;
		if (likelyPrivate) {
			return new Response(null, {
				status: 307,
				headers: { Location: res.url },
			});
		}
		return new Response(`Not found: ${pathname}\n`, {
			status: 404,
			headers: { 'Content-Type': 'text/plain; charset=utf8' },
		});
	}

	const filename = basename(res.url);
	const headers = new Headers();
	headers.set('Content-Location', res.url);
	headers.set('Content-Disposition', `inline; filename="${filename}"`);
	const contentType = res.headers.get('content-type');
	if (contentType) headers.set('Content-Type', contentType);
	headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
	// Content-negotiation rewrites in next.config.ts route curl/wget
	// requests for `/foo` here, but the Vercel CDN's cache key is the
	// *original* request URL, not the rewritten destination. Vary on
	// User-Agent so a Mozilla request to `/foo` can't be served the raw
	// script that a previous curl request warmed the cache with.
	headers.set('Vary', 'User-Agent');

	return new Response(res.body, { status: res.status, headers });
}

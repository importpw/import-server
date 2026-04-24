import { basename } from 'node:path';
import { loadFromPath } from '../../../../lib/load';
import { SESSION_COOKIE } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

interface RouteContext {
	params: Promise<{ slug?: string[] }>;
}

/**
 * If the request's OAuth session token was rejected by GitHub during
 * resolution, this function sets a `Set-Cookie` header on the response
 * that clears the dead session cookie.
 */
function clearSessionCookie(req: Request, headers: Headers) {
	const secure = new URL(req.url).protocol === 'https:';
	headers.append(
		'Set-Cookie',
		`${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${
			secure ? '; Secure' : ''
		}`
	);
}

export async function GET(req: Request, ctx: RouteContext) {
	const { slug } = await ctx.params;
	const pathname = slug ? `/${slug.join('/')}` : '/';

	// For raw responses we don't need the readme body, just the resolved
	// `rawUrl` so we can proxy the file directly.
	const { rawUrl, data, sessionRevoked } = await loadFromPath(
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
			const h = new Headers({ Location: res.url });
			if (sessionRevoked) clearSessionCookie(req, h);
			return new Response(null, { status: 307, headers: h });
		}
		const h = new Headers({ 'Content-Type': 'text/plain; charset=utf8' });
		if (sessionRevoked) clearSessionCookie(req, h);
		return new Response(`Not found: ${pathname}\n`, {
			status: 404,
			headers: h,
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
	if (sessionRevoked) clearSessionCookie(req, headers);

	return new Response(res.body, { status: res.status, headers });
}

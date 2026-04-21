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
	const { rawUrl } = await loadFromPath(
		pathname,
		new Headers(req.headers),
		{ includeContent: false }
	);

	const res = await fetch(rawUrl, { cache: 'no-store' });
	if (res.status === 404) {
		// Could be a private repo: redirect the client to the raw URL so
		// that `import` can auth itself via `curl`.
		return new Response(null, {
			status: 307,
			headers: { Location: res.url },
		});
	}

	const filename = basename(res.url);
	const headers = new Headers();
	headers.set('Content-Location', res.url);
	headers.set('Content-Disposition', `inline; filename="${filename}"`);
	const contentType = res.headers.get('content-type');
	if (contentType) headers.set('Content-Type', contentType);
	headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');

	return new Response(res.body, { status: res.status, headers });
}

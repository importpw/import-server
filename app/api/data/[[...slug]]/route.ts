import { loadFromPath } from '../../../../lib/load';
import { SESSION_COOKIE } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

interface RouteContext {
	params: Promise<{ slug?: string[] }>;
}

export async function GET(req: Request, ctx: RouteContext) {
	const { slug } = await ctx.params;
	const pathname = slug ? `/${slug.join('/')}` : '/';
	const { data, sessionRevoked } = await loadFromPath(
		pathname,
		new Headers(req.headers)
	);

	const headers = new Headers({
		'Content-Type': 'application/json',
		'Cache-Control': 's-maxage=60, stale-while-revalidate',
	});
	// If the OAuth session token was rejected by GitHub, clear the
	// now-useless session cookie on this response. The request already
	// transparently fell back to the anonymous env token so the payload
	// is valid; subsequent requests won't re-send the dead token.
	if (sessionRevoked) {
		const secure = new URL(req.url).protocol === 'https:';
		headers.append(
			'Set-Cookie',
			`${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${
				secure ? '; Secure' : ''
			}`
		);
	}

	return new Response(JSON.stringify(data), { status: 200, headers });
}

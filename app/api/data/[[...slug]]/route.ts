import { loadFromPath } from '../../../../lib/load';

export const dynamic = 'force-dynamic';

interface RouteContext {
	params: Promise<{ slug?: string[] }>;
}

export async function GET(req: Request, ctx: RouteContext) {
	const { slug } = await ctx.params;
	const pathname = slug ? `/${slug.join('/')}` : '/';
	const { data } = await loadFromPath(pathname, new Headers(req.headers));
	return Response.json(data, {
		headers: {
			'Cache-Control': 's-maxage=60, stale-while-revalidate',
		},
	});
}

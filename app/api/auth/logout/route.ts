import { SESSION_COOKIE } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

async function logout(req: Request): Promise<Response> {
	const url = new URL(req.url);
	const returnTo = url.searchParams.get('return_to') || '/';
	const safeReturnTo =
		returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';
	const secure = url.protocol === 'https:' ? '; Secure' : '';
	const headers = new Headers({ Location: safeReturnTo });
	headers.append(
		'Set-Cookie',
		`${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
	);
	return new Response(null, { status: 302, headers });
}

// Support both GET (for simple `<a href>` links) and POST (CSRF-safer
// `<form method=post>` option).
export const GET = logout;
export const POST = logout;

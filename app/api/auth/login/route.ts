import { randomBytes } from 'node:crypto';
import { OAUTH_STATE_COOKIE } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * Starts the GitHub OAuth flow. Generates a random `state` value, stashes
 * it in a short-lived HttpOnly cookie, and redirects the browser to
 * GitHub. The callback route verifies the `state` matches to prevent CSRF.
 */
export async function GET(req: Request) {
	const clientId = process.env.GITHUB_CLIENT_ID;
	if (!clientId) {
		return new Response(
			'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
			{ status: 500 }
		);
	}

	const url = new URL(req.url);
	const returnTo = url.searchParams.get('return_to') || '/';
	const state = randomBytes(16).toString('hex');

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: `${url.origin}/api/auth/callback`,
		scope: 'read:user repo',
		state,
		// `allow_signup=true` is the default; set explicit for clarity.
		allow_signup: 'true',
	});

	const headers = new Headers({
		Location: `https://github.com/login/oauth/authorize?${params}`,
	});
	headers.append(
		'Set-Cookie',
		`${OAUTH_STATE_COOKIE}=${state}|${encodeURIComponent(
			returnTo
		)}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax${
			url.protocol === 'https:' ? '; Secure' : ''
		}`
	);

	return new Response(null, { status: 302, headers });
}

import {
	OAUTH_STATE_COOKIE,
	SESSION_COOKIE,
	sealSession,
	type SessionPayload,
} from '../../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * GitHub redirects here after the user authorizes the app. We verify the
 * state, exchange the code for an access token, fetch the user profile,
 * and set the session cookie.
 */
export async function GET(req: Request) {
	const clientId = process.env.GITHUB_CLIENT_ID;
	const clientSecret = process.env.GITHUB_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		return new Response('GitHub OAuth is not configured.', { status: 500 });
	}

	const url = new URL(req.url);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const error = url.searchParams.get('error');
	if (error) {
		return new Response(`GitHub OAuth error: ${error}`, { status: 400 });
	}
	if (!code || !state) {
		return new Response('Missing code or state.', { status: 400 });
	}

	// Parse the state cookie (format: `<state>|<url-encoded return_to>`).
	const stateCookie = req.headers
		.get('cookie')
		?.split(/;\s*/)
		.find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
		?.split('=')[1];
	if (!stateCookie) {
		return new Response('Missing state cookie.', { status: 400 });
	}
	const [expectedState, encodedReturnTo = '/'] = stateCookie.split('|');
	if (state !== expectedState) {
		return new Response('State mismatch.', { status: 400 });
	}
	let returnTo = '/';
	try {
		const candidate = decodeURIComponent(encodedReturnTo);
		// Only allow redirects back to our own site.
		if (candidate.startsWith('/') && !candidate.startsWith('//')) {
			returnTo = candidate;
		}
	} catch {
		// keep default
	}

	// Exchange the code for an access token.
	const tokenRes = await fetch(
		'https://github.com/login/oauth/access_token',
		{
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				client_id: clientId,
				client_secret: clientSecret,
				code,
				redirect_uri: `${url.origin}/api/auth/callback`,
			}),
		}
	);
	const tokenPayload = (await tokenRes.json()) as {
		access_token?: string;
		token_type?: string;
		scope?: string;
		error?: string;
		error_description?: string;
	};
	if (!tokenRes.ok || !tokenPayload.access_token) {
		return new Response(
			`Failed to exchange code: ${
				tokenPayload.error_description ??
				tokenPayload.error ??
				tokenRes.statusText
			}`,
			{ status: 400 }
		);
	}
	const accessToken = tokenPayload.access_token;

	// Fetch the user profile so we can remember id/login/avatar.
	const userRes = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/vnd.github+json',
			'User-Agent': 'import-server',
		},
	});
	if (!userRes.ok) {
		return new Response('Failed to fetch GitHub user profile.', {
			status: 400,
		});
	}
	const user = (await userRes.json()) as {
		id: number;
		login: string;
		avatar_url: string;
	};

	const session: SessionPayload = {
		accessToken,
		userId: user.id,
		login: user.login,
		avatarUrl: user.avatar_url,
	};

	const secure = url.protocol === 'https:' ? '; Secure' : '';
	const headers = new Headers({ Location: returnTo });
	headers.append(
		'Set-Cookie',
		`${SESSION_COOKIE}=${sealSession(
			session
		)}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${secure}`
	);
	// Clear the state cookie.
	headers.append(
		'Set-Cookie',
		`${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
	);

	return new Response(null, { status: 302, headers });
}

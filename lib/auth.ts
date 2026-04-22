import { cookies } from 'next/headers';
import { openSession, SESSION_COOKIE, type SessionPayload } from './session';

/**
 * Return the current user's session (decrypted from the cookie) or `null`
 * when the request is anonymous.
 */
export async function getSession(): Promise<SessionPayload | null> {
	const store = await cookies();
	const cookie = store.get(SESSION_COOKIE)?.value;
	return openSession<SessionPayload>(cookie);
}

/**
 * Return the GitHub token to use for a request: the logged-in user's
 * token if one is present, otherwise the server-side fallback
 * `GITHUB_TOKEN` env var (if configured).
 */
export async function getEffectiveGithubToken(): Promise<string | undefined> {
	const session = await getSession();
	return session?.accessToken ?? process.env.GITHUB_TOKEN;
}

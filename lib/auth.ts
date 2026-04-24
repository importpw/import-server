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
 * Trim whitespace from a token sourced from `process.env` or a cookie.
 * A trailing newline (commonly introduced when pasting into the Vercel
 * env-var UI) produces an `Authorization: Bearer ghp_xxx\n` header which
 * GitHub rejects with 401 "Bad credentials", even though the underlying
 * token is perfectly valid.
 */
function cleanToken(raw: string | undefined): string | undefined {
	if (!raw) return undefined;
	const trimmed = raw.trim();
	return trimmed || undefined;
}

/**
 * Return the GitHub token to use for a request: the logged-in user's
 * token if one is present, otherwise the server-side fallback
 * `GITHUB_TOKEN` env var (if configured).
 */
export async function getEffectiveGithubToken(): Promise<string | undefined> {
	const session = await getSession();
	return cleanToken(session?.accessToken) ?? cleanToken(process.env.GITHUB_TOKEN);
}

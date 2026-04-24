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
export function cleanToken(raw: string | undefined): string | undefined {
	if (!raw) return undefined;
	const trimmed = raw.trim();
	return trimmed || undefined;
}

export type TokenSource = 'session' | 'env' | 'none';

export interface EffectiveToken {
	token: string | undefined;
	source: TokenSource;
}

/**
 * Return the GitHub token to use for a request, together with where it
 * came from so callers can tell a stale OAuth session apart from a
 * broken server-side env token when GitHub returns 401.
 *
 * Precedence:
 *   1. The logged-in user's OAuth access_token (from the session cookie).
 *   2. The server-side `GITHUB_TOKEN` env var (anonymous fallback).
 *   3. Nothing — unauthenticated requests, subject to GitHub's 60/hour
 *      per-IP rate limit.
 */
export async function getEffectiveGithubToken(): Promise<EffectiveToken> {
	const session = await getSession();
	const sessionToken = cleanToken(session?.accessToken);
	if (sessionToken) return { token: sessionToken, source: 'session' };

	const envToken = cleanToken(process.env.GITHUB_TOKEN);
	if (envToken) return { token: envToken, source: 'env' };

	return { token: undefined, source: 'none' };
}

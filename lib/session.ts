import {
	createCipheriv,
	createDecipheriv,
	createHash,
	randomBytes,
} from 'node:crypto';

/**
 * Authenticated-encryption session cookie helpers.
 *
 * `sealSession` encrypts + authenticates a JSON payload with AES-256-GCM
 * and returns a base64url string suitable for use as a cookie value.
 * `openSession` verifies + decrypts it and returns the payload (or `null`
 * if the cookie is missing / tampered with / encrypted with a different
 * secret).
 *
 * Cookie format (base64url of):  iv (12 bytes) || tag (16 bytes) || ciphertext
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

function getKey(): Buffer {
	const secret = process.env.AUTH_SECRET;
	if (!secret) {
		throw new Error(
			'AUTH_SECRET env var is not set. Generate one with `openssl rand -hex 32`.'
		);
	}
	// Derive a stable 32-byte key from whatever length secret the user
	// provides. SHA-256 is fine here — we're not hashing passwords.
	return createHash('sha256').update(secret).digest();
}

function toBase64Url(buf: Buffer): string {
	return buf
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');
}

function fromBase64Url(str: string): Buffer {
	const b64 =
		str.replace(/-/g, '+').replace(/_/g, '/') +
		'='.repeat((4 - (str.length % 4)) % 4);
	return Buffer.from(b64, 'base64');
}

export function sealSession(payload: unknown): string {
	const key = getKey();
	const iv = randomBytes(IV_LEN);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
	const ciphertext = Buffer.concat([
		cipher.update(plaintext),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();
	return toBase64Url(Buffer.concat([iv, tag, ciphertext]));
}

export function openSession<T = unknown>(cookie: string | undefined): T | null {
	if (!cookie) return null;
	try {
		const key = getKey();
		const buf = fromBase64Url(cookie);
		if (buf.length < IV_LEN + TAG_LEN) return null;
		const iv = buf.subarray(0, IV_LEN);
		const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
		const ciphertext = buf.subarray(IV_LEN + TAG_LEN);
		const decipher = createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(tag);
		const plaintext = Buffer.concat([
			decipher.update(ciphertext),
			decipher.final(),
		]);
		return JSON.parse(plaintext.toString('utf8')) as T;
	} catch {
		// Bad/tampered/stale cookie — treat as logged out.
		return null;
	}
}

export interface SessionPayload {
	/** GitHub OAuth access token. */
	accessToken: string;
	/** GitHub numeric user id. */
	userId: number;
	/** GitHub login (username). */
	login: string;
	/** Avatar URL, cached so we don't re-fetch on every request. */
	avatarUrl: string;
}

export const SESSION_COOKIE = 'import_session';
export const OAUTH_STATE_COOKIE = 'import_oauth_state';

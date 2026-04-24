import { cleanToken, getEffectiveGithubToken } from './auth';
import parseImportPath from './parse-import-path';
import resolveImport, { type ResolvedImport } from './resolve';
import toURL from './to-github-raw-url';

const DEFAULT_ORG = 'importpw';
const DEFAULT_REPO = 'import';

export const resolveOpts = {
	defaultOrg: DEFAULT_ORG,
	defaultRepo: DEFAULT_REPO,
};

export interface LoadedData extends ResolvedImport {
	asPath: string;
	host: string;
	proto: string;
	fetch?: {
		url: string;
		statusCode: number;
		headers: Record<string, string>;
		body: string;
	};
}

export interface LoadResult {
	data: LoadedData;
	/**
	 * Constructed raw URL that would serve the entrypoint for the given
	 * request (used by the `raw` route handler to proxy the response).
	 */
	rawUrl: string;
	/**
	 * True when the caller's signed-in OAuth access_token was rejected
	 * by GitHub with 401 — the user's session is dead (they revoked the
	 * app's permission on github.com, or the token otherwise became
	 * invalid). Callers should clear the session cookie so subsequent
	 * requests fall back to anonymous / env-token resolution.
	 *
	 * In this case the resolution has already been retried with the
	 * anonymous-fallback token, so `data` + `rawUrl` are still valid.
	 */
	sessionRevoked?: boolean;
}

/**
 * Given a pathname like `/importpw/import/docs/foo.md` plus request headers,
 * resolve the repository metadata from GitHub and optionally fetch the
 * readme/entry content.
 */
export async function loadFromPath(
	pathname: string,
	headers: Headers,
	{ includeContent = true }: { includeContent?: boolean } = {}
): Promise<LoadResult> {
	const parsed = parseImportPath(pathname);

	// Handle `docs/*` paths -> importpw/import/docs/*.md
	if (parsed.org === 'docs') {
		let file = parsed.repo ?? '';
		if (parsed.file) file += '/' + parsed.file;
		parsed.file = `docs/${file}`;
		if (!parsed.file.endsWith('.md')) parsed.file += '.md';
		parsed.org = resolveOpts.defaultOrg;
		parsed.repo = resolveOpts.defaultRepo;
	}

	const effective = await getEffectiveGithubToken();
	let sessionRevoked = false;

	let resolved: LoadedData;
	try {
		resolved = (await resolveImport(parsed, {
			...resolveOpts,
			token: effective.token,
		})) as LoadedData;
	} catch (err: any) {
		// If the user's own OAuth access_token was rejected, their
		// session is stale (they revoked the app on github.com, or the
		// token has been invalidated some other way). Transparently
		// retry with the anonymous-fallback env token so the page still
		// renders, and signal to the caller that the session cookie
		// should be cleared on the response.
		if (err?.status === 401 && effective.source === 'session') {
			console.warn(
				'[load] OAuth session token rejected by GitHub (401). ' +
					'Falling back to the anonymous env token for this ' +
					'request and clearing the session cookie.'
			);
			sessionRevoked = true;
			const fallbackToken = cleanToken(process.env.GITHUB_TOKEN);
			resolved = (await resolveImport(parsed, {
				...resolveOpts,
				token: fallbackToken,
			})) as LoadedData;
		} else {
			throw err;
		}
	}

	resolved.asPath = pathname;
	resolved.host =
		headers.get('x-forwarded-host') ?? headers.get('host') ?? '';
	let proto = headers.get('x-forwarded-proto') ?? 'https';
	if (!proto.endsWith(':')) proto += ':';
	resolved.proto = proto;

	const rawUrl = toURL({
		...resolved,
		file: resolved.entrypoint || resolved.file!,
	});

	if (includeContent) {
		const contentUrl = toURL({
			...resolved,
			file: resolved.readme || resolved.file!,
		});
		const res = await fetch(contentUrl, { cache: 'no-store' });
		const headersOut: Record<string, string> = {};
		res.headers.forEach((v, k) => {
			headersOut[k] = v;
		});
		resolved.fetch = {
			url: res.url,
			statusCode: res.status,
			headers: headersOut,
			body: await res.text(),
		};
	}

	return { data: resolved, rawUrl, sessionRevoked };
}

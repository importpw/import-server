import parseImportPath from './parse-import-path';
import resolveImport, { type ResolvedImport } from './resolve';
import toURL from './to-github-raw-url';

export const resolveOpts = {
	defaultOrg: 'importpw',
	defaultRepo: 'import',
	get token() {
		return process.env.GITHUB_TOKEN;
	},
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

	const resolved = (await resolveImport(parsed, resolveOpts)) as LoadedData;
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

	return { data: resolved, rawUrl };
}

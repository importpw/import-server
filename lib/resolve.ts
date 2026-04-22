import { LRUCache } from 'lru-cache';
import { createHash } from 'node:crypto';
import { basename, extname } from 'node:path';

/**
 * Minimal GitHub REST client for the two endpoints we actually use:
 * - GET /repos/:org/:repo           (for the repo description)
 * - GET /repos/:org/:repo/git/trees/:committish
 *
 * Previously this module used `github-api`, which pulls in `axios@0.21`,
 * which pulls in `url.parse()`, which emits a DEP0169 warning on modern
 * Node. A hand-rolled fetch() wrapper is simpler, drops two transitive
 * deps, and avoids the warning entirely.
 */

interface GithubResponse<T> {
	status: number;
	data: T;
}

interface RepoDetails {
	description: string | null;
	// …a lot more fields we don't use.
}

interface TreeEntry {
	path: string;
	type: string;
	sha: string;
	[key: string]: unknown;
}

interface TreeResponse {
	sha: string;
	tree: TreeEntry[];
	truncated: boolean;
}

async function githubGet<T>(
	path: string,
	token: string | undefined
): Promise<GithubResponse<T>> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'import-server',
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const res = await fetch(`https://api.github.com${path}`, {
		headers,
		cache: 'no-store',
	});

	// Only parse the body on success. For non-2xx statuses we still want
	// the status code so callers can distinguish "repo not found" (404)
	// from "rate-limited" (403) etc.
	let data: T | undefined;
	if (res.ok) {
		data = (await res.json()) as T;
	}
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		const err = new Error(
			`${res.status} ${res.statusText} from GET ${path}: ${body}`
		) as Error & { status: number };
		err.status = res.status;
		throw err;
	}
	return { status: res.status, data: data as T };
}

interface CachedRepo {
	details: GithubResponse<RepoDetails>;
	tree: GithubResponse<TreeResponse>;
}

/**
 * In-memory LRU cache for the `{ details, tree }` tuple we fetch from
 * GitHub. Keeps dev hot-reloads and repeat requests from burning through
 * the unauthenticated 60/hour API quota.
 *
 * We cache the in-flight `Promise` (not the resolved value) so concurrent
 * requests for the same key coalesce into a single GitHub API round trip.
 */
const repoCache = new LRUCache<string, Promise<CachedRepo>>({
	max: 500,
	ttl: 60_000,
});

/**
 * Cheap fingerprint of a GitHub token for use as a cache-key component.
 * Different tokens see different private repos, so we must not share
 * cache entries across tokens. We hash to keep the full token out of the
 * key (which would otherwise show up in debug logs / heap dumps) and
 * truncate to keep the key short.
 */
function tokenFingerprint(token: string | undefined): string {
	if (!token) return 'anon';
	return createHash('sha256').update(token).digest('hex').slice(0, 12);
}

function getRepoCached(
	org: string,
	repo: string,
	committish: string,
	token: string | undefined
): Promise<CachedRepo> {
	const key = `${tokenFingerprint(token)}:${org}/${repo}@${committish}`;
	const cached = repoCache.get(key);
	if (cached) return cached;

	const p = (async () => {
		const [details, tree] = await Promise.all([
			githubGet<RepoDetails>(
				`/repos/${encodeURIComponent(org)}/${encodeURIComponent(
					repo
				)}`,
				token
			),
			githubGet<TreeResponse>(
				`/repos/${encodeURIComponent(org)}/${encodeURIComponent(
					repo
				)}/git/trees/${encodeURIComponent(committish)}`,
				token
			),
		]);
		return { details, tree };
	})();

	repoCache.set(key, p);
	// On failure, evict immediately so the next request retries instead
	// of serving the rejected promise for the rest of the TTL window.
	p.catch(() => repoCache.delete(key));
	return p;
}

function findFile(tree: TreeEntry[], name: string): string | null {
	const base = basename(name, extname(name));
	const file =
		tree.find((f) => f.path === name) ||
		tree.find((f) => f.path === base) ||
		tree.find((f) => f.path.toLowerCase() === name.toLowerCase()) ||
		tree.find((f) => f.path.toLowerCase() === base.toLowerCase());
	if (!file) return null;
	return file.path;
}

export interface ResolveInput {
	org?: string;
	repo?: string;
	file?: string;
	committish?: string;
}

export interface ResolveOpts {
	defaultOrg: string;
	defaultRepo: string;
	token?: string;
}

export interface ResolvedImport {
	org: string;
	repo: string;
	file?: string;
	committish: string;
	sha?: string;
	foundRepo: boolean;
	foundCommit: boolean;
	foundFile?: boolean;
	repoDescription?: string;
	readme?: string;
	foundReadme?: boolean;
	entrypoint?: string;
	foundEntrypoint?: boolean;
}

export default async function resolveImport(
	{ org, repo, file, committish = 'master' }: ResolveInput = {},
	{ defaultOrg, defaultRepo, token }: ResolveOpts
): Promise<ResolvedImport> {
	if (!org) org = defaultOrg;
	if (!repo) repo = defaultRepo;

	let sha: string | undefined;
	let tree: TreeResponse | undefined;
	let match: string | null;
	let repoDescription: string | undefined;
	let foundRepo = false;
	let foundCommit = false;

	try {
		const cached = await getRepoCached(org, repo, committish, token);
		if (cached.details.status === 200) {
			repoDescription = cached.details.data.description ?? undefined;
			foundRepo = true;
		}
		tree = cached.tree.data;
	} catch (err: any) {
		// Rate-limit errors (403) are noisy during local dev without a
		// token — log them at `warn` level with a friendly hint instead of
		// as an error, which Next's dev overlay would surface.
		const status = err?.status;
		if (status === 403 && /rate limit/i.test(err?.message ?? '')) {
			console.warn(
				`[resolve] GitHub API rate limit hit for ${org}/${repo}${
					!token
						? '. Set GITHUB_TOKEN in .env.local to raise the limit to 5000/hour.'
						: '.'
				}`
			);
		} else if (status !== 404) {
			// 404 is "repo doesn't exist / isn't visible to this token" —
			// not an error worth surfacing to the dev overlay.
			console.error(err);
		}
	}
	if (tree) {
		sha = tree.sha;
		foundCommit = true;
	}

	const params: ResolvedImport = {
		repo: repo!,
		org: org!,
		file,
		committish,
		sha,
		foundRepo,
		repoDescription,
		foundCommit,
	};

	if (file) {
		if (tree) {
			match = findFile(tree.tree, params.file!);
			if (match) {
				// findFile() is case-insensitive and also matches on the
				// basename (no extension), so the entry it returns may
				// differ from the user-provided path. Use the matched
				// path going forward so downstream URL construction hits
				// the real file on GitHub.
				params.file = match;
				params.foundFile = true;
			} else {
				params.foundFile = false;
			}
		} else {
			params.foundFile = false;
		}
	} else {
		const defaultReadme = 'Readme.md';
		params.readme = defaultReadme;
		params.foundReadme = false;

		const defaultEntrypoint = `${repo}.sh`;
		params.entrypoint = defaultEntrypoint;
		params.foundEntrypoint = false;

		if (tree) {
			match = findFile(tree.tree, defaultReadme);
			if (match) {
				params.readme = match;
				params.foundReadme = true;
			}

			match = findFile(tree.tree, defaultEntrypoint);
			if (match) {
				params.entrypoint = match;
				params.foundEntrypoint = true;
			}
		}
	}

	return params;
}

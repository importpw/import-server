// @ts-ignore - no types available
import GitHub from 'github-api';
import { LRUCache } from 'lru-cache';
import { createHash } from 'node:crypto';
import { basename, extname } from 'node:path';

const ghInstances = new Map<string | undefined, any>();

interface CachedRepo {
	details: any;
	tree: any;
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
	gh: any,
	org: string,
	repo: string,
	committish: string,
	token: string | undefined
): Promise<CachedRepo> {
	const key = `${tokenFingerprint(token)}:${org}/${repo}@${committish}`;
	const cached = repoCache.get(key);
	if (cached) return cached;

	const p = (async () => {
		const ghRepo = gh.getRepo(org, repo);
		const [details, tree] = await Promise.all([
			ghRepo.getDetails(),
			ghRepo.getTree(committish),
		]);
		return { details, tree };
	})();

	repoCache.set(key, p);
	// On failure, evict immediately so the next request retries instead
	// of serving the rejected promise for the rest of the TTL window.
	p.catch(() => repoCache.delete(key));
	return p;
}

interface TreeEntry {
	path: string;
	[key: string]: unknown;
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
	let gh = ghInstances.get(token);
	if (!gh) {
		gh = new GitHub({ token });
		ghInstances.set(token, gh);
	}

	if (!org) org = defaultOrg;
	if (!repo) repo = defaultRepo;

	let sha: string | undefined;
	let tree: any;
	let match: string | null;
	let repoDetails: any;
	let repoDescription: string | undefined;
	let foundRepo = false;
	let foundCommit = false;

	try {
		const cached = await getRepoCached(gh, org, repo, committish, token);
		repoDetails = cached.details;
		tree = cached.tree;
		if (repoDetails.status === 200) {
			repoDescription = repoDetails.data.description;
			foundRepo = true;
		}
		tree = tree.data;
	} catch (err: any) {
		// Rate-limit errors (403) are noisy during local dev without a
		// token — log them at `warn` level with a friendly hint instead of
		// as an error, which Next's dev overlay would surface.
		const status = err?.response?.status ?? err?.status;
		if (status === 403 && /rate limit/i.test(err?.message ?? '')) {
			console.warn(
				`[resolve] GitHub API rate limit hit for ${org}/${repo}${
					!token
						? '. Set GITHUB_TOKEN in .env.local to raise the limit to 5000/hour.'
						: '.'
				}`
			);
		} else {
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
			params.foundFile = match === params.file;
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

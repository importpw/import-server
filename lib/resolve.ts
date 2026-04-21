// @ts-ignore - no types available
import GitHub from 'github-api';
import { basename, extname } from 'node:path';

const ghInstances = new Map<string | undefined, any>();

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
		const ghRepo = gh.getRepo(org, repo);
		[repoDetails, tree] = await Promise.all([
			ghRepo.getDetails(),
			ghRepo.getTree(committish),
		]);
		if (repoDetails.status === 200) {
			repoDescription = repoDetails.data.description;
			foundRepo = true;
		}
		tree = tree.data;
	} catch (err) {
		console.error(err);
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

const GitHub = require('github-api');
const { basename, extname } = require('path');

const ghInstances = new Map();

function findFile(tree, name) {
	const base = basename(name, extname(name));
	const file =
		tree.find((file) => file.path === name) || // exact match
		tree.find((file) => file.path === base) || // basename match
		tree.find((file) => file.path.toLowerCase() === name.toLowerCase()) || // case-insensitive match
		tree.find((file) => file.path.toLowerCase() === base.toLowerCase()); // case-insensitive base match
	if (!file) return null;
	return file.path;
}

export default async function resolveImport(
	{ org, repo, file, committish = 'master' } = {},
	{ defaultOrg, defaultRepo, token } = {}
) {
	let gh = ghInstances.get(token);
	if (!gh) {
		gh = new GitHub({ token });
		ghInstances.set(token, gh);
	}

	if (!org) {
		org = defaultOrg;
	}

	if (!repo) {
		repo = defaultRepo;
	}

	// Resolve the SHA of the `committish` using the GitHub API
	let sha;
	let tree;
	let match;
	let repoDetails;
	let repoDescription;
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

	const params = {
		repo,
		org,
		file,
		committish,
		sha,
		foundRepo,
		repoDescription,
		foundCommit,
	};
	if (file) {
		if (tree) {
			match = findFile(tree.tree, params.file);
		}
		params.foundFile = match === params.file;
	} else {
		// A default import or Readme page render, attempt to get information
		// about both and let the consumer decide what to render
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

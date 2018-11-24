const GitHub = require('github-api');
const { basename, extname } = require('path');

const ghInstances = new Map();

const toURL = ({repo, org, committish = 'master', file}) => (
  `https://raw.githubusercontent.com/${encodeURIComponent(org)}/${encodeURIComponent(repo)}/${encodeURIComponent(committish)}/${encodeURI(file)}`
);

function findFile(tree, name) {
  const base = basename(name, extname(name));
  const file = tree.find(file => file.path === name) // exact match
            || tree.find(file => file.path === base) // basename match
            || tree.find(file => file.path.toLowerCase() === name.toLowerCase())  // case-insensitive match
            || tree.find(file => file.path.toLowerCase() === base.toLowerCase()); // case-insensitive base match
  if (!file) return null;
  return file.path;
}

export default async function resolveImport (
  { org, repo, file, committish = 'master', renderReadme = false } = {},
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
  let repoDetails;

  try {
    const ghRepo = gh.getRepo(org, repo);
    [ repoDetails, tree ] = await Promise.all([
      ghRepo.getDetails(),
      ghRepo.getTree(committish)
    ]);
    if (repoDetails.status === 200) {
      repoDetails = repoDetails.data;
    } else {
      repoDetails = null;
    }
    tree = tree.data;
  } catch (err) {
    console.error(err);
  }
  if (tree) {
    sha = tree.sha;
  }

  if (!file) {
    let defaultName;
    if (renderReadme) {
      defaultName = 'Readme.md';
    } else {
      defaultName = `${repo}.sh`;
    }

    if (tree) {
      file = findFile(tree.tree, defaultName);
    } else {
      // For the private repo 404 case, we have to guess the filename since
      // we don't have the GitHub API data of what files are in the repo
      file = defaultName;
    }
  }

  const url = toURL({repo, org, file, committish});

  const params = {
    repo,
    org,
    file,
    committish,
    sha,
    url,
    repoDetails
  };
  return params;
}

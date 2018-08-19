const next = require('next');
const bytes = require('bytes');
const {parse} = require('url');
const LRU = require('lru-cache');
const toBuffer = require('raw-body');
const GitHub = require('github-api');
const fetch = require('isomorphic-fetch');
const {basename, extname, resolve} = require('path');
const {
  IMPORT_ORG = 'importpw',
  IMPORT_REPO = 'import',
  GITHUB_TOKEN  // optional
} = process.env;

const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
  conf: {
    useFileSystemPublicRoutes: false
  }
});
const handle = app.getRequestHandler();
const appPrepare = app.prepare();

const gh = new GitHub({
  token: GITHUB_TOKEN
});

const toURL = ({repo, org, committish, file}) => (
  `https://raw.githubusercontent.com/${org}/${repo}/${committish}/${file}`
);

const cache = LRU({
  max: bytes('10mb'),
  length(n, key) {
    return n.body.length;
  },
  dispose(key, n) {
    console.log('dispose', { n, key });
  }
});

function redirect (res, url) {
  res.statusCode = 302;
  res.setHeader('Location', url);
  return `Redirecting to ${url}\n`;
}

module.exports = async (req, res) => {
  let committish = 'master';
  let org = IMPORT_ORG;
  let repo = IMPORT_REPO;

  const parsedUrl = parse(req.url, true);
  let {pathname, query: {file}} = parsedUrl;

  // Redirect to the user/org's GitHub avatar for the favicon
  // See: https://stackoverflow.com/a/36380674/376773
  if (pathname === '/favicon.ico') {
    const favicon = `https://github.com/${org}.png`;
    return redirect(res, favicon);
  }

  // If the browser is requesting the URL, then render with Next.js
  const isHTML = /html/i.test(req.headers.accept)
    || /twitterbot/i.test(req.headers['user-agent'])
    || /facebookexternalhit/i.test(req.headers['user-agent']);

  // `/_next/*` is Next.js specific files, so let it handle the request
  if (/^\/_next\//.test(pathname)) {
    handle(req, res, parsedUrl);
    return;
  }

  const at = pathname.lastIndexOf('@');
  if (at !== -1) {
    committish = pathname.substring(at + 1);
    pathname = pathname.substring(0, at);
  }
  const parts = pathname.substring(1).split('/');
  const numParts = parts.length;

  if (numParts === 1) {
    if (parts[0]) repo = parts[0];
  } else if (numParts === 2) {
    if (parts[0]) org = parts[0];
    if (parts[1]) repo = parts[1];
  } else {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    return `Expected up to 2 slashes in the URL, but got ${numParts}\n`;
  }

  // Resolve the SHA of the `committish` using the GitHub API
  let sha;
  let tree;
  try {
    tree = (await gh.getRepo(org, repo).getTree(committish)).data;
  } catch (err) {
    console.error(err);
  }
  if (tree) {
    sha = tree.sha;
  }

  if (!file) {
    let defaultName;
    if (isHTML) {
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

  const params = {repo, org, committish, file};
  const id = JSON.stringify(params);
  let cached = cache.get(id);

  if (!cached) {
    const url = toURL(params);
    const res2 = await fetch(url);
    if (!res2.ok) {
      // If the asset was 404, then it's possibly a private repo.
      // Redirect to the URL that 404'd and let `curl --netrc` give it a go.
      return redirect(res, res2.url);
    }
    const body = await toBuffer(res2.body, {
      limit: '1mb'
    });
    cached = {
      body,
      status: res2.status,
      headers: {
        'Content-Type': res2.headers.get('Content-Type'),
        'ETag': res2.headers.get('ETag'),
        'Content-Location': res2.url
      }
    };
    const maxAge = new Date(res2.headers.get('Expires')) - Date.now();
    cache.set(id, cached, maxAge);
  }

  if (isHTML) {
    // Render the readme as markdown
    await appPrepare;
    params.contents = cached.body.toString('utf8');
    params.sha = sha;
    params.defaultOrg = IMPORT_ORG;
    params.defaultRepo = IMPORT_REPO;
    app.render(req, res, '/layout', params);
  } else {
    // `curl` request or otherwise, serve the raw file
    res.statusCode = cached.status;
    for (const name of Object.keys(cached.headers)) {
      res.setHeader(name, cached.headers[name]);
    }
    return cached.body;
  }
};

function findFile(tree, name) {
  const base = basename(name, extname(name));
  const file = tree.find(file => file.path === name) // exact match
            || tree.find(file => file.path === base) // basename match
            || tree.find(file => file.path.toLowerCase() === name.toLowerCase())  // case-insensitive match
            || tree.find(file => file.path.toLowerCase() === base.toLowerCase()); // case-insensitive base match
  return file.path;
}

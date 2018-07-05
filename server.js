const bytes = require('bytes');
const {parse} = require('url');
const LRU = require('lru-cache');
const fetch = require('node-fetch');
const toBuffer = require('raw-body');
const {
  IMPORT_ORG = 'importpw',
  IMPORT_REPO = 'import'
} = process.env;

const toURL = ({repo, org, ref, file}) => (
  `https://github.com/${org}/${repo}/raw/${ref}/${file}`
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

module.exports = async (req, res) => {
  let ref = 'master';
  let org = IMPORT_ORG;
  let repo = IMPORT_REPO;
  let {pathname, query: {file}} = parse(req.url, true);

  const at = pathname.lastIndexOf('@');
  if (at !== -1) {
    ref = pathname.substring(at + 1);
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
  if (!file) file = `${repo}.sh`;
  const params = {repo, org, ref, file};
  const id = JSON.stringify(params);
  let cached = cache.get(id);

  if (!cached) {
    const url = toURL(params);
    const res2 = await fetch(url);
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
    cache.set(id, cached);
  }

  res.statusCode = cached.status;
  for (const name of Object.keys(cached.headers)) {
    res.setHeader(name, cached.headers[name]);
  }
  return cached.body;
};

const {parse} = require('url');
const {
  IMPORT_ORG = 'importpw',
  IMPORT_REPO = 'import'
} = process.env;

const toURL = ({repo, org, ref, file}) => (
  `https://github.com/${org}/${repo}/raw/${ref}/${file}`
);

module.exports = async (req, res) => {
  let {pathname, query: {file}} = parse(req.url, true);
  const parts = pathname.substring(1).split('/');
  if (parts.length > 2) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Too many slashes in the URL\n`);
    return;
  }
  let repo = parts.pop() || IMPORT_REPO;
  const org = parts.pop() || IMPORT_ORG;
  let ref = 'master';
  const at = repo.indexOf('@');
  if (at !== -1) {
    ref = repo.substring(at + 1);
    repo = repo.substring(0, at);
  }
  const url = toURL({repo, org, ref, file: file || `${repo}.sh`});
  res.statusCode = 302;
  res.setHeader('Location', url);
  res.end(`Redirecting to ${JSON.stringify(url)}\n`);
};

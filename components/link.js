import { join } from 'path';
import { parse } from 'url';
import { withRouter } from 'next/router';
import parseImportPath from '../lib/parse-import-path';

function MarkdownLink ({ href, router, org, repo, asPath, children }) {
  const prefix = `/${org}/${repo}`;
  const isRelative = /^\.\.?\//.test(href) && asPath.substring(0, prefix.length) !== prefix;
  if (isRelative) {
    href = '/' + join(org, repo, href);
  }

  // TODO: parse github.com URLs into import.pw URLs when appropriate

  function handleClick (e) {
    const { host, pathname } = parse(href);
    const isImportPath = /^\.?\//.test(href);
    if (isImportPath) {
      e.preventDefault()
      router.push({
        pathname: '/index',
        query: parseImportPath(pathname)
      }, href);
    }
  }

  return <a href={href} onClick={handleClick}>{children}</a>;
}

export default withRouter(MarkdownLink);

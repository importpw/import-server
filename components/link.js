import { join } from 'path';
import { parse, resolve } from 'url';
import { withRouter } from 'next/router';
import parseImportPath from '../lib/parse-import-path';

function MarkdownLink ({ href, router, org, repo, asPath, children }) {
  const prefix = `/${org}/${repo}`;
  const isRelative = /^\.\.?\//.test(href) && asPath.substring(0, prefix.length) !== prefix;
  if (isRelative) {
    href = '/' + join(org, repo, href);
  }
  if (href.startsWith('.')) {
    href = resolve(asPath, href);
  }
  const isImportPath = href.startsWith('/');

  // TODO: parse github.com URLs into import.pw URLs when appropriate

  let className;
  let handleClick;
  if (isImportPath) {
    handleClick = (e) => {
      e.preventDefault()
      const query = parseImportPath(href);
      router.push({ pathname: '/index', query }, href);
    };
  } else {
    className = 'external';
  }

  return <a href={href} className={className} onClick={handleClick}>{children}</a>;
}

export default withRouter(MarkdownLink);

import { join } from 'path';
import Link from 'next/link';

export default function MarkdownLink (props) {
  const ownProps = Object.assign({}, props);
  let { href } = ownProps;
  delete ownProps.href;

  const isRelative = /^\.\.?\//.test(href);
  if (isRelative) {
    href = '/' + join(props.org, props.repo, href);
  }

  return <Link href={href}><a>{props.children}</a></Link>;
}

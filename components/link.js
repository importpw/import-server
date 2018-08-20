import Link from 'next/link';

export default function MarkdownLink (props) {
  const ownProps = Object.assign({}, props);
  let { href } = ownProps;
  delete ownProps.href;
  return <Link href={href}><a {...ownProps}>{props.children}</a></Link>;
}

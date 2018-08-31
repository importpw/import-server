export default function Curry(C, props) {
  return (ownProps) => {
    return <C {...props} {...ownProps}>{ownProps.children}</C>;
  };
}

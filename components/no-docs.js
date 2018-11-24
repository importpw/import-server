import ObjectInspector from 'react-object-inspector';

export default (props) => {
  const { repo, foundEntrypoint, foundReadme } = props;
  return (
    <div className="no-docs">
      <h1>{repo}</h1>
      <h2>Darn.</h2>
      <h3>The documentation could not be loaded.</h3>
      <ObjectInspector data={props} />
    </div>
  );
};

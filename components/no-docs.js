import Link from 'next/link';
import Cry from './icons/cry';
import ObjectInspector from 'react-object-inspector';

export default (props) => {
  const { org, repo, fetch, committish, host, foundRepo, foundCommit, foundEntrypoint, foundReadme } = props;
  const repoFull = `${org}/${repo}`;
  const reasons = [];
  if (!foundRepo) {
    reasons.push(
      <p key="repo">
        <h4>The repository <code>{repoFull}</code> is not accessible</h4>
        There are two possibilites:
        <ul>
          <li>The repo does not exist - Please ensure that the repo name is correct.</li>
          <li>The repo is private - The docs won't be rendered by <code>{host}</code>, but you may still use the <code>import</code> command. See the <Link href={{ pathname: '/index', query: { file: 'docs/authentication.md' } }} as={as}><a>Authentication</a></Link> page for details.</li>
        </ul>
      </p>
    );
  } else if (!foundCommit) {
    reasons.push(
      <p key="commit">
        <h4>No commit was resolved from committish <code>{committish}</code></h4>
        <ul>
          <li>Please ensure that commitish references an actual commit / tag / branch in the repository.</li>
        </ul>
      </p>
    );
  } else {
    // At this point, we know `repo` and `commit` were resolved correctly.
    // Now ensure that the repo is import-compatible and has a readme.
    if (typeof foundEntrypoint === 'boolean' && !foundEntrypoint) {
      reasons.push(
        <p key="entrypoint">
          <h4>The repository <code>{repoFull}</code> is not <em>import-compatible</em></h4>
          <ul>
            <li>Add a shell script named <code>{`${repo}.sh`}</code> to the root of the repository to make it compatible with <code>import</code>.</li>
          </ul>
        </p>
      );
    }

    if (typeof foundReadme === 'boolean' && !foundReadme) {
      reasons.push(
        <p key="readme">
          <h4>The repository <code>{repoFull}</code> does not contain a Readme file</h4>
          <ul>
            <li>Add a Markdown file named <code>Readme.md</code> to the root of the repository to render the docs on <code>{host}</code>.</li>
          </ul>
        </p>
      );
    }
  }

  return (
    <div className="no-docs">
      <h1>{repo}</h1>

      <div className="top">
        <Cry className="cry" />
        <h2>Darn.</h2>
        <h3>The documentation could not be loaded.</h3>
      </div>

      <h2>Why?</h2>
      <div className="why">{reasons}</div>

      <h2>Data</h2>
      <ObjectInspector data={props} />

      <style jsx>{`
        .top {
          text-align: center
        }

        .top :global(.cry) {
          width: 160px;
        }

        .top h2 {
          margin: 0;
          padding: 20px 0;
          font-weight: 400;
        }

        .top h3 {
          margin: 0;
          padding: 0;
          font-weight: 300;
        }
      `}</style>
    </div>
  );
};

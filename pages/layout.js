import Head from 'next/head';
import Markdown from 'react-markdown';

import GitHub from '../components/icons/github';

export default class extends React.Component {
  static async getInitialProps({ req, query }) {
    return Object.assign({}, query);
  }

  render() {
    const {contents, org, repo} = this.props;
    const title = `${org}/${repo}`;
    const favicon = `https://github.com/${org}.png`;
    return (
      <div id="root">
        <Head>
          <title>{title}</title>
          <link rel="shortcut icon" type="image/png" href={favicon} />
        </Head>

        <div id="content">
          <Markdown source={contents} />
        </div>

        <div id="footer">
          <a href="#">View on <GitHub className="icon github" /></a>
        </div>

        <style jsx>{`
          #root {
            margin: 0 auto;
            max-width: 650px;
          }
        `}</style>

        <style global jsx>{`
          html,
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            text-rendering: optimizeLegibility;
          }

          html,
          body,
          body > div:first-child {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }

          img {
            max-width: 100%;
          }

          .icon {
            height: 1em;
          }
        `}</style>
      </div>
    )
  }
}

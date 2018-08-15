import Head from 'next/head';
import Markdown from 'react-markdown';

export default class extends React.Component {
  static async getInitialProps({ req, query }) {
    return Object.assign({}, query);
  }

  render() {
    const {contents, org, repo} = this.props;
    const title = `${org}/${repo}`;
    return (
      <div id="root">
        <Head>
          <title>{title}</title>
        </Head>

        <Markdown source={contents} />

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
        `}</style>
      </div>
    )
  }
}

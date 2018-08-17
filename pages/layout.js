import Head from 'next/head';
import Markdown from 'react-markdown';

import GitHub from '../components/icons/github';

export default class extends React.Component {
  static async getInitialProps({ req, query }) {
    return Object.assign({}, query);
  }

  render() {
    const {contents, org, repo, committish} = this.props;
    const title = `${org}/${repo}`;
    const favicon = `https://github.com/${org}.png`;
    let ghUrl = `https://github.com/${org}/${repo}`;
    if (committish !== 'master') {
      ghUrl += `/tree/${committish}`;
    }
    return (
      <div className="root">
        <Head>
          <title>{title}</title>

          <link rel="shortcut icon" type="image/png" href={favicon} />
        </Head>

        <div className="header">

        </div>

        <div className="content">
          <Markdown escapeHtml={false} source={contents} />
        </div>

        <div className="footer">
          <div className="wrapper">
            <a className="github-link" href={ghUrl}>View on <GitHub className="icon github" /></a>
          </div>
        </div>

        <style jsx>{`
          .content {
            margin: auto;
            margin-bottom: 100px;
            margin-top: 100px;
            max-width: 650px;
          }
        `}</style>

        <style global jsx>{`
          a {
            text-decoration: none;
          }

          h1 {
            font-size: 32px;
            font-weight: 400;
            text-align: center;
            margin-bottom: 50px;
          }

          h1 a {
            color: #000;
          }

          h2 {
            margin-top: 75px;
            font-size: 24px;
            font-weight: 400;
          }

          h2 code {
            border-radius: 3px;
            background: #000;
            color: #fff;
            font-family: Menlo, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, serif;
            font-size: 13px;
            font-weight: bold;
            white-space: pre-wrap;
            padding: 4px;
            position: relative;
            top: -3px;
          }

          h2 code ::before {
            content: "\`\";
          }

          h2 code ::after {
            content: "\`\";
          }

          p {
            font-size: 14px;
            line-height: 24px
          }

          p a {
            color: #0076FF;
          }

          ul {
            border-radius: 5px;
            list-style-type: none;
          }

          li {
            font-size: 14px;
            line-height: 24px;
          }

          li::before {
            content:"-";
            margin-right: 10px;
            color: #999;
          }

          li code {
            color: rgb(212, 0, 255);
            font-family: Menlo, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, serif;
            font-size: 13px;
            white-space: pre-wrap;
          }

          li code::before {
            content: "\`\";
          }

          li code::after {
            content: "\`\";
          }

          p code {
            color: rgb(212, 0, 255);
            font-family: Menlo, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, serif;
            font-size: 13px;
            white-space: pre-wrap;
          }

          p code::before {
            content: "\`\";
          }

          p code::after {
            content: "\`\";
          }

          pre {
            padding: 20px;
            border: 1px solid #eaeaea;
            border-radius: 5px;
            margin: 20px 0;
          }

          pre code {
            color: rgb(212, 0, 255);
            font-family: Menlo, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, serif;
            font-size: 13px;
            white-space: pre-wrap;
            line-height: 20px;
          }

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
            height: 18px;
            margin-left: 10px;
          }

          .footer {
            border-top: 1px solid #eaeaea;
            padding-bottom: 50px;
            padding-top: 50px;

          }

          .footer a {
            font-size: 14px;
            color: #000;
            display: flex;
          }

          .footer .wrapper {
            width: 1000px;
            margin: 0 auto;
          }
        `}</style>
      </div>
    )
  }
}

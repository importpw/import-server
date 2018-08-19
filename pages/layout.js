import Head from 'next/head';
import Markdown from 'react-markdown';

import Logotype from '../components/icons/import';
import GitHub from '../components/icons/github';
import EvilRabbit from '../components/icons/evilrabbit';

export default class extends React.Component {
  static async getInitialProps({ req, query }) {
    return Object.assign({}, query);
  }

  render() {
    const {defaultOrg, contents, org, repo, committish} = this.props;
    const title = defaultOrg === org ? repo : `${org}/${repo}`;
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
          <Logotype />
        </div>

        <div className="content">
          <Markdown escapeHtml={false} source={contents} />
        </div>

        <div className="footer">
          <div className="wrapper">
            <div className="repository">
                <a className="github-link" href={ghUrl}>View on GitHub<GitHub className="icon"/></a>
            </div>
            <div className="credits">
              <a href="/">`import`</a> project by <a href="https://n8.io">@tootallnate</a>, design by <a href="https://evilrabb.it"><EvilRabbit className="evilrabbit"/></a>
            </div>
          </div>
        </div>

        <style jsx>{`
          .content {
            margin: auto;
            margin-bottom: 100px;
            margin-top: 75px;
            max-width: 650px;
          }
        `}</style>

        <style global jsx>{`
          a {
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            font-weight: 600;
          }

          h2 code ::before {
            content: "\`\";
          }

          h2 code ::after {
            content: "\`\";
          }

          h3 {
            margin-top: 50px;
            font-size: 18px;
            font-weight: 600;
          }

          hr {
              border: 0;
              height: 0;
              border-top: 1px solid rgba(0, 0, 0, 0.1);
              border-bottom: 1px solid rgba(255, 255, 255, 0.3);
              margin-top: 75px;
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
            padding: 0;
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

          li a {
            color: #0076FF;
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

          td {
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            padding-top: 10px;
            padding-bottom: 10px;
            line-height: 24px;
          }

          th {
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }

          .header {
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 20px;
            padding-top: 20px;
            text-align: center;
          }

          .header .wrapper {
            display: flex;
            max-width: 900px;
            margin: 0 auto;
            justify-content: space-between;
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
            border: 1px solid #eaeaea;
            border-radius: 5px;
          }

          .footer {
            border-top: 1px solid #eaeaea;
            padding-bottom: 40px;
            padding-top: 40px;
          }

          .footer .wrapper {
            display: flex;
            max-width: 900px;
            margin: 0 auto;
            justify-content: space-between;
          }

          .footer .github-link {
            font-size: 14px;
            color: #000;
            display: flex;
            align-items: center;
          }

          .footer .credits {
            font-size: 14px;
            color: #666;
            display: flex;
          }

          .footer .credits a {
            color: #000;
            margin: 0 5px 0 5px;
          }

          .footer .credits .evilrabbit {
            display: flex;
            align-items: center;
          }

          .icon {
            height: 18px;
            margin-left: 10px;
          }

          .evilrabbit {
            margin-top: -1px;
          }

        `}</style>
      </div>
    )
  }
}

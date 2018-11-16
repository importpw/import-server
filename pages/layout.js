import Head from 'next/head';
import Link from 'next/link';
import Markdown from 'react-markdown';
import MarkdownCode from '../components/code';
import MarkdownImage from '../components/image';
import MarkdownLink from '../components/link';
import MarkdownText from '../components/text';

import curry from '../components/curry';

// Icons
import Zeit from '../components/icons/zeit';
import Arrow from '../components/icons/arrow';
import GitHub from '../components/icons/github';
import Logotype from '../components/icons/import';

export default class extends React.Component {
  static async getInitialProps(context) {
    return Object.assign({}, context.query, {
      pathname: context.asPath
    });
  }

  componentDidMount() {
    console.log('Right Arrow by See Link from the Noun Project');
  }

  render() {
    const {defaultOrg, defaultRepo, contents, org, repo, repoDetails, committish} = this.props;
    const description = (repoDetails || {}).description;
    const avatar = `https://github.com/${org}.png`;
    let arrow;
    let orgLogo;
    let ghUrl = `https://github.com/${org}/${repo}`;
    let title = 'import ';
    let ogImageUrl = 'https://og.import.pw/';
    if (defaultOrg !== org) {
      arrow = <Arrow className="arrow" />;
      orgLogo = <img className="avatar logo" src={avatar} />;
      title += `${org}/`;
      ogImageUrl += encodeURIComponent(org) + '/';
    }
    if (defaultRepo !== repo) {
      title += repo;
      ogImageUrl += encodeURIComponent(repo);
    }
    if (committish !== 'master') {
      ghUrl += `/tree/${committish}`;
      title += `@${committish}`;
    }
    title = title.trim();

    const renderers = {
      code: MarkdownCode,
      image: MarkdownImage,
      link: curry(MarkdownLink, this.props),
      text: MarkdownText
    };

    const markdown = <Markdown
      className="markdown"
      escapeHtml={false}
      source={contents}
      renderers={renderers}
    />;

    return (
      <div className="root">
        <Head>
          <title>{title}</title>
          <link rel="shortcut icon" type="image/png" href={avatar} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={ogImageUrl} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta property="og:image" content={ogImageUrl} />
          <meta property="og:url" content="https://import.pw" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
        </Head>

        <div className="header">
          <div className="wrapper">
            <Link href="/"><a className="logotype"><Logotype className="logotype" /></a></Link>
            {arrow}{orgLogo}
          </div>
        </div>

        <div className="content">
          {markdown}
        </div>

        <div className="footer">
          <div className="wrapper">
            <div className="repository">
              <a className="github-link" href={ghUrl}>View on GitHub<GitHub className="icon"/></a>
            </div>
            <div className="credits">
              Crafted by <a href="https://zeit.co"><Zeit className="zeit" /></a>
            </div>
          </div>
        </div>

        <style jsx>{`
          .content {
            margin: auto;
            margin-bottom: 100px;
            margin-top: 50px;
            max-width: 650px;
            padding: 0 20px 0 20px;
          }
        `}</style>

        <style global jsx>{`
          a {
            color: #0076FF;
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

          pre code {
            font-family: Menlo, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, serif;
            font-size: 13px;
            line-height: 20px;
          }

          td {
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            line-height: 24px;
            padding: 10px;
          }

          th {
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }

          .header {
            text-align: center;
            position: sticky;
            top: 0;
            overflow: hidden;
            padding-bottom: 10px;
            z-index: 10;
          }

          .header .wrapper {
            align-items: center;
            background: #fff;
            display: flex;
            justify-content: center;
            margin: 0 auto;
            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.12);
            padding-bottom: 20px;
            padding-top: 20px;
            border-bottom: 1px solid #eaeaea;
          }

          .header .arrow {
            fill: #999;
            width: 12px;
            height: 100%;
            margin: 0 10px;
          }

          .header .logo {
            width: 28px;
            height: 28px;
          }

          .header .logotype {
            width: 35px;
          }

          .header .avatar {
            border: 1px solid #eaeaea;
            border-radius: 5px;
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

          .footer {
            border-top: 1px solid #eaeaea;
            color: #000;
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
            color: #000;
            font-size: 14px;
            display: flex;
            align-items: center;
          }

          .footer .credits {
            color: #666;
            font-size: 14px;
            display: flex;
            white-space: pre-wrap;
          }

          .footer .credits a {
            color: #000;
          }

          .icon {
            height: 18px;
            margin-left: 10px;
          }

          .zeit {
            margin-top: 2px;
            margin-left: 2px;
            height: 1em;
          }

          @media (max-width: 768px) {
            .footer .wrapper {
              flex-direction: column;
              align-items: center;
            }

            .footer .github-link {
              margin-bottom: 30px;
            }
          }

          /* Highlight.js theme */
          .hljs {
            display: block;
            overflow-x: auto;
            color: #333;
            background: #fff;
            padding: 20px;
            border: 1px solid #eaeaea;
            border-radius: 5px;
            margin: 20px 0;
          }

          .hljs-comment,
          .hljs-quote {
            color: #777;
            font-style: italic;
          }

          .hljs-keyword,
          .hljs-selector-tag,
          .hljs-subst {
            color: #333;
            font-weight: bold;
          }

          .hljs-number,
          .hljs-literal {
            color: #777;
          }

          .hljs-string,
          .hljs-doctag,
          .hljs-formula {
            color: #333;
            background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAJ0lEQVQIW2O8e/fufwYGBgZBQUEQxcCIIfDu3Tuwivfv30NUoAsAALHpFMMLqZlPAAAAAElFTkSuQmCC) repeat;
          }

          .hljs-title,
          .hljs-section,
          .hljs-selector-id {
            color: #000;
            font-weight: bold;
          }

          .hljs-subst {
            font-weight: normal;
          }

          .hljs-class .hljs-title,
          .hljs-type,
          .hljs-name {
            color: #333;
            font-weight: bold;
          }

          .hljs-tag {
            color: #333;
          }

          .hljs-regexp {
              color: #333;
              background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAICAYAAADA+m62AAAAPUlEQVQYV2NkQAN37979r6yszIgujiIAU4RNMVwhuiQ6H6wQl3XI4oy4FMHcCJPHcDS6J2A2EqUQpJhohQDexSef15DBCwAAAABJRU5ErkJggg==) repeat;
          }

          .hljs-symbol,
          .hljs-bullet,
          .hljs-link {
            color: #000;
            background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAKElEQVQIW2NkQAO7d+/+z4gsBhJwdXVlhAvCBECKwIIwAbhKZBUwBQA6hBpm5efZsgAAAABJRU5ErkJggg==) repeat;
          }

          .hljs-built_in,
          .hljs-builtin-name {
            color: #000;
            text-decoration: underline;
          }

          .hljs-meta {
            color: #999;
            font-weight: bold;
          }

          .hljs-deletion {
            color: #fff;
            background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAADCAYAAABS3WWCAAAAE0lEQVQIW2MMDQ39zzhz5kwIAQAyxweWgUHd1AAAAABJRU5ErkJggg==) repeat;
          }

          .hljs-addition {
            color: #000;
            background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAALUlEQVQYV2N89+7dfwYk8P79ewZBQUFkIQZGOiu6e/cuiptQHAPl0NtNxAQBAM97Oejj3Dg7AAAAAElFTkSuQmCC) repeat;
          }

          .hljs-emphasis {
            font-style: italic;
          }

          .hljs-strong {
            font-weight: bold;
          }

        `}</style>
      </div>
    )
  }
}

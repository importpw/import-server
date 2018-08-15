import Head from 'next/head';
import Markdown from 'react-markdown';

export default class extends React.Component {
  static async getInitialProps({ req, query }) {
    return { query };
  }

  render() {
    return (
      <div id="root">
        <Head>
          <title>San Francisco Font</title>
          <link href="https://sf.n8.io/?weight=normal,bold&style=normal,italic" rel="stylesheet" />
          <link href="https://styles.import.pw" rel="stylesheet" />
        </Head>

        <Markdown source={this.props.query.contents} />

        <style jsx>{`
        `}</style>

        <style global jsx>{`
        `}</style>
      </div>
    )
  }
}

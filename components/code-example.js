import { encode } from 'querystring';
import fetch from 'isomorphic-fetch';

export default class extends React.Component {
  constructor(...args) {
    super(...args);
    this.runExample = this.runExample.bind(this);
  }

  async runExample(e) {
    e.preventDefault();
    const { code } = this.props;

    const bootstrap = 'f="$(mktemp)" && cat > "$f" && chmod +x "$f" && IMPORT_CACHE="$(mktemp -d)" IMPORT_DEBUG=1 "$f" 2>&1';
    const res = await fetch('https://nexec.n8.io/sh?arg=-c&arg=' + encodeURIComponent(bootstrap), {
      method: 'POST',
      body: code,
    });
    const body = await res.text();
    console.log(body);
  }

  render() {
    return (
      <div className="code-example">
        <a className="run" onClick={this.runExample} href="#">Run this code</a>
        { this.props.children }
        <style jsx>{`
          .code-example {
            position: relative;
          }

          .run {
            position: absolute;
            top: 0;
            right: 0;
            color: red;
            padding: 6px;
            font-size: 0.75em;
            border-left: 1px solid #eaeaea;
            border-bottom: 1px solid #eaeaea;
          }
        `}</style>
      </div>
    );
  }
}

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

    const nexec = 'nexec-acxrmewivr.n8.io';
    const bootstrap = 'dir="$(mktemp -d)"; trap "rm -rf $dir" EXIT TERM INT; cat > "$dir/script" && chmod +x "$dir/script" && IMPORT_CACHE="$dir" "$dir/script" 2>&1';
    const res = await fetch(`https://${nexec}/sh?arg=-c&arg=` + encodeURIComponent(bootstrap), {
      method: 'POST',
      body: code,
    });
    const body = await res.text();
    console.log(body);
  }

  render() {
    return (
      <div className="code-example">
        <a className="run" onClick={ this.runExample } href="#">
          Run this code
        </a>
        { this.props.children }
        <style jsx>{`
          .code-example {
            position: relative;
          }

          .run {
            position: absolute;
            top: 0;
            right: 0;
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

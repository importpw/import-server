import { encode } from 'querystring';
import fetch from 'isomorphic-fetch';

export default class extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      running: false,
      result: null
    };
  }

  async componentDidMount() {
    this.setState({ running: true });

    const { code } = this.props;

    const nexec = 'nexec-acxrmewivr.n8.io';
    const bootstrap = 'dir="$(mktemp -d)"; trap "rm -rf $dir" EXIT TERM INT; cat > "$dir/script" && chmod +x "$dir/script" && IMPORT_CACHE="$dir" "$dir/script" 2>&1';
    const res = await fetch(`https://${nexec}/sh?arg=-c&arg=${encodeURIComponent(bootstrap)}`, {
      method: 'POST',
      body: code,
    });
    const body = await res.text();
    this.setState({ running: false, result: body });
  }

  render() {
    return (
      <pre><code>
        { this.state.result }
      </code>
      <style jsx>{`
        pre {
          background-color: rgba(255, 255, 255, 0.8);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 2em;
        }
      `}</style>
      </pre>
    );
  }
}

import CodeExec from './code-exec';

export default class extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      showing: false
    };
    this.runExample = this.runExample.bind(this);
  }

  runExample(e) {
    e.preventDefault();
    this.setState({ showing: true });
  }

  render() {
    let overlay;
    if (this.state.showing) {
      overlay = <CodeExec code={this.props.code} />;
    }
    return (
      <div className="code-example">
        <a className="run" onClick={ this.runExample } href="#">
          Run this code
        </a>
        { this.props.children }
        { overlay }

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

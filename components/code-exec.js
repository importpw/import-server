import { encode } from 'querystring';
import fetch from 'isomorphic-fetch';
import Xterm from './xterm';

export default class extends React.Component {
	constructor(...args) {
		super(...args);
	}

	async componentDidMount() {
		const { code } = this.props;
		const { term } = this.refs.xterm;
		term.write('$ Running...\r\n');

		const res = await fetch('/api/exec', {
			method: 'POST',
			body: code
		});
		const body = await res.text();
		term.write(body.replace(/\n/g, '\r\n'));

		const exitCode = parseInt(res.headers.get('x-exit-code'), 10);
		if (exitCode !== 0) {
			term.write(`Script failed with exit code ${exitCode}\r\n`);
		}
	}

	render() {
		return (
			<div className="wrapper">
				<Xterm ref="xterm" lineHeight={1.2} />
				<style jsx>{`
					.wrapper {
						background-color: black;
						padding: 10px;
					}
				`}</style>
			</div>
		);
	}
}

import React from 'react';
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
		term.write('\u001b[32m\u001b[1m$\u001b[22m\u001b[39m \u001b[3mRunning...\u001b[23m\r\n');

		const res = await fetch('/api/exec', {
			method: 'POST',
			body: code
		});
		const body = await res.text();
		term.write(body.replace(/\n/g, '\r\n'));

		const exitCode = parseInt(res.headers.get('x-exit-code'), 10);
		if (exitCode !== 0) {
			term.write(`\u001b[31mScript failed with exit code \u001b[1m${exitCode}\u001b[22m\u001b[39m\r\n`);
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

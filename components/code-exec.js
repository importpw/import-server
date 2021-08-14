import { useEffect, useState } from 'react';
import { encode } from 'querystring';
import fetch from 'isomorphic-fetch';
import Ansi from './ansi';

export default function CodeExec({ code }) {
	const [data, setData] = useState('');
	const write = (d) => setData((current) => current + d);

	useEffect(() => {
		(async () => {
			write(
				'\u001b[32m\u001b[1m$\u001b[22m\u001b[39m \u001b[3mRunning...\u001b[23m\r\n'
			);

			const res = await fetch('/api/exec', {
				method: 'POST',
				body: code,
			});
			const body = await res.text();
			write(body.replace(/\n/g, '\r\n'));

			const exitCode = parseInt(res.headers.get('x-exit-code'), 10);
			if (exitCode !== 0) {
				write(
					`\u001b[31mScript failed with exit code \u001b[1m${exitCode}\u001b[22m\u001b[39m\r\n`
				);
			}
		})();
	}, [code]);

	return (
		<div className="wrapper">
			<pre>
				<code>
					<Ansi>{data}</Ansi>
				</code>
			</pre>
			<style jsx>{`
				.wrapper {
					color: white;
					background-color: black;
					padding: 10px;
					width: 100%;
					height: 100%;
				}
			`}</style>
		</div>
	);
}

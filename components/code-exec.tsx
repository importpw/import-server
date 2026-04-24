'use client';

import { useEffect, useRef, useState } from 'react';
import Ansi from './ansi';

export default function CodeExec({ code }: { code: string }) {
	const [data, setData] = useState('');

	// React 19 + Strict Mode runs effects twice on mount (once for real,
	// once for the "development-only simulated unmount/remount" pair).
	// A plain `let cancelled = false` + cleanup doesn't help us here
	// because the initial synchronous `write("$ Running...")` has already
	// landed in state by the time the cleanup runs — so the remounted
	// effect ends up writing a *second* "Running..." above its own fetch.
	//
	// Guard with a ref flag that survives the StrictMode pair so the
	// fetch is kicked off exactly once. We intentionally do NOT cancel
	// the request on cleanup: the fetch is short-lived and the only
	// downside of setting state on an unmounted tree is a dev warning,
	// which is preferable to ending up with no output in the popup.
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;

		const write = (d: string) =>
			setData((current) => current + d);

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

			const exitCode = parseInt(
				res.headers.get('x-exit-code') ?? '0',
				10
			);
			if (exitCode !== 0) {
				write(
					`\u001b[31mScript failed with exit code \u001b[1m${exitCode}\u001b[22m\u001b[39m\r\n`
				);
			}
		})();
	}, [code]);

	return (
		<div className="h-full w-full bg-black p-2.5 text-white">
			<pre>
				<code>
					<Ansi>{data}</Ansi>
				</code>
			</pre>
		</div>
	);
}

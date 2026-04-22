'use client';

import { useState, type ReactNode } from 'react';
import NewWindow from 'react-new-window';
import CodeExec from './code-exec';

interface CodeExampleProps {
	code: string;
	children: ReactNode;
}

export default function CodeExample({ code, children }: CodeExampleProps) {
	const [showing, setShowing] = useState(false);

	return (
		<div className="relative">
			{children}
			<a
				className="absolute top-0 right-0 border-b border-l border-[#eaeaea] p-1.5 text-xs"
				onClick={(e) => {
					e.preventDefault();
					setShowing(true);
				}}
				href="#"
			>
				Run this code
			</a>
			{showing && (
				<NewWindow
					center="parent"
					copyStyles={true}
					features={{ width: 600, height: 384 }}
					name="code-example"
					onUnload={() => setShowing(false)}
					title="Code Example"
				>
					<CodeExec code={code} />
				</NewWindow>
			)}
		</div>
	);
}

'use client';

import { useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import NewWindow from 'react-new-window';

import { Button } from '@/components/ui/button';
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
			<Button
				variant="ghost"
				size="xs"
				className="absolute top-2 right-2 z-10"
				onClick={() => setShowing(true)}
			>
				<Play />
				Run this code
			</Button>
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

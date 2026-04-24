'use client';

import { useEffect, useState } from 'react';
import { ObjectInspector } from 'react-inspector';
import { useTheme } from 'next-themes';

import {
	inspectorThemeDark,
	inspectorThemeLight,
} from './inspector-theme';

export default function ObjectInspectorClient({ data }: { data: unknown }) {
	// react-inspector supports a full theme object (not just the two
	// built-in `chromeLight` / `chromeDark` names). We pass our own so
	// the inspector reads the shadcn CSS vars and sits transparently on
	// the page background in both light and dark mode. See
	// components/inspector-theme.ts for the color choices, which follow
	// Node's util.inspect() ANSI palette.
	const { resolvedTheme } = useTheme();

	// `useTheme()` returns `undefined` during SSR and the initial
	// client render (the real value only resolves after <ThemeProvider>
	// mounts and reads localStorage / prefers-color-scheme). If we pick
	// a concrete theme before that, the server markup is locked in with
	// light-mode colors and then React's hydration pass complains when
	// the client picks dark. Gate rendering on a one-shot `mounted`
	// flag so the first render (both server and client) produces an
	// empty container, and the real tree only paints after hydration.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	const theme =
		resolvedTheme === 'dark' ? inspectorThemeDark : inspectorThemeLight;

	return (
		<ObjectInspector
			expandLevel={2}
			sortObjectKeys={true}
			data={data}
			// @ts-expect-error react-inspector's types declare `theme` as
			// `string | undefined`, but at runtime its `themeAcceptor`
			// happily accepts a full theme object — see the README:
			// https://github.com/storybookjs/react-inspector#theme
			theme={theme}
		/>
	);
}

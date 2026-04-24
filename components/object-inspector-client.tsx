'use client';

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

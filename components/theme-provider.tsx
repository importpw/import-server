'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

/**
 * Thin client wrapper around `next-themes`. The RSC layout can't `<ThemeProvider>`
 * directly because it hooks into the client, so we re-export it from here
 * with `'use client'` at the top of the module.
 */
export default function ThemeProvider({
	children,
	...props
}: ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

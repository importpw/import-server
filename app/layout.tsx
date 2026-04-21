import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';

import './globals.css';

export const metadata: Metadata = {
	title: 'import',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	);
}

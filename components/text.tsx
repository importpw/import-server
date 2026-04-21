import emoji from 'emoji-dictionary';

// Credit: https://git.io/fAoOS
export default function Text({ children }: { children: string }) {
	if (typeof children !== 'string') return <>{children}</>;
	return (
		<>
			{children.replace(
				/:\w+:/gi,
				(name) => emoji.getUnicode(name) || name
			)}
		</>
	);
}

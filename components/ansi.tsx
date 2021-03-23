import parseAnsi, { AnsiStyle } from 'parse-ansi';

import styles from '../styles/ansi.module.css';

interface AnsiProps {
	children: string;
}

function mapClassNames(style: AnsiStyle) {
	const classes: string[] = [];
	let fg: string | undefined;
	let bg: string | undefined;

	if (style.bold) {
		classes.push(styles.bold);
	}

	if (style.italic) {
		classes.push(styles.italic);
	}

	if (style.strikethrough) {
		classes.push(styles.strikethrough);
	}

	if (style.underline) {
		classes.push(styles.underline);
	}

	if (style.foregroundColor) {
		fg = style.foregroundColor;
	}

	if (style.backgroundColor) {
		bg = style.backgroundColor;

		// background color contains "bg" prefix, e.g. "bgRed"
		if (/^bg[A-Z]/.test(bg)) {
			bg = bg.substring(2).toLowerCase();
		}
	}

	if (style.inverse) {
		if (fg) classes.push(styles[`bg-${fg}`]);
		if (bg) classes.push(styles[`fg-${bg}`]);
	} else {
		if (fg) classes.push(styles[`fg-${fg}`]);
		if (bg) classes.push(styles[`bg-${bg}`]);
	}

	return classes.join(' ') || undefined;
}

export default function Ansi({ children }: AnsiProps) {
	const parsed = parseAnsi(children);
	const chunks = parsed.chunks
		.filter((c) => ['text', 'newline'].includes(c.type))
		.map((chunk, i) => {
			if (chunk.type === 'newline') {
				return '\n';
			}
			return (
				<span className={mapClassNames(chunk.style)} key={i}>
					{chunk.value}
				</span>
			);
		});
	return <>{chunks}</>;
}

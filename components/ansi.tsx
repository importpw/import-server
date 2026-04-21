import Anser from 'anser';
import styles from './ansi.module.css';

interface AnsiProps {
	children: string;
}

interface AnserPart {
	content: string;
	fg: string | null;
	bg: string | null;
	decoration: string | null;
	decorations?: string[];
}

/**
 * Map anser's RGB-triplet colors to our CSS module class names. Anser returns
 * `fg`/`bg` as `"R, G, B"`; the 8 standard colors map to named classes in
 * `ansi.module.css`.
 */
const RGB_TO_NAME: Record<string, string> = {
	'0, 0, 0': 'black',
	'187, 0, 0': 'red',
	'0, 187, 0': 'green',
	'187, 187, 0': 'yellow',
	'0, 0, 187': 'blue',
	'187, 0, 187': 'magenta',
	'0, 187, 187': 'cyan',
	'255, 255, 255': 'white',
	'85, 85, 85': 'gray',
	'255, 85, 85': 'red',
	'85, 255, 85': 'green',
	'255, 255, 85': 'yellow',
	'85, 85, 255': 'blue',
	'255, 85, 255': 'magenta',
	'85, 255, 255': 'cyan',
};

function classesFor(part: AnserPart): string | undefined {
	const classes: string[] = [];

	const decorations = part.decorations ?? (part.decoration ? [part.decoration] : []);
	const has = (d: string) => decorations.includes(d);

	if (has('bold')) classes.push(styles.bold);
	if (has('italic')) classes.push(styles.italic);
	if (has('underline')) classes.push(styles.underline);
	if (has('strikethrough')) classes.push(styles.strikethrough);

	const inverse = has('reverse');
	let fgName = part.fg ? RGB_TO_NAME[part.fg] : undefined;
	let bgName = part.bg ? RGB_TO_NAME[part.bg] : undefined;
	if (inverse) {
		[fgName, bgName] = [bgName, fgName];
	}
	if (fgName) classes.push(styles[`fg-${fgName}`]);
	if (bgName) classes.push(styles[`bg-${bgName}`]);

	return classes.join(' ') || undefined;
}

export default function Ansi({ children }: AnsiProps) {
	const parts = Anser.ansiToJson(children, {
		use_classes: false,
	}) as AnserPart[];
	return (
		<>
			{parts.map((part, i) => {
				if (!part.content) return null;
				return (
					<span key={i} className={classesFor(part)}>
						{part.content}
					</span>
				);
			})}
		</>
	);
}

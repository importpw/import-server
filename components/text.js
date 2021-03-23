import emoji from 'emoji-dictionary';

// Credit: https://git.io/fAoOS
export default function Text(text) {
	return text.replace(/:\w+:/gi, (name) => emoji.getUnicode(name) || name);
}

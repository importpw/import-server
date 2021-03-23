import emoji from 'emoji-dictionary';

// Credit: https://git.io/fAoOS
export default (text) =>
	text.replace(/:\w+:/gi, (name) => emoji.getUnicode(name) || name);

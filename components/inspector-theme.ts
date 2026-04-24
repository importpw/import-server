/**
 * Shared theme configuration for react-inspector's ObjectInspector.
 *
 * Color choices are inspired by Node.js `util.inspect()` ANSI stylizing:
 *   - property names: unstyled (foreground, like Node's default)
 *   - strings / symbols: green
 *   - numbers / booleans / bigint: yellow
 *   - null: bold foreground (Node: 'bold')
 *   - undefined: muted (Node: 'grey')
 *   - regexp: red
 *   - functions: cyan (Node: 'special')
 *
 * Adapted from the Vercel Workflow SDK's inspector-theme.ts, retuned to
 * use the shadcn design tokens this project exposes.
 *
 * See: https://github.com/nodejs/node/blob/main/lib/internal/util/inspect.js
 */

// ---------------------------------------------------------------------------
// Structural values shared between light and dark themes
// ---------------------------------------------------------------------------

const shared = {
	BASE_FONT_SIZE: '12px',
	BASE_LINE_HEIGHT: 1.4,
	BASE_BACKGROUND_COLOR: 'transparent',
	OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES: 10,
	OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES: 5,
	HTML_TAGNAME_TEXT_TRANSFORM: 'lowercase' as const,
	ARROW_MARGIN_RIGHT: 3,
	ARROW_FONT_SIZE: 12,
	TREENODE_FONT_FAMILY: 'var(--font-mono)',
	TREENODE_FONT_SIZE: '12px',
	TREENODE_LINE_HEIGHT: 1.4,
	TREENODE_PADDING_LEFT: 12,
	TABLE_DATA_BACKGROUND_IMAGE: 'none',
	TABLE_DATA_BACKGROUND_SIZE: '0',
};

// ---------------------------------------------------------------------------
// Light
// ---------------------------------------------------------------------------

export const inspectorThemeLight = {
	...shared,

	BASE_COLOR: 'var(--color-foreground)',

	// Property names — unstyled (Node: no style)
	OBJECT_NAME_COLOR: 'var(--color-foreground)',

	// Strings & symbols — green (Node: 'green')
	OBJECT_VALUE_STRING_COLOR: '#16a34a', // green-600
	OBJECT_VALUE_SYMBOL_COLOR: '#16a34a',

	// Numbers & booleans — amber (Node: 'yellow', but amber reads
	// better than pure yellow on a white background)
	OBJECT_VALUE_NUMBER_COLOR: '#b45309', // amber-700
	OBJECT_VALUE_BOOLEAN_COLOR: '#b45309',

	// null — bold foreground (Node: 'bold')
	OBJECT_VALUE_NULL_COLOR: 'var(--color-foreground)',

	// undefined — muted (Node: 'grey')
	OBJECT_VALUE_UNDEFINED_COLOR: 'var(--color-muted-foreground)',

	// RegExp — red
	OBJECT_VALUE_REGEXP_COLOR: '#dc2626', // red-600

	// Functions — cyan (Node: 'special')
	OBJECT_VALUE_FUNCTION_PREFIX_COLOR: '#0891b2', // cyan-600

	// HTML (less relevant for data inspection but reasonable defaults)
	HTML_TAG_COLOR: 'var(--color-muted-foreground)',
	HTML_TAGNAME_COLOR: '#0891b2',
	HTML_ATTRIBUTE_NAME_COLOR: '#b45309',
	HTML_ATTRIBUTE_VALUE_COLOR: '#16a34a',
	HTML_COMMENT_COLOR: 'var(--color-muted-foreground)',
	HTML_DOCTYPE_COLOR: 'var(--color-muted-foreground)',

	// Structural
	ARROW_COLOR: 'var(--color-muted-foreground)',
	TABLE_BORDER_COLOR: 'var(--color-border)',
	TABLE_TH_BACKGROUND_COLOR: 'var(--color-muted)',
	TABLE_TH_HOVER_COLOR: 'var(--color-accent)',
	TABLE_SORT_ICON_COLOR: 'var(--color-muted-foreground)',
};

// ---------------------------------------------------------------------------
// Dark
// ---------------------------------------------------------------------------

export const inspectorThemeDark = {
	...shared,

	BASE_COLOR: 'var(--color-foreground)',

	OBJECT_NAME_COLOR: 'var(--color-foreground)',

	OBJECT_VALUE_STRING_COLOR: '#4ade80', // green-400
	OBJECT_VALUE_SYMBOL_COLOR: '#4ade80',

	OBJECT_VALUE_NUMBER_COLOR: '#facc15', // yellow-400
	OBJECT_VALUE_BOOLEAN_COLOR: '#facc15',

	OBJECT_VALUE_NULL_COLOR: 'var(--color-foreground)',

	OBJECT_VALUE_UNDEFINED_COLOR: 'var(--color-muted-foreground)',

	OBJECT_VALUE_REGEXP_COLOR: '#f87171', // red-400

	OBJECT_VALUE_FUNCTION_PREFIX_COLOR: '#22d3ee', // cyan-400

	HTML_TAG_COLOR: 'var(--color-muted-foreground)',
	HTML_TAGNAME_COLOR: '#22d3ee',
	HTML_ATTRIBUTE_NAME_COLOR: '#facc15',
	HTML_ATTRIBUTE_VALUE_COLOR: '#4ade80',
	HTML_COMMENT_COLOR: 'var(--color-muted-foreground)',
	HTML_DOCTYPE_COLOR: 'var(--color-muted-foreground)',

	ARROW_COLOR: 'var(--color-muted-foreground)',
	TABLE_BORDER_COLOR: 'var(--color-border)',
	TABLE_TH_BACKGROUND_COLOR: 'var(--color-muted)',
	TABLE_TH_HOVER_COLOR: 'var(--color-accent)',
	TABLE_SORT_ICON_COLOR: 'var(--color-muted-foreground)',
};

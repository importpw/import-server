declare module 'parse-ansi' {
  export interface AnsiStyle {
    backgroundColor?: string;
    foregroundColor?: string;
    dim?: boolean;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    inverse?: boolean;
  }

  export interface AnsiText {
    type: 'text';
    value: string;
    style: AnsiStyle;
  }

  export interface AnsiText {
    type: 'newline';
  }

  export type AnsiChunk = AnsiText | AnsiNewline;

  export interface AnsiParsed {
    chunks: AnsiChunk[];
  }

  export default function parseAnsi(text: string): AnsiParsed;
}

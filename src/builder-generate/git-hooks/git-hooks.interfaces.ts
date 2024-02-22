export interface PrettierConfig {
  version?: string;
  arrowParens?: 'always' | 'avoid';
  bracketSameLine?: boolean;
  bracketSpacing?: boolean;
  cursorOffset?: number;
  editorconfig?: boolean;
  embeddedLanguageFormatting?: 'auto' | 'off';
  endOfLine?: 'lf' | 'crlf' | 'cr' | 'auto';
  filepath?: string;
  htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore';
  insertPragma?: boolean;
  jsxSingleQuote?: boolean;
  parser?:
    | 'flow'
    | 'babel'
    | 'babel-flow'
    | 'babel-ts'
    | 'typescript'
    | 'acorn'
    | 'espree'
    | 'meriyah'
    | 'css'
    | 'less'
    | 'scss'
    | 'json'
    | 'json5'
    | 'json-stringify'
    | 'graphql'
    | 'markdown'
    | 'mdx'
    | 'vue'
    | 'yaml'
    | 'glimmer'
    | 'html'
    | 'angular'
    | 'lwc'
    | string;
  pluginSearchDirs?: string[] | false;
  plugins?: string[];
  printWidth?: number;
  proseWrap?: 'always' | 'never' | 'preserve';
  quoteProps?: 'as-needed' | 'consistent' | 'preserve';
  rangeEnd?: number | null;
  rangeStart?: number;
  requirePragma?: boolean;
  semi?: boolean;
  singleAttributePerLine?: boolean;
  singleQuote?: boolean;
  tabWidth?: number;
  trailingComma?: 'es5' | 'none' | 'all';
  useTabs?: boolean;
  vueIndentScriptAndStyle?: boolean;
  overrides?: Override[];
}

interface Override {
  files: string | string[];
  excludeFiles?: string | string[];
  options?: PrettierConfig;
}

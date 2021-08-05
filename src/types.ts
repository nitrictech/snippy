export type SNIPPY_DEFAULT_LANGUAGES =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'go'
  | 'php'
  | 'csharp';

export interface RepoSearchObject {
  url: string;
  ext: string;
}

export interface SnippyConfig {
  repos: RepoSearchObject[];
  extLangMap?: { [key: string]: string };
  auth?: string;
}

export interface SnippySnippet {
  name: string;
  lang: SNIPPY_DEFAULT_LANGUAGES | string;
  content: string;
  lineNumbers: number[];
}

export interface SnippyResponse {
  [key: string]: SnippySnippet;
}

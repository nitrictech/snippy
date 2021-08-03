import { Octokit } from 'octokit';

export type SNIPPY_DEFAULT_LANGUAGES =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'go'
  | 'php'
  | 'csharp';

export type GitHubRepo = [string, string];

export interface SnippyConfig {
  repos: [string, string][];
  extLangMap?: { [key: string]: string };
  gitHubAuthToken?: string;
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

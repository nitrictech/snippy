import { Octokit } from 'octokit';
import fetch from 'isomorphic-unfetch';
import {
  SnippyConfig,
  SnippyResponse,
  SnippySnippet,
  SNIPPY_DEFAULT_LANGUAGES,
} from './types';
import { minIndent, rawContentUrl } from './utils';
import { END_TAG_REGEX, START_TAG_REGEX } from './constants';

const LANG_MAP_DEFAULTS: { [key: string]: SNIPPY_DEFAULT_LANGUAGES } = {
  ts: 'typescript',
  py: 'python',
  java: 'java',
  go: 'go',
  php: 'php',
  cs: 'csharp',
};

export class Snippy {
  private readonly octokit: Octokit;
  private readonly config: SnippyConfig;

  constructor(config: SnippyConfig) {
    this.octokit = new Octokit({ auth: config.auth });

    this.config = {
      ...config,
      extLangMap: {
        ...LANG_MAP_DEFAULTS,
        ...config.extLangMap,
      },
    };
  }

  static processSnippet(fileContents: string, fileName: string) {
    const lines = fileContents.split('\n');

    const contentArr: string[] = [];
    const lineNumbers: number[] = [];
    let recordLine = false;
    let isImportStatement = false;
    let previousIndent = 0;

    lines.forEach((line, index) => {
      const matchStart = START_TAG_REGEX.test(line);
      const matchEnd = END_TAG_REGEX.test(line);

      if (matchEnd) {
        recordLine = false;
        if (line.includes('import')) {
          contentArr.push('');
          isImportStatement = false;
        } else {
          lineNumbers.push(index);
        }
      }

      // records and strips indents from snippet lines (if required)
      if (recordLine) {
        const indent = minIndent(line);
        const isEmpty = !line.trim();

        if (indent === 0 || isEmpty) {
          contentArr.push(line);
          if (!isEmpty) previousIndent = indent;
        } else {
          let indentsToRemove = indent;

          if (previousIndent > 0 && indent > previousIndent) {
            indentsToRemove = previousIndent;
          } else {
            previousIndent = indent;
          }

          const regex = new RegExp(`^[ \\t]{${indentsToRemove}}`, 'gm');

          contentArr.push(line.replace(regex, ''));

          if (isImportStatement) {
            previousIndent = 0;
          }
        }
      }

      if (matchStart) {
        recordLine = true;
        if (!line.includes('import')) {
          lineNumbers.push(index + 2);
        } else {
          isImportStatement = true;
        }
      }
    });

    const snippet = {
      name: fileName,
      lang: LANG_MAP_DEFAULTS[fileName.split('.').pop()],
      content: contentArr.join('\n'),
      lineNumbers,
    };

    return snippet;
  }

  async parse(): Promise<SnippyResponse> {
    const MANIFEST = {};
    const { repos } = this.config;

    try {
      await Promise.all(
        repos.map(async ({ url, ext }) => {
          const {
            data: { items: files },
          } = await this.octokit.rest.search.code({
            q: `[START snippet] in:file repo:${url} extension:${ext}`,
          });

          return await Promise.all(
            files.map((file) =>
              fetch(rawContentUrl(file.html_url)).then(async (res) => {
                const snippet: Partial<SnippySnippet> = Snippy.processSnippet(
                  await res.text(),
                  file.name
                );

                const { lineNumbers } = snippet;

                // create link to snippet
                snippet.url =
                  file.html_url +
                  `#L${snippet.lineNumbers[0]}-L${lineNumbers[1]}`;

                MANIFEST[file.name] = snippet;
              })
            )
          );
        })
      );

      return MANIFEST;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

let snippySingleton: Snippy;

export const snippy = (config: SnippyConfig) => {
  if (!snippySingleton) {
    snippySingleton = new Snippy(config);
  }

  return snippySingleton;
};

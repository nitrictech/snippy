import { Octokit } from 'octokit';
import fetch from 'isomorphic-unfetch';
import { SnippyConfig, SnippySnippet, SNIPPY_DEFAULT_LANGUAGES } from './types';
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

class Snippy {
  private readonly octokit: Octokit;
  private readonly config: SnippyConfig;

  constructor(config: SnippyConfig) {
    this.octokit = new Octokit({ auth: config.gitHubAuthToken });

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
    let previousIndent = 0;

    lines.forEach((line, index) => {
      const matchStart = START_TAG_REGEX.test(line);
      const matchEnd = END_TAG_REGEX.test(line);

      if (matchEnd) {
        recordLine = false;
        if (line.includes('import')) {
          contentArr.push('');
        } else {
          lineNumbers.push(index);
        }
      }

      // records and strips indents from snippet lines (if required)
      if (recordLine) {
        const indent = minIndent(line);

        if (indent === 0) {
          contentArr.push(line);
          previousIndent = indent;
        } else {
          const regex = new RegExp(
            `^[ \\t]{${
              previousIndent === 0 ? indent : previousIndent - indent
            }}`,
            'gm'
          );

          previousIndent = indent;

          contentArr.push(line.replace(regex, ''));
        }
      }

      if (matchStart) {
        recordLine = true;
        if (!line.includes('import')) {
          lineNumbers.push(index + 2);
        }
      }
    });

    const snippet: SnippySnippet = {
      name: fileName,
      lang: LANG_MAP_DEFAULTS[fileName.split('.').pop()],
      content: contentArr.join('\n'),
      lineNumbers,
    };

    return snippet;
  }

  async parse() {
    const MANIFEST = {};
    const { repos } = this.config;

    await Promise.all(
      repos.map(async ([repo, ext]) => {
        const {
          data: { items: files },
        } = await this.octokit.rest.search.code({
          q: `[START snippet] in:file repo:${repo} extension:${ext}`,
        });

        return await Promise.all(
          files.map((file) =>
            fetch(rawContentUrl(file.html_url)).then(
              async (res) =>
                (MANIFEST[file.name] = Snippy.processSnippet(
                  await res.text(),
                  file.name
                ))
            )
          )
        );
      })
    );

    return MANIFEST;
  }
}

let snippySingleton: Snippy;

export const snippy = (config: SnippyConfig) => {
  if (!snippySingleton) {
    snippySingleton = new Snippy(config);
  }

  return snippySingleton;
};

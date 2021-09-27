// Copyright 2021, Nitric Technologies Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Octokit } from 'octokit';
import { throttling } from '@octokit/plugin-throttling';
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

const SnippyOctokit = Octokit.plugin(throttling);
export class Snippy {
  private readonly octokit: Octokit;
  private readonly config: SnippyConfig;

  constructor(config: SnippyConfig) {
    this.octokit = new SnippyOctokit({
      auth: config.auth,
      throttle: {
        onRateLimit: (retryAfter, options, octokit: Octokit) => {
          octokit.log.warn(
            `Request quota exhausted for request ${options.method} ${options.url}`
          );

          if (options.request.retryCount === 0) {
            // only retries once
            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onAbuseLimit: (retryAfter, options, octokit: Octokit) => {
          // does not retry, only logs a warning
          octokit.log.warn(
            `Abuse detected for request ${options.method} ${options.url}`
          );
        },
      },
    });

    this.config = {
      ...config,
      extLangMap: {
        ...LANG_MAP_DEFAULTS,
        ...config.extLangMap,
      },
    };
  }

  static processSnippet(fileContents: string, fileName: string) {
    const lines = fileContents.trim().split('\n');

    const contentArr: string[] = [];
    const lineNumbers: number[] = [];
    const endOflineIndex = lines.length - 1;
    let recordLine = false;
    let isImportStatement = false;
    let previousIndent = 0;
    let snippetEnded = false;

    lines.forEach((line, index) => {
      const matchStart = START_TAG_REGEX.test(line);
      const matchEnd = END_TAG_REGEX.test(line);

      const lastLine = endOflineIndex === index;

      if (matchEnd) {
        recordLine = false;
        if (line.includes('import')) {
          contentArr.push('');
          isImportStatement = false;
        } else {
          lineNumbers.push(index);
          snippetEnded = true;
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

      // must happen after recorded line
      if (lastLine && !snippetEnded) {
        lineNumbers.push(index);
        console.warn(`[END snippet] tag not found for file: "${fileName}"`);
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
        repos.map(async ({ url, exts }) => {
          const extensionParams = exts
            .map((ext) => `extension:${ext}`)
            .join(' ');

          const {
            data: { items: files },
          } = await this.octokit.rest.search.code({
            q: `[START snippet] in:file repo:${url} ${extensionParams}`,
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

                MANIFEST[`${file.repository.full_name}/${file.path}`] = snippet;
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

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
import { SnippyResponse, SnippySnippet } from './types';

// limitations under the License.
export const minIndent = (str: string) => {
  const match = str.match(/^[ \t]*(?=\S)/gm);

  if (!match) {
    return 0;
  }

  return match.reduce((r, a) => Math.min(r, a.length), Infinity);
};

export const rawContentUrl = (url: string) =>
  url.replace('github.com', 'raw.githubusercontent.com').replace('/blob', '');

export const findByFileName = (
  response: SnippyResponse,
  fileName: string
): SnippySnippet | undefined => {
  return Object.values(response).find((s) => s.name === fileName);
};

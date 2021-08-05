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
import { minIndent, rawContentUrl } from './utils';

describe('Test Utils', () => {
  test('Test that the minIndent method produces correct result', () => {
    expect(minIndent(`      test`)).toEqual(6);
  });

  test('Test that the minIndent method produces correct result', () => {
    expect(
      rawContentUrl(
        'https://github.com/nitrictech/snippet-spike/blob/f678b64f0c4b905ac6b3360f95ce0397d800bfe0/get-document.ts'
      )
    ).toEqual(
      'https://raw.githubusercontent.com/nitrictech/snippet-spike/f678b64f0c4b905ac6b3360f95ce0397d800bfe0/get-document.ts'
    );
  });
});

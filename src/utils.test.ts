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

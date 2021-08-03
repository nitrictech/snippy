export const minIndent = (str: string) => {
  const match = str.match(/^[ \t]*(?=\S)/gm);

  if (!match) {
    return 0;
  }

  return match.reduce((r, a) => Math.min(r, a.length), Infinity);
};

export const rawContentUrl = (url: string) =>
  url.replace('github.com', 'raw.githubusercontent.com').replace('/blob', '');

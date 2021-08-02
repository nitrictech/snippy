import glob from "glob";
import * as path from "path";
import * as fs from "fs/promises";
import minIndent from "min-indent";

const MANIFEST_OUTPUT = "manifest/manifest.json";

// Regex for [START] and [END] snippet tags.
const START_TAG_REGEX = /\[START\s+([A-Za-z_]+)\s*\]/;
const END_TAG_REGEX = /\[END\s+([A-Za-z_]+)\s*\]/;

type LANGUAGES = "typescript" | "python" | "java" | "go" | "php" | "csharp";

const MD_LANG_MAP: { [key: string]: LANGUAGES } = {
  ".ts": "typescript",
  ".py": "python",
  ".java": "java",
  ".go": "go",
  ".php": "php",
  ".cs": "csharp",
};

interface Snippet {
  name: string;
  lang: string;
  content: string;
  lineNumbers: number[];
}

interface Manifest {
  [key: string]: Snippet;
}

const MANIFEST: Manifest = {};

const processSnippet = async (filePath: string) => {
  console.log(`Processing: "${filePath}"`);

  const { name, ext } = path.parse(filePath);

  const fileContents = await fs.readFile(filePath, "utf-8");
  const lines = fileContents.split("\n");

  const contentArr: string[] = [];
  const lineNumbers: number[] = [];
  let recordLine = false;
  let previousIndent = 0;

  lines.forEach((line, index) => {
    const matchStart = START_TAG_REGEX.test(line);
    const matchEnd = END_TAG_REGEX.test(line);

    if (matchEnd) {
      recordLine = false;
      if (line.includes("import")) {
        contentArr.push("");
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
          `^[ \\t]{${previousIndent === 0 ? indent : previousIndent - indent}}`,
          "gm"
        );

        previousIndent = indent;

        contentArr.push(line.replace(regex, ""));
      }
    }

    if (matchStart) {
      recordLine = true;
      if (!line.includes("import")) {
        lineNumbers.push(index + 2);
      }
    }
  });

  const snippet: Snippet = {
    name,
    lang: MD_LANG_MAP[ext],
    content: contentArr.join("\n"),
    lineNumbers,
  };

  MANIFEST[name + ext] = snippet;
};

glob(
  `**/snippets/**/*.*(${Object.keys(MD_LANG_MAP)
    .map((l) => l.substring(1))
    .join("|")})`,
  {
    ignore: "**/node_modules/**",
  },
  async (er, files) => {
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // er is an error object or null.
    await Promise.all(files.map(processSnippet));

    // sort to avoid annoying diffing issues
    const sortedManifest = Object.keys(MANIFEST)
      .sort()
      .reduce((obj: any, key) => {
        obj[key] = MANIFEST[key];
        return obj;
      }, {});

    // write manifest to repo
    await fs.writeFile(
      path.relative(process.cwd(), MANIFEST_OUTPUT),
      JSON.stringify(sortedManifest),
      "utf-8"
    );

    console.log("Manifest build!");
  }
);

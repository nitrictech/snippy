# @nitric/snippy

> The Code snippet parser.

The `@nitric/snippy` package was created to find and parse snippets into readable data that can be consumed by any application.

This package was used to create all code snippets used in the [nitric documentation.](https://nitric.io/docs)

## Features

- **Any langauge**. Parses snippets in any programming language.
- **Universal**. Works in all modern browsers and [Node.js](https://nodejs.org/).
- **Typed**. Has entensive TypeScript declarations.

## Usage

### Node 12+

Install with `npm install @nitric/snippy`, or `yarn add @nitric/snippy`

```typescript
import { snippy } from "@nitric/snippy";

const result = await snippy({
  repos: [
    ["nitrictech/node-sdk", "**/*.ts"],
    ["nitrictech/go-sdk", "**/*.go"],
    ["nitrictech/java-sdk", "**/*.java"],
  ],
});
```

### Node 12+

Install with `npm install @nitric/snippy`, or `yarn add @nitric/snippy`

```typescript
const { snippy } = require("@nitric/snippy");

const result = await snippy({
  repos: [
    ["nitrictech/node-sdk", "**/*.ts"],
    ["nitrictech/go-sdk", "**/*.go"],
    ["nitrictech/java-sdk", "**/*.java"],
  ],
});
```

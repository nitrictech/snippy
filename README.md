# @nitric/snippy

![Tests](https://github.com/nitrictech/snippy/actions/workflows/test.yaml/badge.svg?branch=main)
[![codecov](https://codecov.io/gh/nitrictech/snippy/branch/main/graph/badge.svg?token=FFKZJQJQ3L)](https://codecov.io/gh/nitrictech/snippy)
[![Version](https://img.shields.io/npm/v/@nitric/snippy.svg)](https://npmjs.org/package/@nitric/snippy)
[![Downloads/week](https://img.shields.io/npm/dw/@nitric/snippy.svg)](https://npmjs.org/package/@nitric/snippy)

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

#### Get a snippet

```typescript
const { snippy } = require('@nitric/snippy');

const result = await snippy().get(
  'nitrictech/node-sdk/examples/documents/get.ts'
);
```

#### Get a snippet with Auth

```typescript
const { snippy } = require('@nitric/snippy');

const result = await snippy({
  auth: process.env.GITHUB_AUTH_TOKEN,
}).get('nitrictech/node-sdk/examples/documents/get.ts');
```

#### Search

```typescript
const { snippy } = require('@nitric/snippy');

const result = await snippy({
  repos: [
    {
      url: 'nitrictech/node-sdk',
      exts: ['ts', 'js'],
    },
    {
      url: 'nitrictech/go-sdk',
      exts: ['go'],
    },
    {
      url: 'nitrictech/python-sdk',
      exts: ['py'],
    },
  ],
}).search();
```

#### Search with auth

Install with `npm install @nitric/snippy`, or `yarn add @nitric/snippy`

```typescript
import { snippy } from '@nitric/snippy';

const result = await snippy({
  auth: process.env.GITHUB_AUTH_TOKEN,
  repos: [
    {
      url: 'nitrictech/node-sdk',
      exts: ['ts', 'js'],
    },
    {
      url: 'nitrictech/go-sdk',
      exts: ['go'],
    },
    {
      url: 'nitrictech/python-sdk',
      exts: ['py'],
    },
  ],
}).search();
```

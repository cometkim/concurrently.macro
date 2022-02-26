# concurrently.macro

[![npm](https://img.shields.io/npm/v/concurrently.macro)](https://www.npmjs.com/package/concurrently.macro)
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

Transforms your async function to be run concurrently much as possible.

## Features

- [x] Bundles multiple await expressions into a single `Promise.all` expression
- [x] Simple dependency analysis
- [ ] Graph dependency analysis
- [ ] Limit maximum concurrency
- [x] Break with side-effects

## Install

```
yarn add concurrently.macro
```

Make sure you have [`babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros) in your Babel config.

## Usage

```js
import concurrently from 'concurrently.macro';

concurrently(async () => {
  const a = await defer(1);
  const b = await defer(2);
});
```

This becomes:

```js
async () => {
  let { 0: a, 1: b } = await Promise.all([defer(1), defer(2)]); 
};
```

Macros can handle more complex example like [dependencies](__tests__/__fixtures__/dependencies/code.ts) and [destructuring](__tests__/__fixtures__/destructuring/code.ts)!

## LICENSE

MIT

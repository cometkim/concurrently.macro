# concurrently.macro

[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

Transforms your async function to be run concurrently much as possible.

## Features

- [ ] Bundles multiple await expressions into a single `Promise.all` expression
- [x] Simple dependency analysis
- [ ] Graph dependency analysis
- [x] Manually emit side-effects
- [ ] Limit maximum concurrency

## LICENSE

MIT

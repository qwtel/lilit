# Florian's Little Iterator Library

[![Build status][tr-svg]][travis]

An iterator library that is so simple you could have written it yourself.

ECMAScriopt's new (async) generator functions are powerful and almost seem to be designed to build libraries like these.

## What's Included
- [x] [Sync iterator version](./src/iter.ts)
- [x] [Async iterator version](./src/async-iter.ts)
- [ ] [itertools] Feature Parity
- [x] Type Declarations
- [ ] Typedoc
- [x] Basic Tests
- [ ] Advanced Tests
- [x] Usable everywhere
    - [x] [Deno]
    - [x] Node Modules
    - [x] Node Require
    - [x] Browser Imports
- [ ] 1.0 Release

[deno]: https://deno.land
[itertools]: https://docs.python.org/2/library/itertools.html

## How to Use

### Deno

```ts
// index.ts
import * as lilit from 'https://unpkg.com/lilit/ts/index.ts';
```
Run via `deno index.ts`

### Node 11+ Modules

```js
// index.mjs
import * as lilit from 'lilit/mjs';
```

Run via `node --experimental-modules index.mjs`

### Node Require
```js
// index.js
const lilit = require('lilit');
```

Run via `node index.js`

### Browser Imports
```js
// script.js
import * as lilit from 'https://unpkg.com/lilit/mjs/index.mjs';
```

Load via `<script type="module" src="./script.js"></script>`

### Other
To see what else is availabe, [browse the package contents](https://unpkg.com/lilit/).


[tr-svg]: https://travis-ci.org/qwtel/lilit.svg?branch=master
[travis]: https://travis-ci.org/qwtel/lilit
# just-performance

[![CI](https://github.com/jhurliman/just-performance/actions/workflows/ci.yml/badge.svg)](https://github.com/jhurliman/just-performance/actions/workflows/ci.yml)

**One `performance` import for Node.js and browsers.** Write timing code once and use the platform's native performance object in each environment.

`just-performance` is a ponyfill: it exports an object without modifying globals. In Node.js, that object comes from `perf_hooks`; in a browser bundle, it is the browser's `performance`. There is no timer emulation or wrapper around each call.

## Install

```sh
npm install just-performance
```

See [CHANGELOG.md](CHANGELOG.md) for packaging and compatibility changes.

## Time an operation

```js
import { performance } from 'just-performance';

const start = performance.now();
const sorted = [9, 3, 7, 1].sort((a, b) => a - b);
const elapsedMs = performance.now() - start;

console.log({ sorted, elapsedMs });
```

The same import works in Node.js ESM and browser code processed by a package-aware bundler. `performance.now()` gives a high-resolution timestamp in milliseconds relative to the platform's time origin. Measure elapsed time by subtracting timestamps from the same environment.

For CommonJS:

```js
const { performance } = require('just-performance');
console.log(performance.now());
```

## How resolution works

| Consumer | Export |
| --- | --- |
| Node.js ESM or CommonJS | Node's native `perf_hooks.performance` object. |
| Browser bundle | The browser's native global `performance` object. |
| TypeScript | Declarations selected for the corresponding Node or browser export. |

Node consumers get object identity, not a copy:

```js
const { performance } = require('just-performance');
const { performance: native } = require('perf_hooks');
console.log(performance === native); // true
```

A browser needs a bundler that resolves package imports; this package does not make a bare npm import work in a browser without that tooling. The environment must already provide a native performance object. It does not fall back to `Date.now()`.

## Shared code and platform-specific APIs

Use common methods such as `now()` when sharing code. Node's additional fields and methods remain available to Node consumers, but they do not become browser APIs. The package does not normalize differences between the platforms or synchronize clocks across processes or devices.

For applications that run only in Node.js, importing `performance` directly from `node:perf_hooks` is also sufficient. This package is useful when the same source needs to target both environments.

## TypeScript

```ts
import { performance } from 'just-performance';

const start: number = performance.now();
const origin: number = performance.timeOrigin;
```

Declarations ship with the package, including the required Node type dependency. NodeNext/Node16 consumers select Node declarations; a browser-oriented bundler configuration selects the browser declaration. The package tests verify both paths, including a browser type check without Node globals.

## Development

Use Node.js 22 or newer:

```sh
npm ci
npx playwright install chromium firefox webkit
npm test
```

On Linux, Playwright may also require its system dependencies (`npx playwright install --with-deps chromium firefox webkit`).

The tests build and install the actual npm archive into an independent project, check CommonJS/ESM identity, compile Node and browser TypeScript consumers, and execute an esbuild bundle in Chromium, Firefox and WebKit. GitHub Actions runs the checks on Node 22, 24 and 26. Compiler caches are excluded from the archive.

`npm pack` builds the distribution; `npm publish` first runs the full test suite. Browser engines and the compiler are development tooling, not runtime dependencies.

## License

[MIT](LICENSE).

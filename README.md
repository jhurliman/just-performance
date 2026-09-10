# just-performance

Isomorphic ponyfill wrapping browser performance and node.js perf_hooks performance.

## Usage

### Browser

```js
import { performance } from "just-performance";
```

## node.js

```js
import { performance } from "just-performance";
```

## License

MIT license

## CommonJS and TypeScript

```js
const { performance } = require('just-performance');
```

Node CommonJS and ESM imports both return Node's native performance object; the default non-Node export uses the browser global. Declarations are selected with the corresponding export condition. Node TypeScript consumers need `@types/node` (and `"types": ["node"]` when their configuration limits included types).

Run `npm ci`, `npx playwright install chromium firefox webkit`, and `npm test` to build and validate the actual npm archive in a temporary consumer project. The test checks CommonJS/ESM identity, strict NodeNext and browser TypeScript consumers, archive exclusions, and a browser bundle in Chromium, Firefox and WebKit. CI exercises Node 22, 24 and 26. Generated compiler caches are excluded from publication.

## Release preparation

The 4.4.1 candidate upgrades the development compiler to TypeScript 7 and uses npm with a lockfile. Browser declarations are compiled without Node globals, while the existing runtime fallback is retained. `npm publish` runs the full package checks via `prepublishOnly`; no publication occurs from tests or packing.

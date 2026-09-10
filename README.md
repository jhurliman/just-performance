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

Run `npm ci` and `npm test` to build and validate the actual npm archive in a temporary consumer project. The test checks CommonJS/ESM identity, the browser entry and archive exclusions. CI exercises Node 22, 24 and 26. Generated compiler caches are excluded from publication.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('packed package supports CommonJS, ESM and browser fallback', () => {
  const root = path.resolve(__dirname, '..');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'just-performance-'));
  try {
    const pack = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', dir], {cwd: root, encoding: 'utf8'}))[0];
    assert.ok(pack.files.every(file => !file.path.endsWith('.tsbuildinfo')));
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(dir, pack.filename)], {cwd: dir, stdio: 'pipe'});
    execFileSync(process.execPath, ['-e', "const assert=require('node:assert/strict');assert.equal(require('just-performance').performance,require('node:perf_hooks').performance)"], {cwd: dir});
    execFileSync(process.execPath, ['--input-type=module', '-e', "import assert from 'node:assert/strict';import {performance} from 'just-performance';import {performance as native} from 'node:perf_hooks';assert.equal(performance,native)"], {cwd: dir});
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'node_modules/just-performance/package.json')));
    const browserPath = path.resolve(dir, 'node_modules/just-performance', pkg.exports['.'].default.default);
    const browserSource = fs.readFileSync(browserPath, 'utf8');
    assert.ok(!browserSource.includes('perf_hooks'));
    execFileSync(process.execPath, ['--input-type=module', '-e', `import assert from 'node:assert/strict'; const sentinel={now:()=>42};Object.defineProperty(globalThis,'performance',{value:sentinel});const {performance}=await import(${JSON.stringify(require('node:url').pathToFileURL(browserPath).href)});assert.equal(performance,sentinel);`]);
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});

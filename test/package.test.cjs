const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('packed package supports CommonJS, ESM and browser fallback', async () => {
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
    const tsc = path.join(root, 'node_modules/typescript/bin/tsc');
    const nodeSource = "import {performance} from 'just-performance'; const n: number = performance.now(); const origin: number = performance.timeOrigin;";
    for (const ext of ['cts', 'mts']) fs.writeFileSync(path.join(dir, 'node.' + ext), nodeSource);
    execFileSync(process.execPath, [tsc, '--strict', '--noEmit', '--module', 'nodenext', '--moduleResolution', 'nodenext', '--target', 'es2022', '--typeRoots', path.join(root,'node_modules/@types'), '--types', 'node', 'node.cts', 'node.mts'], {cwd:dir,stdio:'pipe'});
    fs.writeFileSync(path.join(dir,'browser.ts'), "import {performance} from 'just-performance'; const p: Performance = performance;\n// @ts-expect-error the browser declaration does not expose Node-only fields\nperformance.nodeTiming;\n");
    fs.writeFileSync(path.join(dir,'tsconfig.json'), JSON.stringify({compilerOptions:{strict:true,noEmit:true,module:'esnext',moduleResolution:'bundler',lib:['es2022','dom'],types:[]},files:['browser.ts']}));
    execFileSync(process.execPath,[tsc,'-p','tsconfig.json'],{cwd:dir,stdio:'pipe'});
    const bundle = require('esbuild').buildSync({stdin:{contents:"import {performance} from 'just-performance'; globalThis.packagePerformance = performance;",resolveDir:dir},bundle:true,platform:'browser',format:'iife',write:false}).outputFiles[0].text;
    assert.ok(!bundle.includes('perf_hooks'));
    const playwright = require('playwright');
    for (const engine of ['chromium','firefox','webkit']) {
      const browser = await playwright[engine].launch({headless:true});
      try {
        const page = await browser.newPage();
        await page.setContent('<!doctype html><title>Package consumer</title>');
        await page.addScriptTag({content:bundle});
        assert.equal(await page.evaluate(() => window.packagePerformance === window.performance && typeof window.packagePerformance.now() === 'number'), true, engine);
      } finally { await browser.close(); }
    }

  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});

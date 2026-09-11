# Changelog

## 4.4.1 — 2026-09-10

- Exclude TypeScript build caches from npm archives and declare matching runtime/type entrypoints.
- Upgrade the build to TypeScript 7 with current module-resolution settings and separate Node/browser ambient types.
- Test the installed archive in CommonJS, ESM and strict TypeScript consumers; bundle it for and run it in Chromium, Firefox and WebKit.
- Use the npm lockfile consistently, and run tests before publication. Runtime implementations and supported fallback behavior are unchanged.

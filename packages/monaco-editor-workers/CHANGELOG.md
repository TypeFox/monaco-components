# CHANGELOG

All notable changes to npm module [monaco-editor-workers](https://www.npmjs.com/package/monaco-editor-workers) are documented in this file.

## [0.39.0] - 2023-06-14

- Updated to [0.39.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.39.0).

## [0.38.0] - 2023-06-05

- Updated to [0.38.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.38.0). Keep vite and rollup for bundling. Pure esbuild as an alternative.

## [0.37.0] - 2023-04-13

- Updated to [0.37.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.37.0)

## [0.36.0] - 2023-02-27

- Updated to [0.36.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.36.0)

## [0.35.0] - 2023-02-27

- Updated to [0.35.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.35.0)

## [0.34.2] - 2022-09-07

- Fix: Removed direct dependency to monaco editor in `buildWorkerDefinition`.

## [0.34.1] - 2022-24-08

- Fix: Use correct re-exports [#9](https://github.com/TypeFox/monaco-components/pull/9)

## [0.34.0] - 2022-08-15

- Updated to [0.34.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.34.0)
- All workers are now exported in package.json:
  - ./workers/module/editor
  - ./workers/module/ts
  - ./workers/module/html
  - ./workers/module/css
  - ./workers/module/json
  - ./workers/classic/editor
  - ./workers/classic/ts
  - ./workers/classic/html
  - ./workers/classic/css
  - ./workers/classic/json

## [0.33.0] - 2022-05-20

- Added package [Monaco Editor Workers](./packages/monaco-editor-workers) which eases loading the workers of Monaco Editor for different browsers, see [npm package](https://www.npmjs.com/package/monaco-editor-workers)
- Align version with main [monaco-editor](https://www.npmjs.com/package/monaco-editor)

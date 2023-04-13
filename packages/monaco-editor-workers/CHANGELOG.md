# CHANGELOG

All notable changes to npm module [monaco-editor-workers](https://www.npmjs.com/package/monaco-editor-workers) are documented in this file.

## [0.37.0]

- Updated to [0.37.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.37.0)

## [0.36.0]

- Updated to [0.36.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.36.0)

## [0.35.0]

- Updated to [0.35.0 release of monaco-editor](https://www.npmjs.com/package/monaco-editor/v/0.35.0)

## [0.34.2]

- Fix: Removed direct dependency to monaco editor in `buildWorkerDefinition`.

## [0.34.1]

- Fix: Use correct re-exports [#9](https://github.com/TypeFox/monaco-components/pull/9)

## [0.34.0]

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

## [0.33.0]

- Added package [Monaco Editor Workers](./packages/monaco-editor-workers) which eases loading the workers of Monaco Editor for different browsers, see [npm package](https://www.npmjs.com/package/monaco-editor-workers)
- Align version with main [monaco-editor](https://www.npmjs.com/package/monaco-editor)

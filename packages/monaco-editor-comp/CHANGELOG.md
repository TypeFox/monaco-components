# CHANGELOG

All notable changes to npm module [monaco-editor-comp](https://www.npmjs.com/package/monaco-editor-comp) are documented in this file.

## [1.5.0] - 2022-12-09

- Remove `swapEditors` function. `startEditor` disposes old (diff)editor and starts a freshly configured one.

## [1.4.1] - 2022-12-01

- Update to `monaco-editor-wrapper@1.4.1` and align own version number

## [1.4.0] - 2022-12-01

- `automaticLayout` is configured as default
- Fixed full configuration of editor and diff editor via `monacoEditorOptions` and `monacoDiffEditorOptions`
- Changed the compile target and module to ES2022.

## [1.3.2] - 2022-11-25

- Updated `monaco-editor-wrapper` to `1.3.2` and align own version number

## [1.3.1] - 2022-11-03

- Updated `monaco-editor-wrapper` to `1.3.1` and align own version number

## [1.3.0] - 2022-10-28

- Bundling issues with imported workers from wrapper #[14](https://github.com/TypeFox/monaco-components/issues/14)
  - The new default is that no additional language support is contained. You can use another export to obtain them. The same applies to the bundles:
    - `monaco-editor-comp/allLanguages`
    - `monaco-editor-comp/bundle`
    - `monaco-editor-comp/bundle/allLanguages`

## [1.2.0] - 2022-09-22

- Updated `monaco-editor-wrapper` to `1.2.0` and align own version number

## [1.0.0] - 2022-09-20

- Separated `monaco-editor-wrapper` from `monaco-editor-comp`

## [0.6.0]

- Updated `monaco-languageclient` to version `3.0.1` making it rely on monaco-editor `0.34.0` and vscode api `1.69`
- Updated

## [0.5.0]

- Support dispose on client wrapper #[7](https://github.com/TypeFox/monaco-components/pull/7)
- Check that all resources are properly closed when swapping editors #[8](https://github.com/TypeFox/monaco-components/issues/8)
- Expose all setters and getters of `CodeEditorConfig`
- Updated important dependencies:
  - `vite` to `3.0.5`

## [0.4.2]

- Properties are not treated optionally in TS code
- Updated READMEs

## [0.4.1]

- Properly separate web worker and websocket configuration of monaco-Languageclient
- Ad optional capability to build workers with esbuild
- Updated important dependencies:
  - `vite` to `3.0.2`
  - `monaco-languageclient` to `2.1.0`
  - `vscode-ws-jsonrpc` to `1.0.2`

## [0.4.0]

- Fixed Web Socket usage broken with version 0.3.0+
- Property application of the Web Component has been unified (gather and apply at one specific point)
- Added a Monaco Language Client example to the pure HTML/JS verification examples and clean-up all examples
- Updated important dependencies:
  - `monaco-languageclient` to `2.0.2`
  - `vscode-ws-jsonrpc` to `1.0.1`

## [0.3.1]

- Polish the monaco-editor wrapper API and add direct monaco-editor wrapper usage examples
- Add static helper functions for Codicon TTF loading and addition of monaco style sheets

## [0.3.0]

- Merged **monaco-editor-lc-comp** and **monaco-editor-comp**. Newest version of [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) no longer relies on `monaco-editor-core`
- npm packages supplies own code and workers and a super bundle in addition
  - Default export is the raw code. You can use `/bundle` for a fully bundled version.
- Updated important dependencies:
  - Fixed `vite` version to `2.9.6`
  - `monaco-lnaguageclient` to `1.0.1`
  - `typescript` to `^4.7.2`

Originally there two npm modules **monaco-editor-comp** and **monaco-editor-lc-comp**. **monaco-editor-lc-comp**. was discontinued as the functionality was merged into other one.

## [0.2.4]

- Update dependencies:
  - `monaco-editor` and `monaco-editor-core` to `0.33.0`
  - `monaco-languageclient` to `0.18.1`
  - `lit` to `2.2.1`
  - `eslint` to `8.10.0` and `@typescript-eslint/eslint-plugin` to `5.13.0`

## [0.2.3]

- Fix editor not always sized correctly. `updateEditor` now calls `layout()` for regular and diff editors. [**monaco-editor-comp**][**monaco-editor-lc-comp**]
- Fixes: #5: `codicon.ttf` is now contained in the dist to allow loading of true type font outside the web component. [**monaco-editor-comp**][**monaco-editor-lc-comp**]
- devDependencies Replaced `rimraf` with `shx`

## [0.2.2]

- Fix editor and diffEditor not properly disposed [**monaco-editor-comp**][**monaco-editor-lc-comp**]
- Adjusted editor-height to 100% instead of 100vh [**monaco-editor-comp**][**monaco-editor-lc-comp**]

## [0.2.1]

- Fixed issue `installMonaco` if service registration was already performed by other component instance [**monaco-editor-lc-comp**]
- Changed arguments of `swapEditors` to one typed configuration object [**monaco-editor-comp**][**monaco-editor-lc-comp**]

## [0.2.0]

- First public release of both **monaco-editor-comp** and **monaco-editor-lc-comp**

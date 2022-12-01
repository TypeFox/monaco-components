# CHANGELOG

All notable changes to npm module [monaco-editor-wrapper](https://www.npmjs.com/package/monaco-editor-wrapper) are documented in this file.

## [1.4.0] - 2022-12-01

- Export `vscode` (monaco-vscode-api) and `monaco` and remove getters
- automaticLayout is configured as default
- Fixed full configuration of editor and diff editor via `monacoEditorOptions` and `monacoDiffEditorOptions`
- Changed the compile target and module to ES2022.

## [1.3.2] - 2022-11-25

- Merged css and ttf helper functions. Now ttf is included in css removing unknown path errors.

## [1.3.1] - 2022-11-03

- Added get function to access `monaco-vscode-api` via `getVscode()`

## [1.3.0] - 2022-10-28

- Bundling issues with imported workers from wrapper #[14](https://github.com/TypeFox/monaco-components/issues/14)
  - The new default is that no additional language support is contained. You can use another export to obtain them. The same applies to the bundles:
    - `monaco-editor-wrapper/allLanguages`
    - `monaco-editor-wrapper/bundle`
    - `monaco-editor-wrapper/bundle/allLanguages`

## [1.2.0] - 2022-09-22

- Fix model URI path #[13](https://github.com/TypeFox/monaco-components/pull/13)
- Added inmemory uri to diff editor as well
- Re-worked the start/dispose/restart of the editor
- Ensure model uris are unique for different languages and across multiple editor instances

## [1.1.0] - 2022-09-20

- Allows to set `MessageReader` and `MessageWriter` for the web worker. This opens the possibility to emit and intercept messages.
- It is now possible to configure and use a full language extension configuration
- Added get functions to access to monaco, editor, diffEditor and languageClient or quickly get the editor content:
  - `getMonaco()`
  - `getEditor()`
  - `getDiffEditor()`
  - `getLanguageClient()`
  - `getMainCode()`
  - `getDiffCode()`

## [1.0.0] - 2022-09-08

- Separated `monaco-editor-wrapper` from `monaco-editor-comp`

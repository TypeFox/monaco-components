# CHANGELOG

All notable changes to npm module [monaco-editor-wrapper](https://www.npmjs.com/package/monaco-editor-wrapper) are documented in this file.

## [1.1.0]

- Allows to set `MessageReader` and `MessageWriter` for the web worker. This opens the possibility to emit and intercept messages.
- It is now possible to configure and use a full language extension configuration
- Added get functions to access to monaco, editor, diffEditor and languageClient or quickly get the editor content:
  - `getMonaco()`
  - `getEditor()`
  - `getDiffEditor()`
  - `getLanguageClient()`
  - `getMainCode()`
  - `getDiffCode()`

## [1.0.0]

- Separated `monaco-editor-wrapper` from `monaco-editor-comp`

# Changelog

All notable changes to this npm module are documented in this file.

## 2023-10-1x

- Adjust to underlying api changes (`monaco-vscode-api` and `monaco-languageclient`)
  - Renamed `EditorAppVscodeApi` to `EditorAppExtended` and `EditorAppConfigVscodeApi` to `EditorAppConfigExtended`
  - BREAKING: `$type` of `EditorAppConfigExtended` was changed from `vscodeApi` to `extended`
- Fix json language server launch
- Move python language server port to 30001 and json language server port to 30000

## 2023-09-21

- Langium example allows to use semantic highlighting with monarch grammars (monaco-editor classic mode)
- React Typescript example allows to update the text
- Aligned code to minor lib changes

## 2023-09-06

- Moved langium grammer langugae client and server from [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) here
  - Allow to start the editor in both classic and vscode-api mode

# CHANGELOG

All notable changes to npm module [monaco-editor-wrapper](https://www.npmjs.com/package/monaco-editor-wrapper) are documented in this file.

## [3.0.1] - 2023-09-07

- Introduce `logger.ts` which allows to centrally enable / disable console logging of the library
- Updated to `monaco-languageclient` `6.4.6` using `monaco-vscode-api` `1.81.7`
- Ensure LanguageClientWrapper Cleans up Worker [#42](https://github.com/TypeFox/monaco-components/pull/42)

## [3.0.0] - 2023-08-31

- New example and config changes [#37](https://github.com/TypeFox/monaco-components/pull/37)
- languageClientWrapper: Reject start with unreachable web socket or web worker url [#34](https://github.com/TypeFox/monaco-components/pull/34)
- Improve naming and improve api usage [#31](https://github.com/TypeFox/monaco-components/pull/31)
- createUrl now allows web socket urls without port and path [#30](https://github.com/TypeFox/monaco-components/pull/30)
- Updated to `monaco-languageclient` `6.4.5` using `monaco-vscode-api` `1.81.5` and `monaco-editor` `0.41.0`
- languageClientWrapper: Reject start with unreachable web socket or web worker url [#34](https://github.com/TypeFox/monaco-components/pull/34)
- Re-introduce `addMonacoStyles` via `monaco-editor-wrapper/styles`

## [2.1.1] - 2023-07-27

- Allow to pass a uri via editor config and model update [#29](https://github.com/TypeFox/monaco-components/pull/29)

## [2.1.0] - 2023-06-16

- Make worker handling more flexible [#27](https://github.com/TypeFox/monaco-components/pull/27)
- Updated to `monaco-languageclient` `6.2.0` using `monaco-vscode-api` `1.79.3` and `monaco-editor` `0.39.0`

## [2.0.1] - 2023-06-12

- Updated to `monaco-languageclient` `6.1.0` using `monaco-vscode-api` `1.79.1` and `monaco-editor` `0.38.0`

## [2.0.0] - 2023-06-02

- Move away from "property" based configuration. `UserConfig` drives the complete monaco-editor configuration
  - Use global configuration object that is passed to the wrapper on start
  - The `monaco-editor-wrapper` and the new `@typefox/monaco-editor-react` component use the same configuration
- The underlying monaco-editor can be configured in two ways now (wrapperConfig):
  - Classical: As before, but with one config object
  - Extension like: Using the extension based mechanism supplied by `monaco-vscode-api`
- `monaco-languageclient` no longer exposes its own service. Now, we fully rely on services supplied by `monaco-vscode-api`
  - This means even if you decide to configure monaco-editor the classical way, you still require some basic services. This configuration is made inside `MonacoEditorLanguageClientWrapper`. Potential serviceConfig supplied when using vscode-api extension config is taken into account and combined then.
- Re-configuration without full editor restart:
  - Updating the text model(s) is possible
  - Updating the monaco-editor options is possible
  - Restarting the languageclient is possible independently
- Everything else requires a restart of the editor!

## [1.6.1] - 2023-03-23

- Enable to update/restart the language client [#18](https://github.com/TypeFox/monaco-components/pull/18)
- Add language client initialization options [#17](https://github.com/TypeFox/monaco-components/pull/17)

## [1.6.0] - 2022-12-21

- Fix error in `disposeLanguageClient` preventing proper editor disposal
- Expose `MessageTransports` configuration for accessing `MessageReader` and `MessageWriter`
- Polish wrapper examples and add web socket example

## [1.5.0] - 2022-12-09

- Remove `swapEditors` function. `startEditor` disposes old (diff)editor and starts a freshly configured one.

## [1.4.1] - 2022-12-01

- Update to `monaco-languageclient@4.0.3`

## [1.4.0] - 2022-12-01

- Export `vscode` (monaco-vscode-api) and `monaco` and remove getters
- `automaticLayout` is configured as default
- Fixed full configuration of editor and diff editor via `monacoEditorOptions` and `monacoDiffEditorOptions`
- Changed the compile target and module to ES2022.
- Update to `monaco-languageclient@4.0.2`
- Update to `vscode-ws-jsonrpc@2.0.1`

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

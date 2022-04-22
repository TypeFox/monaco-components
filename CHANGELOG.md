# Global CHANGELOG for Monaco Editor Components

## [0.3.0]

* Build own code and workers and create a super bundle in addition
* Merged **monaco-editor-lc-comp** and **monaco-editor-comp**. Newest version of [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) no longer relies on `monaco-editor-core`
* Added package [Monaco Editor Workers](./packages/monaco-editor-workers) which eases loading the workers of Monaco Editor for different browsers
* Default export is the bundle. You can get the "raw" version with `monaco-editor-comp/raw`
* Update dependencies:
  * `vite` to `2.9.5`
  * `typescript` to `4.6.3`
  * `eslint` to `8.13.0`
  * `@typescript-eslint/eslint-plugin` to `5.20.0`

## [0.2.4]

* Update dependencies:
  * `monaco-editor` and `monaco-editor-core` to `0.33.0`
  * `monaco-languageclient` to `0.18.1`
  * `lit` to `2.2.1`
  * `eslint` to `8.10.0` and `@typescript-eslint/eslint-plugin` to `5.13.0`

## [0.2.3]

* Fix editor not always sized correctly. `updateEditor` now calls `layout()` for regular and diff editors. [**monaco-editor-comp**][**monaco-editor-lc-comp**]
* Fixes: #5: `codicon.ttf` is now contained in the dist to allow loading of true type font outside the web component. [**monaco-editor-comp**][**monaco-editor-lc-comp**]
* devDependencies Replaced `rimraf` with `shx`

## [0.2.2]

* Fix editor and diffEditor not properly disposed [**monaco-editor-comp**][**monaco-editor-lc-comp**]
* Adjusted editor-height to 100% instead of 100vh [**monaco-editor-comp**][**monaco-editor-lc-comp**]

## [0.2.1]

* Fixed issue `installMonaco` if service registration was already performed by other component instance [**monaco-editor-lc-comp**]
* Changed arguments of `swapEditors` to one typed configuration object [**monaco-editor-comp**][**monaco-editor-lc-comp**]

## [0.2.0]

* First public release of both **monaco-editor-comp** and **monaco-editor-lc-comp**

# Global CHANGELOG for Monaco Editor Components

## [0.2.5]

* Update dependencies:
  * `typescript` tp `4.6.3`,
  * `@typescript-eslint/eslint-plugin` to `5.16.0`
* Only build own code and workers, but don't create a super bundle

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

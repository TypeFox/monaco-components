# Global CHANGELOG for Monaco Editor Components

## [0.2.3]

* Fix editor not alwaysed sized correctly. `updateEditor` now calls `layout()` for regular and diff editors. [**monaco-editor-comp**][**monaco-editor-lc-comp**]
* Fixes: #5: `codicon.ttf` is now contained in the dist to allow loading of true type font outside the web component. [**monaco-editor-comp**][**monaco-editor-lc-comp**]
* devDependencies Replaced `rimraf` with `shx`

## [0.2.2]

* Fix editor and diffEditor not properly disposed [**monaco-editor-comp**][**monaco-editor-lc-comp**]
* Adjusted editor-height to 100% instead of 100vh [**monaco-editor-comp**][**monaco-editor-lc-comp**]

## [0.2.1]

* Fixed issue `installMonaco` if service registration was already performed by other component instance [**monaco-editor-lc-comp**]
* Changed arguments of `swapEditors` to one typed configuration object [**monaco-editor-comp**][**monaco-editor-lc-comp**]

## [0.2.0]

* First initial release of both **monaco-editor-comp** and **monaco-editor-lc-comp**

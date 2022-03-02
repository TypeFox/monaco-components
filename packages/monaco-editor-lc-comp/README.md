# Lit Component for Monaco Languageclient

This packages provide a wrapped `monaco-editor-core` with inlined editor worker installed to `monaco-languageclient` that can connect to a configurable languages server.

The component can be fully configured with inlined JavaScript. It can be configured as regular or diff editor.

## Web Component properties / configuration options

* **languageId**: Specify the editor language (default: `javascript`)
* **code**: Code or text that is shown in the editor (default: `''`);
* **modifiedCode**: Only Diff Editor: Specify the modified language (default: `javascript`)
* **modifiedLanguageId**: Only Diff Editor: Code or text that is shown in the modified editor. (default: `''`)
* **theme**: Theme of the editor that is used (default: `vs-light`)
* **enableInlineConfig**: Enable the inline editor configuration by specifying function `getMonacoEditorOptions` in inner script tag. You can directly pass monaco-editor options. See examples below. Attach the id directly to the name if you use more than one editor (e.g. `getMonacoEditorOptions42`).
* **useDiffEditor**: Use the diff editor instead of the regular editor by specifying function `getMonacoDiffEditorOptions`. It can only be used if `enableInlineConfig` is passed. See examples below.  Attach the id directly to the name if you use more than one editor (e.g. `getMonacoDiffEditorOptions42`).
* WebSocket configuration options (or use `getWebSocketOptions` if `enableInlineConfig` is set):
  * **wsSecured**: Use secure connection (default: `false`)
  * **wsHost**: Specify host (default: `localhost`)
  * **wsPort**: Specify port (default: `8080`)
  * **wsPath**: Specify path (default: `''`)

## Usage Examples

You need to run `npm i` from the root of the project and `npm run build` here in this directory after cloning otherwise the examples below won't work properly.

You find a usage examples here:

* [Vite local dev with with three different editors](./index.html): Run `npm run dev` to start here in this directory.
* [Vite bundle test with pure component config](../../verify/monaco-editor-lc-comp/index.html): Run `npm run verify-vite` here: `../../verify/monaco-editor-lc-comp`.
* [Direct bundle test with inline diff editor and web socker config](../../verify/monaco-editor-comp/index.html): Run `npm run verify-direct` here: `../../verify/monaco-editor-lc-comp`.

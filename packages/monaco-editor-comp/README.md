# Lit Component for Monaco Editor and Monaco Languageclient

This packages provides a wrapped `monaco-editor`. The `monaco-languageclient` can be activated to connect to a configurable languages server.

The component can be fully configured with embedded JavaScript. It can be configured as regular or diff editor.

## Web Component properties / configuration options

* **code**: Code or text that is shown in the editor (default: `''`);
* **languageId**: Specify the editor language (default: `javascript`)
* **theme**: Theme of the editor that is used (default: `vs-light`)
* **enableInlineConfig**: Enable the inline editor configuration by specifying function `getMonacoEditorOptions` in inner script tag. You can directly pass monaco-editor options. See examples below. Attach the id directly to the name if you use more than one editor (e.g. `getMonacoEditorOptions42`).
* **useDiffEditor**: Use the diff editor instead of the regular editor by specifying function `getMonacoDiffEditorOptions`. It can only be used if `enableInlineConfig` is passed. See examples below. Attach the id directly to the name if you use more than one editor (e.g. `getMonacoDiffEditorOptions42`).
* **modifiedCode**: *Only Diff Editor*: Specify the modified language (default: `javascript`)
* **modifiedLanguageId**: *Only Diff Editor*: Code or text that is shown in the modified editor. (default: `''`)
* **useLanguageClient**: Enable monaco languageclient. You have to configure the following WebDocket configuration options (or use `getLanguageClientOptions` if `enableInlineConfig` is set):
  * **useWebSocket**: Use the web socket connection (default: `true`), if `false` implementation tries to use a web worker instead (need to set **workerURL**)
  * Options for web socket:
    * **wsSecured**: Use secure connection (default: `false`)
    * **wsHost**: Specify host (default: `localhost`)
    * **wsPort**: Specify port (default: `8080`)
    * **wsPath**: Specify path (default: `''`)
  * Options for web worker:
    * **workerURL**: Specify a url to a web worker that is used for running a language server in the browser (default: `''`)
    * **useModuleWorker**: Tells if worker is a module (`true`) or a worker with classical syntax (`false`) (default: `false`)
    * **workerName**: The name to be used for the web worker (default: `''`)

## Help / Hints

Proper styling of at least the Diff Editor requires that the *codicon* font is loaded outside the web component. Due to limitations of the Shadow DOM this can unfortunately not be transparently handled by the web component and requires user code adjustments shown [here](../../verify/monaco-editor-comp/index.html#L11-16) and [monaco-editor sample]( https://github.com/microsoft/monaco-editor/blob/main/samples/browser-amd-shadow-dom/index.html)).

## Getting Started

See main [README](../../README.md#getting-started).

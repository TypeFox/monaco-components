# Monaco Editor and Monaco Languageclient Wrapper

This packages provides a wrapped `monaco-editor` with full basic language support and enhanced support via workers for special languages (e.g. TS, HTML). The `monaco-languageclient` can be activated to connect to a language server either via jsonrpc over a websocket to an exernal server process or via language server protocol for browser where the language server runs in a web worker.

## Getting Started

If you have node.js LTS available, then from the root of the project run:

```bash
npm i
npm run build
```

Afterwards launch the Vite.js development mode:

```bash
npm run dev
```

You find examples (manual human testing) in the root of the repository [index.html](../../index.html). They can be used once Vite is running.

## Usage examples

Monaco Editor with JavaScript language support in web worker

```typescript
// helper function for loading monaco-editor's own workers
import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('./node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
const client = new MonacoEditorLanguageClientWrapper();

const client = new MonacoEditorLanguageClientWrapper();
const editorConfig = client.getEditorConfig();
editorConfig.setMainLanguageId('javascript');
editorConfig.setMainCode(`function logMe() {
    console.log('Hello monaco-editor-wrapper!');
};`);

// assuming there is a div element named "monaco-editor-root"
client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
    .then((s: unknown) => console.log(s))
    .catch((e: Error) => console.error(e));
```

Monaco Editor with language server running in a web worker:

```typescript
// helper function for loading monaco-editor's own workers
import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('./node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';

const client = new MonacoEditorLanguageClientWrapper();

const editorConfig = client.getEditorConfig();
editorConfig.setMainLanguageId('plaintext');
editorConfig.setMainCode(`#ff0000 (red)
#00ff00 (green)
#0000ff (blue)`);

// use monaco-languageclient with web worker
editorConfig.setUseLanguageClient(true);
editorConfig.setUseWebSocket(false);

// load worker
const workerURL = new URL('./dist/worker.ts', window.location.href).href;
const lsWorker = new Worker(workerURL, {
    type: 'classic',
    name: 'LanguageServer'
});
client.setWorker(lsWorker);

// assuming there is a div element named "monaco-editor-root"
client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
    .then((s: unknown) => console.log(s))
    .catch((e: Error) => console.error(e));
```

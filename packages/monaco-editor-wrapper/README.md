# Monaco Editor and Monaco Languageclient Wrapper

This packages provides a wrapped `monaco-editor` with or without language support (main package export). The `monaco-languageclient` can be activated to connect to a language server either via jsonrpc over a websocket to an external server process or via language server protocol for browser where the language server runs in a web worker.

## Getting Started

We recommend using [Volta](https://volta.sh/) to ensure your node & npm are on known good versions.

If you have node.js LTS available, then from the root of the project run:

```bash
npm i
npm run build
```

This will clean, compile and build a bundle of the `monaco-editor-wrapper`, which you can reference in your own projects. For examples, you can see the top-level [README](../../README.md#getting-started) with details on running a local dev instance.

## Configuration
s
With release 2.0.0, the configuration approach is completely revised.

The `UserConfig` now contains everything and is passed to the `start` function of the wrapper. Because [monaco-vscode-api](https://github.com/CodinGame/monaco-vscode-api) uses a VS Code extension like configuration approach, the `UserConfig` allows to configure monaco-editor the [classical way](./src/editorAppClassic.ts) or to use [monaco-vscode-api way](./src/editorAppVscodeApi.ts). Additionally, [monaco-vscode-api](https://github.com/CodinGame/monaco-vscode-api) brings VS Code services to monaco-editor it usually does not have (Textmate Support, VS Code Theme Support, Keybindings, etc.). The wrapper initializes the following services from monaco-vscode-api independent of the editor mode: *model*, *editor* and *configuration*.

## Usage

Monaco Editor with TypeScript language support in web worker and relying on regular monaco-editor configuration:

```typescript
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';

import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';

// helper function for loading monaco-editor's own workers
import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('./node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

// no top-level await
const run = async () => {
  const wrapper = new MonacoEditorLanguageClientWrapper();
  const userConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    // rely on regular monaco-editor configuration
    wrapperConfig: {
      editorAppConfig: {
        $type: 'classic',
        languageId: 'typescript',
        code: `function sayHello(): string {
    return "Hello";
};`,
        useDiffEditor: false,
      }
    }
  };
  await wrapper.start(userConfig);
}
```

## Examples

These are the examples specifically for `monaco-editor-wrapper` you find in the repository:

- TypeScript editor worker using classical configuration, [see](../examples/wrapper_ts.html)
- Language client & web socket language server example using vscode-api configuration [see](../examples/wrapper_ws.html) It requires the json language server to run. Use `start:server:json` from [here](../examples/package.json)
- Multiple editors using classical configuration [see](../examples/wrapper_adv.html)
- Langium statemachine language client and web worker based language server using vscode-api configuration [see](../examples/wrapper_statemachine.html)
- Langium grammar language client and web worker based language server using vscode-api configuration [see](../examples/wrapper_langium.html)

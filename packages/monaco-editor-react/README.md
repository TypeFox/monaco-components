# React component for Monaco-Editor and Monaco Languageclient

This packages provides a react component wrapping `monaco-editor`. The `monaco-languageclient` can be activated to connect to a language server either via jsonrpc over a websocket to an exernal server process or via language server protocol for browser where the language server runs in a web worker.

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

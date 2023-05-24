# Monaco Editor Wrapper and Monaco Editor React Component

This repository started as Lit component for Monaco Editor, but it transformed into a wrapper for `monaco-editor`, `monaco-languageclient` and `monaco-vscode-api` and now features a react component (`@typefox/monaco-editor-react`) that encapsulates the `monaco-editor-wrapper`

## Packages

There are three npm packages generated from this repository:

- [Monaco Editor Wrapper](./packages/monaco-editor-wrapper/) + Language Client: Wrapped [monaco-editor](https://github.com/microsoft/monaco-editor) with the capability to plug-in [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) to connect to languages servers locally running (web worker) or remotely running (web socket).
- [Monaco Editor React Component](./packages/monaco-editor-react/) Monaco Editor React Component enclosing the **Monaco Editor Wrapper**
- [Monaco Editor Workers](./packages/monaco-editor-workers/) Bundles the editor and language workers of monaco as module and classic worker. It supplies a function that eases loading them in an application context.

Additionally you find a private [examples packages](./packages/examples/) containing all examples that is served by vite (see next chapter).

## Getting Started

If you have node.js LTS available, then from the root of the project run:

```bash
npm i
npm run build
```

Aftwerwards, launch the Vite development server:

```bash
npm run dev
```

If you want to change dependent code in the examples, you have to watch code changes in parallel:

```bash
npm run watch
```

You find examples (manual human testing) here [index.html](./index.html). They can be used once Vite is running. You can reach it once started on <http://localhost:20001>.

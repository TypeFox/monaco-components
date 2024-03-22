# Monaco Editor Wrapper and Monaco Editor React Component

**These projects have been migrated to [monaco-languageclient repo](https://github.com/TypeFox/monaco-languageclient)**

This repository started as a Lit component for Monaco Editor, but it has transformed into a wrapper for `monaco-editor`, `monaco-languageclient` and `@codingame/monaco-vscode-api` and now features a react component (`@typefox/monaco-editor-react`) that encapsulates the `monaco-editor-wrapper`.

## Packages

There are two npm packages generated from this repository:

- [Monaco Editor Wrapper](./packages/monaco-editor-wrapper/README.md) + Language Client: Wrapped [monaco-editor](https://github.com/microsoft/monaco-editor) with the capability to plug-in [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) to connect to languages servers locally running (web worker) or remotely running (web socket).
- [Monaco Editor React Component](./packages/monaco-editor-react/README.md): Monaco Editor React Component enclosing the **Monaco Editor Wrapper**

Additionally you can find a private [examples packages](./packages/examples/) containing all examples that are served by Vite (see next chapter).

**Important**: Monaco Editor Workers has been moved to its own [repo](https://github.com/TypeFox/monaco-editor-workers).

## Getting Started

We recommend using [Volta](https://volta.sh/) to ensure your node & npm are on known good versions.

If you have node.js LTS available, then from the root of the project run:

```bash
npm i
npm run build
```

If you get an error with `npm i` regarding tree-mending, you can run `npm ci` to clean things up from previous installations and continue.

Afterwards, launch the Vite development server:

```bash
npm run dev
```

If you want to change dependent code in the examples (`monaco-editor-wrapper` and `@typefox/monaco-editor-react`), you have to watch code changes in parallel:

```bash
npm run watch
```

You can find examples (manual human testing) here [index.html](./index.html). They can be used once Vite is running. You can reach it once started on <http://localhost:20001>.

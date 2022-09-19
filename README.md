# Monaco Editor Wrapper and Monaco Editor Wrapper Lit Component

This repository started as Lit component for Monaco Editor, but this is evolved into more.

## Packages

Currently there are three npm packages generated from this repository:

- [Monaco Editor Wrapper](./packages/monaco-editor-wrapper/) + Language Client: Wrapped [monaco-editor](https://github.com/microsoft/monaco-editor) with the capability to plug-in [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) to connect to languages servers.
- [Monaco Editor Component](./packages/monaco-editor-comp/) Monaco Editor Lit Component that also overs the capability to plug-in monaco-languageclient with more limited configurability compared to the wrapper
- [Monaco Editor Workers](./packages/monaco-editor-workers/) Bundles the editor and language workers of monaco as module and classic worker. It supplies a function that eases loading them in an application context.

## Getting Started

If you have node.js LTS available, then from the root of the project run:

```bash
npm i
npm run build
```

Afterwards launch the Vite development mode:

```bash
npm run dev
```

You find examples (manual human testing) here [index.html](./index.html). They can be used once Vite is running.

# Monaco Editor Components

Lit component for Monaco Editor

## Packages

- Monaco Editor + Language Client: Wrapped [monaco-editor](https://github.com/microsoft/monaco-editor) with full basic language support and enhanced support via workers for special languages (e.g. TS, HTML) and the capability to switch in [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) to connect to a configurable languages server.
- Monaco Editor Worker Support Package: Supplies all monaco-editor workers as module or classic workers + utility function to bind them to `MonacoEnvironment`

## Getting Started

If you have node.js LTS available, then from the root of the project run:

```bash
npm i
npm run build
```

Afterwards launch the vite development mode:

```bash
npm run dev`
```

You find examples (manual human testing) here [index.hmtl](./index.html). They can be used once vite is running.

## Inspiration

Before starting this project, I got inspired by:

- https://github.com/rodydavis/lit-code-editor
- https://github.com/vanillawc/wc-monaco-editor

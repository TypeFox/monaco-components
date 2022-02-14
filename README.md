# Monaco Editor Components

Lit components for Monaco Editor

## Packages

- Monaco Editor Full: Wrapped `monaco-editor` with full basic language support and enhanced support via workers for special languages (e.g. TS, HTML)
- Monaco Editor Language Client: Wrapped `monaco-editor-core` with inlined editor worker that can connect to a configurable languages server.

Currently both packages repackage `monaco-editor` and supply worker assets where needed.

## Verification

You find different verification examples (manual human testing) in the `verify` sub-folders:

- `monaco-editor`: Test the latest `monaco-editor` version without any wrapper
- `moned-full`: Test if `moned-full` works with both a vite dev environment or in a statically served HMTL context
- `moned-lc`: Test if `moned-full` works with both a vite dev environment or in a statically served HMTL context

## Inspiration

- https://github.com/rodydavis/lit-code-editor
- https://github.com/vanillawc/wc-monaco-editor

# Monaco Editor Worker Support Package

This package supplies all [monaco-editor](https://github.com/microsoft/monaco-editor) workers as module or classic workers (bundled with vite/rollup) and it contains a utility function that applies them to `MonacoEnvironment`:

Workers are now exported in the `packages.json`. This could be handy for re-bundling.

Additional exports:

- **./workers/module/editor** (Editor Module Worker)
- **./workers/module/ts** (TypeScript/JavaScript Module Worker)
- **./workers/module/html** (HTML Module Worker)
- **./workers/module/css** (CSS Module Worker)
- **./workers/module/json** (JSON Module Worker)
- **./workers/classic/editor** (Editor Classic/Firefox compatible Worker)
- **./workers/classic/ts** (TypeScript/JavaScript Classic/Firefox compatible Worker)
- **./workers/classic/html** (HTML Classic/Firefox compatible Worker)
- **./workers/classic/css** (CSS Classic/Firefox compatible Worker)
- **./workers/classic/json** (JSON Classic/Firefox compatible Worker)

```javascript
import { buildWorkerDefinition } from "monaco-editor-workers";

// supply path to workers path, the basePath and tell if module (true) or classic (false) workers shall be used.
// Classic workers are still required by Firefox.
buildWorkerDefinition('./node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);
```

The version of this package is aligned with the version of monaco-editor.

## Getting Started

See main [README](../../README.md#getting-started).

# Monaco Editor Worker Support Package

This package supplies all [monaco-editor](https://github.com/microsoft/monaco-editor) workers as module or classic workers (bundled with vite) and it contains a utility function that helps configuring them:

```javascript
import { buildWorkerDefinition } from "monaco-editor-workers";

// supply path to workers path, the basePath and tell if module (true) or classic (false) workers shall be used.
// Classic workers are still required by Firefox.
buildWorkerDefinition('./node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);
```

The version of this package is aligned with the version of monaco-editor.

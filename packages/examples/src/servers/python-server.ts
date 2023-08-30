import { resolve } from 'path';
import { getLocalDirectory, runPythonServer } from 'monaco-languageclient-examples/node';

const baseDir = resolve(getLocalDirectory(import.meta.url));
const relativeDir = '../../../../node_modules/pyright/dist/pyright-langserver.js';
runPythonServer(baseDir, relativeDir);

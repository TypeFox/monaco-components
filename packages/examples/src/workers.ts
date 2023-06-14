import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';

import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';

import { buildWorkerDefinition } from '../../monaco-editor-workers/src/index.js';
buildWorkerDefinition('../../monaco-editor-workers/dist/workers', import.meta.url, false);

editor.create(document.getElementById('container')!, {
    value: `function hello() {
    alert('Hello world!');
}`,
    language: 'typescript'
});

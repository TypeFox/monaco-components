export type { WebSocketConfigOptions, WorkerConfigOptions, LanguageExtensionConfig, WorkerCommunitcationConfig } from './index.js';

export { CodeEditorConfig, MonacoEditorLanguageClientWrapper } from './index.js';

// add workers
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';
import 'monaco-editor/esm/vs/language/html/monaco.contribution.js';
import 'monaco-editor/esm/vs/language/css/monaco.contribution.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';

// support all basic-languages
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution.js';

import type {
    MonacoLanguageExtensionConfig
} from './monacoConfig.js';

import type {
    LanguageDescription,
    WebSocketConfigOptions,
    WorkerConfigOptions
} from './codeEditorConfig.js';

import {
    CodeEditorConfig,
} from './codeEditorConfig.js';

import {
    MonacoEditorLanguageClientWrapper
} from './monacoEditorLanguageClientWrapper.js';

export type {
    LanguageDescription,
    MonacoLanguageExtensionConfig,
    WebSocketConfigOptions,
    WorkerConfigOptions
};

export {
    CodeEditorConfig,
    MonacoEditorLanguageClientWrapper
};

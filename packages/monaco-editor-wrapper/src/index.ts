import type {
    MonacoLanguageExtensionConfig
} from './monacoConfig.js';

import type {
    LanguageContent,
    WebSocketConfigOptions,
    WorkerConfigOptions
} from './codeEditorConfig.js';

import {
    CodeEditorConfig,
} from './codeEditorConfig.js';

import {
    MonacoEditorLanguageClientWrapper
} from './wrapper.js';

export type {
    LanguageContent,
    MonacoLanguageExtensionConfig,
    WebSocketConfigOptions,
    WorkerConfigOptions
};

export {
    CodeEditorConfig,
    MonacoEditorLanguageClientWrapper
};

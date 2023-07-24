import type {
    EditorClassicConfig,
} from './editorClassic.js';

import {
    EditorClassic
} from './editorClassic.js';

import type {
    EditorVscodeApiConfig,
    VscodeUserConfiguration
} from './editorVscodeApi.js';

import {
    EditorVscodeApi
} from './editorVscodeApi.js';

import type {
    EditorConfig,
    WebSocketConfigOptions,
    WorkerConfigOptions,
    LanguageClientConfig,
    UserConfig,
    ModelUpdate,
    MonacoEditorWrapper
} from './wrapper.js';

import {
    MonacoEditorLanguageClientWrapper,
} from './wrapper.js';

export type {
    EditorConfig,
    MonacoEditorWrapper,
    EditorClassicConfig,
    EditorVscodeApiConfig,
    VscodeUserConfiguration,
    WebSocketConfigOptions,
    WorkerConfigOptions,
    LanguageClientConfig,
    UserConfig,
    ModelUpdate
};

export {
    MonacoEditorLanguageClientWrapper,
    EditorClassic,
    EditorVscodeApi
};

export * from './helpers/css.js';

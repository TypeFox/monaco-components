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
    UserConfig
};

export {
    MonacoEditorLanguageClientWrapper,
    EditorClassic,
    EditorVscodeApi
};

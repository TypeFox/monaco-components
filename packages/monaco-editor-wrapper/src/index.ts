export * from './editor.js';

import type {
    EditorAppConfigClassic,
} from './editorClassic.js';

import {
    EditorClassic,
} from './editorClassic.js';

import type {
    EditorAppConfigVscodeApi,
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
    MonacoEditorWrapper,
    WrapperConfig
} from './wrapper.js';

import {
    MonacoEditorLanguageClientWrapper,
} from './wrapper.js';

export type {
    EditorConfig,
    MonacoEditorWrapper,
    WrapperConfig,
    EditorAppConfigClassic,
    EditorAppConfigVscodeApi,
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

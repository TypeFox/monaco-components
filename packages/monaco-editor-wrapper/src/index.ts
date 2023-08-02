export * from './editor.js';

import type {
    EditorAppConfigClassic,
} from './editorClassic.js';

import {
    EditorAppClassic,
} from './editorClassic.js';

import type {
    EditorAppConfigVscodeApi,
    VscodeUserConfiguration
} from './editorVscodeApi.js';

import {
    EditorAppVscodeApi
} from './editorVscodeApi.js';

import type {
    EditorContentConfig,
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
    EditorContentConfig,
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
    EditorAppClassic,
    EditorAppVscodeApi
};

export * from './helpers/css.js';
export * from './utils.js';

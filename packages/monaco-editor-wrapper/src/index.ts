export * from './editor.js';

import {
    EditorAppBase,
    isVscodeApiEditorApp
} from './editor.js';

import type {
    VscodeUserConfiguration,
} from './editor.js';

import type {
    EditorAppConfigClassic,
} from './editorClassic.js';

import {
    EditorAppClassic,
} from './editorClassic.js';

import type {
    EditorAppConfigVscodeApi,
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
    WrapperConfig
} from './wrapper.js';

import {
    MonacoEditorLanguageClientWrapper,
} from './wrapper.js';

export type {
    EditorContentConfig,
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
    EditorAppBase,
    isVscodeApiEditorApp,
    EditorAppClassic,
    EditorAppVscodeApi
};

export * from './helpers/css.js';
export * from './utils.js';

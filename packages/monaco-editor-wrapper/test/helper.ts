import { UserConfig, EditorAppType } from 'monaco-editor-wrapper';

export const createMonacoEditorDiv = () => {
    const div = document.createElement('div');
    div.id = 'monaco-editor-root';
    document.body.insertAdjacentElement('beforeend', div);
};

export const createBaseConfig = (type: EditorAppType): UserConfig => {
    return {
        wrapperConfig: createWrapperConfig(type)
    };
};

export const createWrapperConfig = (type: EditorAppType) => {
    return {
        editorAppConfig: createEditorAppConfig(type)
    };
};

export const createEditorAppConfig = (type: EditorAppType) => {
    return {
        $type: type,
        languageId: 'typescript',
        code: '',
        useDiffEditor: false,
    };
};

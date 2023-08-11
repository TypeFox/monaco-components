import { UserConfig, EditorAppType } from 'monaco-editor-wrapper';

export const createMonacoEditorDiv = () => {
    const div = document.createElement('div');
    div.id = 'monaco-editor-root';
    document.body.insertAdjacentElement('beforeend', div);
};

export const createBaseConfig = (type: EditorAppType): UserConfig => {
    return {
        htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
        wrapperConfig: createWrapperConfig(type)
    };
};

export const createWrapperConfig = (type: EditorAppType) => {
    return {
        editorAppConfig: {
            $type: type,
            languageId: 'typescript',
            code: '',
            useDiffEditor: false,
        }
    };
};

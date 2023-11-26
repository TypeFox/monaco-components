import { describe, expect, test } from 'vitest';
import { isModelUpdateRequired, EditorAppClassic, ModelUpdateType } from 'monaco-editor-wrapper';
import { createBaseConfig, createEditorAppConfig, createWrapperConfig } from './helper.js';

describe('Test EditorAppBase', () => {

    test('classic type: empty EditorAppConfigClassic', () => {
        const wrapperConfig = createWrapperConfig('classic');
        expect(wrapperConfig.editorAppConfig.$type).toBe('classic');
    });

    test('extended type: empty EditorAppConfigExtended', () => {
        const wrapperConfig = createWrapperConfig('extended');
        expect(wrapperConfig.editorAppConfig.$type).toBe('extended');
    });

    test('config defaults', () => {
        const config = createBaseConfig('classic');
        const app = new EditorAppClassic('config defaults', config);
        expect(app.getConfig().languageId).toEqual('typescript');
        expect(app.getConfig().code).toEqual('');
        expect(app.getConfig().codeOriginal).toEqual('');
        expect(app.getConfig().useDiffEditor).toBeFalsy();
        expect(app.getConfig().codeUri).toBeUndefined();
        expect(app.getConfig().codeOriginalUri).toBeUndefined();
        expect(app.getConfig().readOnly).toBeFalsy();
        expect(app.getConfig().domReadOnly).toBeFalsy();
    });

    test('isModelUpdateRequired', () => {
        const config = createEditorAppConfig('classic');
        let modelUpdateType = isModelUpdateRequired(config, { languageId: 'typescript', code: '' });
        expect(modelUpdateType).toBe(ModelUpdateType.NONE);

        modelUpdateType = isModelUpdateRequired(config, { languageId: 'typescript' });
        expect(modelUpdateType).toBe(ModelUpdateType.NONE);

        modelUpdateType = isModelUpdateRequired(config, { languageId: 'typescript', code: 'test' });
        expect(modelUpdateType).toBe(ModelUpdateType.CODE);

        modelUpdateType = isModelUpdateRequired(config, { languageId: 'javascript', code: 'test' });
        expect(modelUpdateType).toBe(ModelUpdateType.MODEL);
    });

});

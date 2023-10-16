import { describe, expect, test } from 'vitest';
import { isModelUpdateRequired, EditorAppClassic, ModelUpdateType, EditorAppConfigExtended, EditorAppExtended, EditorAppConfigClassic } from 'monaco-editor-wrapper';
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

    test('config userConfiguration', () => {
        const config = createBaseConfig('extended');
        const appConfig = config.wrapperConfig.editorAppConfig as EditorAppConfigExtended;
        appConfig.userConfiguration = {
            json: '{ "editor.semanticHighlighting.enabled": true }'
        };
        const app = new EditorAppExtended('config defaults', config);
        expect(app.getConfig().userConfiguration?.json).toEqual('{ "editor.semanticHighlighting.enabled": true }');
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

    test('isAppConfigDifferent: classic', () => {
        const orgConfig = createEditorAppConfig('classic') as EditorAppConfigClassic;
        const config = createEditorAppConfig('classic') as EditorAppConfigClassic;
        const app = new EditorAppClassic('test', createBaseConfig('classic'));
        expect(app.isAppConfigDifferent(orgConfig, config, false)).toBeFalsy();

        config.code = 'test';
        expect(app.isAppConfigDifferent(orgConfig, config, false)).toBeFalsy();
        expect(app.isAppConfigDifferent(orgConfig, config, true)).toBeTruthy();

        config.code = '';
        config.useDiffEditor = true;
        expect(app.isAppConfigDifferent(orgConfig, config, false)).toBeTruthy();
    });

    test('isAppConfigDifferent: vscode', () => {
        const orgConfig = createEditorAppConfig('extended') as EditorAppConfigExtended;
        const config = createEditorAppConfig('extended') as EditorAppConfigExtended;
        const app = new EditorAppExtended('test', createBaseConfig('extended'));
        expect(app.isAppConfigDifferent(orgConfig, config, false)).toBeFalsy();

        config.code = 'test';
        expect(app.isAppConfigDifferent(orgConfig, config, true)).toBeTruthy();

        config.code = '';
        config.extensions = [{
            config: {
                name: 'Tester',
                publisher: 'Tester',
                version: '1.0.0',
                engines: {
                    vscode: '*'
                }
            }
        }];
        expect(app.isAppConfigDifferent(orgConfig, config, false)).toBeTruthy();
    });

});

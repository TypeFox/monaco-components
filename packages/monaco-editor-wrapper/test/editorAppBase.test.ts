import { describe, expect, test } from 'vitest';
import { isAppConfigDifferent, isExtendedEditorApp, isModelUpdateRequired, EditorAppClassic, ModelUpdateType, EditorAppConfigExtended, EditorAppExtended } from 'monaco-editor-wrapper';
import { createBaseConfig, createEditorAppConfig, createWrapperConfig } from './helper.js';

describe('Test EditorAppBase', () => {

    test('isExtendedEditorApp: empty EditorAppConfigClassic', () => {
        const wrapperConfig = createWrapperConfig('classic');
        expect(isExtendedEditorApp(wrapperConfig)).toBeFalsy();
    });

    test('isExtendedEditorApp: empty EditorAppConfigExtended', () => {
        const wrapperConfig = createWrapperConfig('extended');
        expect(isExtendedEditorApp(wrapperConfig)).toBeTruthy();
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
        expect(modelUpdateType).toBe(ModelUpdateType.none);

        modelUpdateType = isModelUpdateRequired(config, { languageId: 'typescript' });
        expect(modelUpdateType).toBe(ModelUpdateType.none);

        modelUpdateType = isModelUpdateRequired(config, { languageId: 'typescript', code: 'test' });
        expect(modelUpdateType).toBe(ModelUpdateType.code);

        modelUpdateType = isModelUpdateRequired(config, { languageId: 'javascript', code: 'test' });
        expect(modelUpdateType).toBe(ModelUpdateType.model);
    });

    test('isAppConfigDifferent: classic', () => {
        const orgConfig = createEditorAppConfig('classic');
        const config = createEditorAppConfig('classic');
        expect(isAppConfigDifferent(orgConfig, config, false, false)).toBeFalsy();

        config.code = 'test';
        expect(isAppConfigDifferent(orgConfig, config, false, false)).toBeFalsy();
        expect(isAppConfigDifferent(orgConfig, config, true, false)).toBeTruthy();

        config.code = '';
        config.useDiffEditor = true;
        expect(isAppConfigDifferent(orgConfig, config, false, false)).toBeTruthy();
    });

    test('isAppConfigDifferent: vscode', () => {
        const orgConfig = createEditorAppConfig('extended') as EditorAppConfigExtended;
        const config = createEditorAppConfig('extended') as EditorAppConfigExtended;
        expect(isAppConfigDifferent(orgConfig, config, false, true)).toBeFalsy();

        config.code = 'test';
        expect(isAppConfigDifferent(orgConfig, config, true, false)).toBeTruthy();

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
        expect(isAppConfigDifferent(orgConfig, config, false, false)).toBeTruthy();
    });

});

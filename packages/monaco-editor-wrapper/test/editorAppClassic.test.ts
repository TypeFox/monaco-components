import { describe, expect, test } from 'vitest';
import { EditorAppClassic, EditorAppConfigClassic } from 'monaco-editor-wrapper';
import { createBaseConfig } from './helper.js';

const buildConfig = () => {
    const config = createBaseConfig('classic');
    (config.wrapperConfig.editorAppConfig as EditorAppConfigClassic).editorOptions = {};
    return config;
};

describe('Test EditorAppClassic', () => {

    test('editorOptions: semanticHighlighting=true', () => {
        const config = buildConfig();
        const configclassic = config.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        configclassic.editorOptions!['semanticHighlighting.enabled'] = true;

        const app = new EditorAppClassic('config defaults', config);
        expect(configclassic.$type).toEqual('classic');
        expect(app.getConfig().userConfiguration?.json).toEqual('{"editor.semanticHighlighting.enabled":true}');
    });

    test('editorOptions: semanticHighlighting=false', () => {
        const config = buildConfig();
        const configclassic = config.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        configclassic.editorOptions!['semanticHighlighting.enabled'] = false;

        const app = new EditorAppClassic('config defaults', config);
        expect(app.getConfig().userConfiguration?.json).toEqual('{"editor.semanticHighlighting.enabled":false}');
    });

    test('editorOptions: semanticHighlighting="configuredByTheme"', () => {
        const config = buildConfig();
        const configclassic = config.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        configclassic.editorOptions!['semanticHighlighting.enabled'] = 'configuredByTheme';

        const app = new EditorAppClassic('config defaults', config);
        expect(app.getConfig().userConfiguration?.json).toEqual('{"editor.semanticHighlighting.enabled":"configuredByTheme"}');
    });
});

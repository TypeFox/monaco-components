import { describe, expect, test } from 'vitest';
import { EditorAppClassic, EditorAppConfigClassic } from 'monaco-editor-wrapper';
import { createBaseConfig } from './helper.js';

describe('Test EditorAppClassic', () => {

    test('editorOptions: semanticHighlighting', () => {
        const config = createBaseConfig('classic');
        const configclassic = config.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        expect(configclassic.$type).toEqual('classic');

        configclassic.editorOptions = {
            'semanticHighlighting.enabled': true
        };
        const app = new EditorAppClassic('config defaults', config);
        expect(app.getConfig().userConfiguration?.json).toEqual('{"editor.semanticHighlighting.enabled":true}');
    });
});

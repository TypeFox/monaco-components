import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { buildWorkerDefinition } from 'monaco-editor-workers';
import { UserConfig } from 'monaco-editor-wrapper';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

describe('Test MonacoEditorReactComp', () => {

    test('New conp has undefined editor', () => {
        const userConfig: UserConfig = {
            htmlElement: document.getElementById('root')!,
            wrapperConfig: {
                editorAppConfig: {
                    $type: 'classic',
                    languageId: 'typescript',
                    useDiffEditor: false,
                    code: ''
                }
            }
        };
        const comp = render(<MonacoEditorReactComp
            userConfig={userConfig}
        />);
        expect(comp).toBeTruthy();
    });

});

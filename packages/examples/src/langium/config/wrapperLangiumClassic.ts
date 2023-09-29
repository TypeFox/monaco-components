import { Uri } from 'vscode';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import { useOpenEditorStub } from 'monaco-languageclient';
import { UserConfig } from 'monaco-editor-wrapper';
import { getTextContent } from '../../common.js';
import { LangiumMonarchContent } from './langium.monarch.js';
import { loadLangiumWorker } from '../wrapperLangium.js';

export const setupLangiumClientClassic = async (): Promise<UserConfig> => {
    const code = await getTextContent(new URL('./src/langium/content/example.langium', window.location.href));

    const langiumWorker = loadLangiumWorker();
    return {
        loggerConfig: {
            enabled: true,
            debugEnabled: true
        },
        wrapperConfig: {
            serviceConfig: {
                userServices: {
                    ...getConfigurationServiceOverride(Uri.file('/workspace')),
                    ...getEditorServiceOverride(useOpenEditorStub),
                    ...getKeybindingsServiceOverride()
                },
                debugLogging: true
            },
            editorAppConfig: {
                $type: 'classic',
                languageId: 'langium',
                code: code,
                useDiffEditor: false,
                // configure it like this or in the userConfiguration
                editorOptions: {
                    'semanticHighlighting.enabled': true
                },
                languageExtensionConfig: { id: 'langium' },
                languageDef: LangiumMonarchContent,
                userConfiguration: {
                    // or configure the semantic highlighting like this:
                    // `{ json: "editor.semanticHighlighting.enabled": true }`
                }
            }
        },
        languageClientConfig: {
            options: {
                $type: 'WorkerDirect',
                worker: langiumWorker
            }
        }
    };
};

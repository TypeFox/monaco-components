import { UserConfig } from 'monaco-editor-wrapper';
import { getTextContent } from '../../common.js';
import { LangiumMonarchContent, LangiumTheme } from './langium.monarch.js';
import { loadLangiumWorker } from '../wrapperLangium.js';

export const setupLangiumClientClassic = async (): Promise<UserConfig> => {
    const code = await getTextContent(new URL('./src/langium/content/example.langium', window.location.href));

    const langiumWorker = loadLangiumWorker();
    return {
        htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
        loggerConfig: {
            enabled: true,
            debugEnabled: true
        },
        wrapperConfig: {
            serviceConfig: {
                enableModelService: true,
                configureEditorOrViewsService: {
                },
                configureConfigurationService: {
                    defaultWorkspaceUri: '/tmp/'
                },
                enableLanguagesService: true,
                enableKeybindingsService: true,
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
                themeData: LangiumTheme,
                theme: 'langium-theme',
                userConfiguration: {
                    // or configure the semantic highlighting like this:
                    // `{ json: "editor.semanticHighlighting.enabled": true }`
                    json: '{}'
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

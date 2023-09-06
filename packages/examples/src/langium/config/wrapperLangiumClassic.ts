import { UserConfig } from 'monaco-editor-wrapper';
import { getTextContent } from '../../common.js';
import { LangiumMonarchContent } from './langium.monarch.js';
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
                editorOptions: {
                    glyphMargin: true,
                    guides: {
                        bracketPairs: true
                    },
                    lightbulb: {
                        enabled: true
                    },
                    theme: 'vs-dark',
                    'semanticHighlighting.enabled': true
                },
                languageExtensionConfig: { id: 'langium' },
                languageDef: LangiumMonarchContent
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

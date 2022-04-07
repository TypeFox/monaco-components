import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

type WorkerOverrideGlobals = {
    basePath: string;
    workerPath: string;
    workerOptions: WorkerOptions;
}

export function buildWorkerDefinition(workerPath: string, basePath: string, useModuleWorker: boolean) {

    const getWorker = (_: string, label: string) => {
        console.log('getWorker: workerId: ' + _ + ' label: ' + label);

        const monWin = (self as monaco.Window);

        const buildWorker = (label: string, workerName: string, editorType: string) => {
            const globals = (monWin.MonacoEnvironment as Record<string, unknown>).workerOverrideGlobals as WorkerOverrideGlobals;
            globals.workerOptions.name = label;

            const workerFilename = globals.workerOptions.type === 'module' ? `${workerName}-es.js` : `${workerName}-iife.js`;
            const workerPathLocal = `${globals.workerPath}/${workerFilename}`;
            const workerUrl = new URL(workerPathLocal, globals.basePath);
            console.log(`${editorType}: url: ${workerUrl.href} created from basePath: ${globals.basePath} and file: ${workerPathLocal}`);

            return new Worker(workerUrl.href, globals.workerOptions);
        };

        switch (label) {
            case 'typescript':
            case 'javascript':
                return buildWorker(label, 'tsWorker', 'TS Worker');
            case 'html':
            case 'handlebars':
            case 'razor':
                return buildWorker(label, 'htmlWorker', 'HTML Worker');
            case 'css':
            case 'scss':
            case 'less':
                return buildWorker(label, 'cssWorker', 'CSS Worker');
            case 'json':
                return buildWorker(label, 'jsonWorker', 'JSON Worker');
            default:
                return buildWorker(label, 'editorWorker', 'Editor Worker');
        }
    };

    const monWin = (self as monaco.Window);
    if (monWin) {
        if (!monWin.MonacoEnvironment) {
            monWin.MonacoEnvironment = {
            };
        }

        (monWin.MonacoEnvironment as Record<string, unknown>).getWorker = getWorker;
        const globals = (monWin.MonacoEnvironment as Record<string, unknown>).workerOverrideGlobals as WorkerOverrideGlobals;
        if (!globals) {
            (monWin.MonacoEnvironment as Record<string, unknown>).workerOverrideGlobals = {
                basePath: basePath,
                workerPath: workerPath,
                workerOptions: {
                    type: useModuleWorker ? 'module' : 'classic'
                }
            };
        }
    }
}

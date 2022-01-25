import editorWorker from './assets/editor.worker.43309ac9.js?worker';

export default function defineWorkers(_basePath, monWin) {
    if (!monWin) return;

    monWin.MonacoEnvironment = {
        getWorker: (_, label) => {
            return new editorWorker();
        },
    };
}


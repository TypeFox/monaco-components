import editorWorker from './assets/editor.worker.43309ac9.js?worker';

export default function defineWorkers(monWin) {
    if (!monWin) return;

    monWin.getWorker = function (_, label) {
        return new editorWorker();
    };
}

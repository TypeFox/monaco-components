export default function defineWorkers(monWin, _basePath) {
    if (!monWin) return;

    monWin.getWorker = function (_, label) {
        return new Worker(_basePath + '/assets/editor.worker.43309ac9.js');
    };
}

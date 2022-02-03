export default function defineWorkers(_basePath, wrapper) {

    wrapper.getTsWorker = function () {
        return new Worker(_basePath + '/assets/ts.worker.975a9a7e.js');
    };

    wrapper.getHtmlWorker = function () {
        return new Worker(_basePath + '/assets/html.worker.9f1e82de.js');
    };

    wrapper.getCssWorker = function () {
        return new Worker(_basePath + '/assets/css.worker.143db743.js');
    };

    wrapper.getJsonWorker = function () {
        return new Worker(_basePath + '/assets/json.worker.26a385fa.js');
    };

}

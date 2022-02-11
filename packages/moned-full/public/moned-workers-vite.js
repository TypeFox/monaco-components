import tsWorkerRuntime from './assets/ts.worker.0257ba44.js?worker';
import htmlWorkerRuntime from './assets/html.worker.b7ccdea1.js?worker';
import cssWorkerRuntime from './assets/css.worker.df96c17d.js?worker';
import jsonWorkerRuntime from './assets/json.worker.86999103.js?worker';

export default function defineWorkersVite(wrapper) {

    wrapper.getTsWorker = function () {
        return new tsWorkerRuntime();
    };

    wrapper.getHtmlWorker = function () {
        return new htmlWorkerRuntime();
    };

    wrapper.getCssWorker = function () {
        return new cssWorkerRuntime();
    };

    wrapper.getJsonWorker = function () {
        return new jsonWorkerRuntime();
    };

}

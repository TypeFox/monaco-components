import tsWorker from './assets/ts.worker.975a9a7e.js?worker';
import htmlWorker from './assets/html.worker.9f1e82de.js?worker';
import cssWorker from './assets/css.worker.143db743.js?worker';
import jsonWorker from './assets/json.worker.26a385fa.js?worker';

export default function defineWorkers(wrapper) {

    wrapper.getTsWorker = function () {
        return new tsWorker();
    };

    wrapper.getHtmlWorker = function () {
        return new htmlWorker();
    };

    wrapper.getCssWorker = function () {
        return new cssWorker();
    };

    wrapper.getJsonWorker = function () {
        return new jsonWorker();
    };

}

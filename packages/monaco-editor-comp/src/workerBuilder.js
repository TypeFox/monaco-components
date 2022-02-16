import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

export function defineWorkersVite(wrapper) {

    wrapper.getTsWorker = function() {
        return new tsWorker();
    };

    wrapper.getHtmlWorker = function() {
        return new htmlWorker();
    };

    wrapper.getCssWorker = function() {
        return new cssWorker();
    };

    wrapper.getJsonWorker = function() {
        return new jsonWorker();
    };

}

export function defineWorkers(_basePath, wrapper) {

    wrapper.getTsWorker = function() {
        // eslint-disable-next-line no-undef
        return new Worker(_basePath + '/assets/ts.worker.0257ba44.js');
    };

    wrapper.getHtmlWorker = function() {
        // eslint-disable-next-line no-undef
        return new Worker(_basePath + '/assets/html.worker.b7ccdea1.js');
    };

    wrapper.getCssWorker = function() {
        // eslint-disable-next-line no-undef
        return new Worker(_basePath + '/assets/css.worker.df96c17d.js');
    };

    wrapper.getJsonWorker = function() {
        // eslint-disable-next-line no-undef
        return new Worker(_basePath + '/assets/json.worker.86999103.js');
    };

}

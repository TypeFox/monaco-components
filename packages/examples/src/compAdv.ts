import { MonacoEditorWebComponent } from 'monaco-editor-comp/allLanguages';

const monComps = document.querySelectorAll('monaco-editor-comp');

function sleepOne(milliseconds: number) {
    setTimeout(() => {
        alert(`Updating editors after ${milliseconds}ms`);

        const comp42 = monComps[0] as MonacoEditorWebComponent;
        // ensure base configuration is reloaded
        comp42.loadInlineConfig();
        comp42.setCode(`function logMe() {
    console.log('Hello swap editors!');
};`);
        comp42.setLanguageId('javascript');
        comp42.setUseDiffEditor(false);
        comp42.startEditor(false);

        const comp43 = monComps[1];
        // ensure base configuration is reloaded
        comp43.loadInlineConfig();
        comp43.updateDiffEditorContent(
            'text 1234', 'javascript',
            'text 5678', 'javascript'
        );
        comp43.startEditor(false);

        const comp44 = monComps[2];
        // ensure base configuration is reloaded
        comp44.loadInlineConfig();
        comp44.setCode('oh la la la!');
        comp44.setLanguageId('text/plain');
        comp44.setModifiedCode('oh lo lo lo!');
        comp44.setModifiedLanguageId('text/plain');
        // This affects all editors globally and is only effective
        // if it is not in contrast to one configured later
        comp44.setTheme('vs-light');
        comp44.setUseDiffEditor(true);
        comp44.startEditor(false);
    }, milliseconds);
}
// change the editors config, content or swap normal and diff editors after five seconds
sleepOne(5000);

function sleepTwo(milliseconds: number) {
    setTimeout(() => {
        alert(`Updating last editor after ${milliseconds}ms`);

        const comp44 = monComps[2];
        // ensure base configuration is reloaded
        comp44.setTheme('vs-light');
        comp44.setUseDiffEditor(false);
        comp44.startEditor(false);
    }, milliseconds);
}
sleepTwo(10000);

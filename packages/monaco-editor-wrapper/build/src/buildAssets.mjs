import * as fs from 'fs';

fs.readFile('../../node_modules/monaco-editor/min/vs/editor/editor.main.css', 'utf8', (errCss, dataCss) => {
    if (errCss) {
        console.error(errCss);
        return;
    }

    fs.readFile('../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf', 'base64', (errTtf, dataTtf) => {
        if (errTtf) {
            console.error(errTtf);
            return;
        }
        const dataTtfAug = `data:font/ttf;base64,${dataTtf}`;
        const output = dataCss.replace('../base/browser/ui/codicons/codicon/codicon.ttf', dataTtfAug);
        if (!fs.existsSync('./src/generated')) {
            fs.mkdirSync('./src/generated');
        }
        fs.writeFileSync('./src/generated/css.ts', `export function getMonacoCss() {\n    return \`${output}\`;\n}`);
    });
});

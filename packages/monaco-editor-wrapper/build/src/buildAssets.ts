import * as fs from 'fs';

fs.readFile('../../node_modules/monaco-editor/min/vs/editor/editor.main.css', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    if (!fs.existsSync('./src/generated')) {
        fs.mkdirSync('./src/generated');
    }
    fs.writeFileSync('./src/generated/css.ts', `export function getMonacoCss() {\n    return \`${data}\`;\n}`);
});

fs.readFile('../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf', 'base64', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const output = `data:font/ttf;base64,${data}`;

    if (!fs.existsSync('./src/generated')) {
        fs.mkdirSync('./src/generated');
    }
    fs.writeFileSync('./src/generated/ttf.ts', `export function getCodiconTtf() {\n    return '${output}';\n}`);
});

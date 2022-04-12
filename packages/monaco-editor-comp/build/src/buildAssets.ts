import * as fs from 'fs';

fs.readFile('../../node_modules/monaco-editor/min/vs/editor/editor.main.css', 'utf8' , (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    fs.mkdirSync('./src/generated');
    fs.writeFileSync('./src/generated/css.ts', `export function getMonacoCss() {\n    return \`${data}\`;\n}`);
});

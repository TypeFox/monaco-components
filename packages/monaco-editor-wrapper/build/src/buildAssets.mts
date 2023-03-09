import { existsSync, mkdirSync, readFile, writeFileSync } from 'fs';
import { fetchAllThemesFromGitHub } from 'monaco-languageclient/themeRemoteHelper';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import shell from 'shelljs';

/**
 * Solves: __dirname is not defined in ES module scope
 */
export function getLocalDirectory() {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(__filename);
}

readFile(resolve(getLocalDirectory(), '../../../../node_modules/monaco-editor/min/vs/editor/editor.main.css'), 'utf8', (errCss, dataCss) => {
    if (errCss) {
        console.error(errCss);
        return;
    }

    readFile(resolve(getLocalDirectory(), '../../../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf'), 'base64', (errTtf, dataTtf) => {
        if (errTtf) {
            console.error(errTtf);
            return;
        }
        const dataTtfAug = `data:font/ttf;base64,${dataTtf}`;
        const output = dataCss.replace('../base/browser/ui/codicons/codicon/codicon.ttf', dataTtfAug);
        if (!existsSync(resolve(getLocalDirectory(), '../../src/generated'))) {
            mkdirSync(resolve(getLocalDirectory(), '../../src/generated'));
        }
        writeFileSync(resolve(getLocalDirectory(), '../../src/generated/css.ts'), `export function getMonacoCss() {\n    return \`${output}\`;\n}`);
    });
});

shell.mkdir('-p', resolve(getLocalDirectory(), '../../resources/wasm'));
const onigSource = resolve(getLocalDirectory(), '../../../../node_modules/vscode-oniguruma/release/onig.wasm');
const onigTarget = resolve(getLocalDirectory(), '../../resources/wasm');
shell.cp(onigSource, onigTarget);

shell.mkdir('-p', resolve(getLocalDirectory(), '../../resources/themes'));
await fetchAllThemesFromGitHub(resolve(getLocalDirectory(), '../../resources/themes'));

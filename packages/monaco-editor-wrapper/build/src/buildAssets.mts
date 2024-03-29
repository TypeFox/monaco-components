import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFileSync } from 'fs';

/**
 * Solves: __dirname is not defined in ES module scope
 */
export function getLocalDirectory() {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(__filename);
}

readFile(resolve(getLocalDirectory(), '../../bundle/assets/style.css'), 'utf8', (errCss, dataCss) => {
    if (errCss) {
        console.error(errCss);
        return;
    }
    let output = '// This file is auto-generated. Pleas do not change by hand.\n';
    output = output + '// The file contains the styles generated by vite/rollup production bundle.\n';
    output = output + `export const getMonacoCss = () => {\n    return '${dataCss.trim()}';\n};`;
    writeFileSync(resolve(getLocalDirectory(), '../../styles/css.js'), output);
});

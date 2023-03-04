import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

export function getLocalDirectory() {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(__filename);
}

const bundleWorker = async (entryFile: string, outfile: string) => {
    await build({
        entryPoints: [entryFile],
        bundle: true,
        treeShaking: true,
        minify: true,
        format: 'iife',
        allowOverwrite: true,
        absWorkingDir: resolve(getLocalDirectory(), '..'),
        logLevel: 'info',
        outfile: outfile
    });
};

const input = resolve(getLocalDirectory(), '../../../node_modules/langium-statemachine-dsl/out/language-server/main-browser.js')
const output = './dist/worker/statemachineServerWorker.js';
bundleWorker(input, output);

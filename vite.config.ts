import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                monacoEditorWrapper: path.resolve(__dirname, '/packages/examples/wrapper.html'),
                monacoEditorComp: path.resolve(__dirname, '/packages/examples/comp.html'),
                monacoEditorCompAdvanced: path.resolve(__dirname, '/packages/examples/comp-adv.html'),
                monacoEditorWorkers: path.resolve(__dirname, '/packages/examples/workers.html'),
                verifyDirect: path.resolve(__dirname, '/packages/examples/verify_direct.html'),
                verifyComp: path.resolve(__dirname, '/packages/examples/verify_comp.html'),
                verifyCompLc: path.resolve(__dirname, '/packages/examples/verify_comp_lc.html')
            }
        },
        target: ['node16']
    },
    resolve: {
        alias: {
            path: 'path-browserify'
        }
    },
    server: {
        port: 20001
    }
});

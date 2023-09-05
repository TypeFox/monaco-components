import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

export default defineConfig({
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                wrapperStatemachine: resolve(__dirname, '/packages/examples/wrapper_statemachine.html'),
                wrapperLangium: resolve(__dirname, '/packages/examples/wrapper_langium.html'),
                wrapperTs: resolve(__dirname, '/packages/examples/wrapper_ts.html'),
                wrapperWebSocket: resolve(__dirname, '/packages/examples/wrapper_ws.html'),
                wrapperAdvanced: resolve(__dirname, '/packages/examples/wrapper_adv.html'),
                reactPython: resolve(__dirname, '/packages/examples/react_python.html'),
                reactStatemachine: resolve(__dirname, '/packages/examples/react_statemachine.html'),
                reactTs: resolve(__dirname, '/packages/examples/react_ts.html'),
                workers: resolve(__dirname, '/packages/examples/workers.html'),
                verifyWrapper: resolve(__dirname, '/packages/examples/verify_wrapper.html'),
                verifyAlt: resolve(__dirname, '/packages/examples/verify_alt.html')
            }
        }
    },
    resolve: {
        alias: {
            path: 'path-browserify'
        }
    },
    server: {
        origin: 'http://localhost:20001',
        port: 20001
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                // copied from "https://github.com/CodinGame/monaco-vscode-api/blob/run-ext-host-in-worker/demo/vite.config.ts"
                {
                    name: 'import.meta.url',
                    setup({ onLoad }) {
                        // Help vite that bundles/move files without touching `import.meta.url` which breaks asset urls
                        onLoad({ filter: /default-extensions\/.*\.js/, namespace: 'file' }, args => {
                            let code = readFileSync(args.path, 'utf8');
                            code = code.replace(
                                /\bimport\.meta\.url\b/g,
                                `new URL('/@fs/${args.path}', window.location.origin)`
                            );
                            return { contents: code };
                        });
                    }
                }]
        }
    }
});

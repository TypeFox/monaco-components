import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                wrapperLangium: path.resolve(__dirname, '/packages/examples/wrapper_langium.html'),
                wrapperTs: path.resolve(__dirname, '/packages/examples/wrapper_ts.html'),
                wrapperWebSocket: path.resolve(__dirname, '/packages/examples/wrapper_ws.html'),
                wrapperAdvanced: path.resolve(__dirname, '/packages/examples/wrapper_adv.html'),
                react: path.resolve(__dirname, '/packages/examples/react.html'),
                reactTs: path.resolve(__dirname, '/packages/examples/react_ts.html'),
                workers: path.resolve(__dirname, '/packages/examples/workers.html'),
                verifyWrapper: path.resolve(__dirname, '/packages/examples/verify_wrapper.html')
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
    assetsInclude: ['**/*.wasm']
});

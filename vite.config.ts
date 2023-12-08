import { defineConfig } from 'vite';
import * as path from 'path';
import * as fs from 'fs';
import url from 'url';

export default defineConfig(() => {
    const config = {
        build: {
            target: 'esnext',
            rollupOptions: {
                input: {
                    index: path.resolve(__dirname, '/index.html'),
                    wrapperStatemachine: path.resolve(__dirname, '/packages/examples/wrapper_statemachine.html'),
                    wrapperLangium: path.resolve(__dirname, '/packages/examples/wrapper_langium.html'),
                    wrapperTs: path.resolve(__dirname, '/packages/examples/wrapper_ts.html'),
                    wrapperWebSocket: path.resolve(__dirname, '/packages/examples/wrapper_ws.html'),
                    wrapperAdvanced: path.resolve(__dirname, '/packages/examples/wrapper_adv.html'),
                    reactPython: path.resolve(__dirname, '/packages/examples/react_python.html'),
                    reactStatemachine: path.resolve(__dirname, '/packages/examples/react_statemachine.html'),
                    reactTs: path.resolve(__dirname, '/packages/examples/react_ts.html'),
                    workers: path.resolve(__dirname, '/packages/examples/workers.html'),
                    verifyWrapper: path.resolve(__dirname, '/packages/examples/verify_wrapper.html'),
                    verifyAlt: path.resolve(__dirname, '/packages/examples/verify_alt.html')
                }
            }
        },
        resolve: {
            dedupe: ['monaco-editor', 'vscode']
        },
        server: {
            origin: 'http://localhost:20001',
            port: 20001
        },
        optimizeDeps: {
            esbuildOptions: {
                plugins: [
                    // copied from "https://github.com/CodinGame/monaco-vscode-api/blob/main/demo/vite.config.ts"
                    {
                        name: 'import.meta.url',
                        setup({ onLoad }) {
                            // Help vite that bundles/move files in dev mode without touching `import.meta.url` which breaks asset urls
                            onLoad({ filter: /.*\.js/, namespace: 'file' }, async args => {
                                const code = fs.readFileSync(args.path, 'utf8');

                                const assetImportMetaUrlRE = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g;
                                let i = 0;
                                let newCode = '';
                                for (let match = assetImportMetaUrlRE.exec(code); match != null; match = assetImportMetaUrlRE.exec(code)) {
                                    newCode += code.slice(i, match.index);
                                    const path = match[1].slice(1, -1);

                                    const resolved = await import.meta.resolve!(path, url.pathToFileURL(args.path));
                                    newCode += `new URL(${JSON.stringify(url.fileURLToPath(resolved))}, import.meta.url)`;
                                    i = assetImportMetaUrlRE.lastIndex;
                                }
                                newCode += code.slice(i);
                                return { contents: newCode };
                            });
                        }
                    }
                ]
            }
        },
        define: {
            rootDirectory: JSON.stringify(__dirname)
        },
        test: {
            pool: 'threads',
            poolOptions: {
                threads: {
                    isolate: true
                }
            },
            browser: {
                enabled: true,
                headless: true,
                name: 'chrome',
                api: {
                    port: 20101
                }
            }
        }
    };
    return config;
});

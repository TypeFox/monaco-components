import { defineConfig } from 'vite';
import path from 'path';
import typescript from '@rollup/plugin-typescript';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    resolve: {
        alias: [
            {
                find: 'vscode',
                replacement: path.resolve(__dirname, '../../node_modules/@codingame/monaco-languageclient/lib/vscode-compatibility')
            }
        ]
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'moned-lc',
            fileName: (format) => `moned-lc.${format}.js`,
            formats: ['es']
        },
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                name: 'moned-lc',
                exports: 'named',
                sourcemap: false,
                globals: {
                    vscode: 'vscode'
                },
            },
            plugins: [
                typescript({
                    target: 'esnext',
                    rootDir: resolvePath('./src'),
                    declaration: true,
                    declarationDir: resolvePath('./dist'),
                    sourceMap: false,
                    exclude: resolvePath('./node_modules'),
                    allowSyntheticDefaultImports: true
                })
            ]
        },
    },
    server: {
        port: 20003
    }
});

import { defineConfig } from 'vite';
import path from 'path';
import typescript from '@rollup/plugin-typescript';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'moned-full',
            fileName: (format) => `main.${format}.js`,
            formats: ['es']
        },
        cssCodeSplit: false,
        rollupOptions: {
            external: [],
            output: {
                inlineDynamicImports: true,
                name: 'moned-full',
                exports: 'named',
                sourcemap: false,
            },
            plugins: [
                typescript({
                    target: 'esnext',
                    rootDir: resolvePath('./src'),
                    declaration: true,
                    declarationDir: resolvePath('./dist'),
                    sourceMap: false,
                    exclude: resolvePath('./node_modules')
                })
            ]
        },
    },
    server: {
        port: 20002
    }
});

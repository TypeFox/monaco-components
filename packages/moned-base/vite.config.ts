import { defineConfig } from 'vite';
import path from 'path';
import typescript from '@rollup/plugin-typescript';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    build: {
        lib: {
            entry: resolvePath('src/main.ts'),
            name: 'moned-base',
            fileName: (format) => `main.${format}.js`,
            formats: ['es']
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                name: 'moned-base',
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
                    exclude: resolvePath('./node_modules'),
                    allowSyntheticDefaultImports: true
                })
            ]
        },
    },
    server: {
        port: 20001
    }
});

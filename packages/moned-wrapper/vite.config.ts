import { defineConfig } from 'vite';
import path from 'path';
import typescript from '@rollup/plugin-typescript';

const resolvePath = (str: string) => path.resolve(__dirname, str);

const config = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'moned-wrapper',
            fileName: (format) => `main.${format}.js`,
            formats: ['es']
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                name: 'moned-wrapper',
                exports: 'named'
            },
            plugins: [
                typescript({
                    'target': 'esnext',
                    'rootDir': resolvePath('./src'),
                    'declaration': true,
                    'declarationDir': resolvePath('./dist'),
                    'sourceMap': true,
                    exclude: resolvePath('./node_modules'),
                    allowSyntheticDefaultImports: true
                })
            ]
        }
    },
    server: {
        port: 20005
    }
});

export default config;

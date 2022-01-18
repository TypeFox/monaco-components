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
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                name: 'moned-full',
                exports: 'named',
                sourcemap: true
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
        },
    },
    server: {
        port: 20002
    }
});

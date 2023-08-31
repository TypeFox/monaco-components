import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        browser: {
            enabled: true,
            headless: true,
            name: 'chrome',
            provider: 'webdriverio'
        }
    }
});

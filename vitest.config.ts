import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            headless: true,
            name: 'chrome'
        }
    }
});

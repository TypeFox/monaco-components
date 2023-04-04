/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { registerExtension } from 'vscode/extensions';

export const loadAllDefaultThemes = async (targetDir: string) => {

    const defaultThemesExtensions = {
        name: 'theme-defaults',
        displayName: 'Default Themes',
        description: 'VS Code Default Themes',
        categories: [
            'Themes'
        ],
        version: '1.0.0',
        publisher: 'vscode',
        license: 'MIT',
        engines: {
            vscode: '*'
        },
        contributes: {
            themes: [
                {
                    id: 'Visual Studio Light',
                    label: 'Light (Visual Studio)',
                    uiTheme: 'vs-light',
                    path: './themes/light_vs.json',
                    extension: 'theme-defaults'
                },
                {
                    id: 'Default Light+',
                    label: 'Light+ (default light)',
                    uiTheme: 'vs-light',
                    path: './themes/light_plus.json',
                    extension: 'theme-defaults'
                },
                {
                    id: 'Light+ (Experimental)',
                    label: 'Light+ (Experimental)',
                    uiTheme: 'vs-light',
                    path: './themes/light_plus_experimental.json',
                    extension: 'theme-defaults'
                },
                {
                    id: 'Default High Contrast Light',
                    label: 'High Contrast Light',
                    uiTheme: 'hc-light',
                    path: './themes/hc_light.json'
                },
                {
                    id: 'Visual Studio Dark',
                    label: 'Dark (Visual Studio)',
                    uiTheme: 'vs-dark',
                    path: './themes/dark_vs.json',
                    extension: 'theme-defaults'
                },
                {
                    id: 'Default Dark+',
                    label: 'Dark+ (default dark)',
                    uiTheme: 'vs-dark',
                    path: './themes/dark_plus.json',
                    extension: 'theme-defaults'
                },
                {
                    id: 'Dark+ (Experimental)',
                    label: 'Dark+ (Experimental)',
                    uiTheme: 'vs-dark',
                    path: './themes/dark_plus_experimental.json',
                    extension: 'theme-defaults'
                },
                {
                    id: 'Default High Contrast Dark',
                    label: 'High Contrast Dark',
                    uiTheme: 'hc-black',
                    path: './themes/hc_black.json'
                }
            ]
        },
        repository: {
            type: 'git',
            url: 'https://github.com/microsoft/vscode.git'
        }
    };

    const fetchLocalTheme = async (url: string) => {
        const resp = await fetch(url);
        return resp.text();
    };

    const { registerFile: registerDefaultThemeExtensionFile } = registerExtension(defaultThemesExtensions);

    registerDefaultThemeExtensionFile('./themes/light_vs.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/light_vs.json', window.location.href).href);
    });
    registerDefaultThemeExtensionFile('./themes/light_plus.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/light_plus.json', window.location.href).href);
    });
    registerDefaultThemeExtensionFile('./themes/light_plus_experimental.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/light_plus_experimental.json', window.location.href).href);
    });
    registerDefaultThemeExtensionFile('./themes/hc_light.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/hc_light.json', window.location.href).href);
    });
    registerDefaultThemeExtensionFile('./themes/dark_vs.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/dark_vs.json', window.location.href).href);
    });
    registerDefaultThemeExtensionFile('./themes/dark_plus.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/dark_plus.json', window.location.href).href);
    });
    registerDefaultThemeExtensionFile('./themes/dark_plus_experimental.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/dark_plus_experimental.json', window.location.href).href);
    });
    registerDefaultThemeExtensionFile('./themes/hc_black.json', async () => {
        return fetchLocalTheme(new URL(targetDir + '/hc_black.json', window.location.href).href);
    });
};

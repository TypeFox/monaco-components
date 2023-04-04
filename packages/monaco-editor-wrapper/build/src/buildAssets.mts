import { fetchAllThemesFromGitHub } from '../../src/helpers/themeRemoteHelper.js';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'shelljs';

/**
 * Solves: __dirname is not defined in ES module scope
 */
export function getLocalDirectory() {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(__filename);
}

mkdir('-p', resolve(getLocalDirectory(), '../../resources/themes'));
await fetchAllThemesFromGitHub(resolve(getLocalDirectory(), '../../resources/themes'));

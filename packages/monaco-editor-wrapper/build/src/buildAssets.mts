import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Solves: __dirname is not defined in ES module scope
 */
export function getLocalDirectory() {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(__filename);
}

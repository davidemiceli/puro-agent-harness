import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MakerDeb } from '@electron-forge/maker-deb';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    outDir: './out-tmp',
    packagerConfig: {
        name: 'Puro', 
        executableName: 'puro',
        asar: true,
    },
    productName: 'Puro',
    makers: [
        new MakerDeb({
            config: {
                options: {
                    // name: 'puro',
                    maintainer: 'Davide Miceli',
                    homepage: 'https://github.com/davidemiceli/puro-agent-harness',
                    icon: path.join(__dirname, 'electron/assets/icons/icon_128.png'),
                    // icon: {
                    //     'scalable': './electron/assets/icons/puro.svg', // Recommended: best for Software Centers
                    //     '512x512': './electron/assets/icons/icon_512.png',
                    //     '128x128': './electron/assets/icons/icon_128.png',
                    //     '48x48': './electron/assets/icons/icon_48.png'
                    // },
                    categories: ['Utility'],
                    bin: 'puro',
                    desktop: {
                        Name: 'Puro',
                        Categories: ['Utility'],
                    },
                    copyrightFile: path.join(__dirname, 'LICENSE'),
                    license: 'AGPL-3.0', 
                    section: 'utils'
                }
            }
        })
    ]
};
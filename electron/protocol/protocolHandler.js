import { net } from 'electron/main';
import path from 'node:path';
import { pathToFileURL } from 'node:url';


export default (protocol, dirName, distRoot) => {

    // Handle the app protocol (serving the files)
    protocol.handle('app', async (request) => {
        try {
            const { pathname } = new URL(request.url);
            // NB, this checks for paths that escape the bundle, e.g.
            // app://bundle/../../secret_file.txt
            const relativePath = path.join(dirName, 'dist', pathname == '/' ? 'index.html' : pathname);
            const isNotSafe = relativePath.includes('..') || !relativePath.startsWith(distRoot);
            if (isNotSafe) return new Response('Not Found', { status: 400 });
            return net.fetch(pathToFileURL(relativePath).toString());
        } catch (err) {
            console.error('Protocol Error:', err);
            return new Response('Internal Server Error', { status: 500 });
        }
    });

};

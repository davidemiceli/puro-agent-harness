import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { exec as execCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { getCurrentWorkspace } from '../appWorkspaces.js';

const exec = promisify(execCallback);

export default {

    executeBash: async (event, command) => {
        try {
            const workspacePath = await getCurrentWorkspace();
            const { stdout, stderr } = await exec(command, {
                encoding: 'utf-8',
                maxBuffer: 1024 * 1024 * 10,
                timeout: 60 * 60 * 1000,
                cwd: workspacePath
            });
            const outMessage = [stdout, stderr].filter(Boolean).join('\n\n') || 'Command executed, no output.';
            const data = [`$ ${command}`, outMessage].join('\n\n');
            return { data, error: null };
        } catch (err) {
            const errorType = err.killed ? 'TIMEOUT ERROR' : 'EXECUTION ERROR';
            const stdOutRes = err.stdout || '';
            const stdErrRes = err.stderr || '';
            const errorMsg = `${errorType}: ${stdErrRes || err.message}`;
            const data = [`$ ${command}`, stdOutRes, errorMsg].filter(Boolean).join('\n\n');
            return { data, error: null };
        }
    },

    readFiles: async (event, filenames) => {
        const workspacePath = await getCurrentWorkspace();
        const results = [];
        const CONCURRENCY_LIMIT = 5;
        try {
            const resolvedWorkspacePath = path.resolve(workspacePath);
            for (let i = 0; i < filenames.length; i += CONCURRENCY_LIMIT) {
                const batch = filenames.slice(i, i + CONCURRENCY_LIMIT);
                const batchResults = await Promise.all(batch.map(async (filename) => {
                    const safePath = path.join(workspacePath, filename);
                    if (!safePath.startsWith(resolvedWorkspacePath)) {
                        throw new Error(`Access denied: ${filename} is outside the workspace.`);
                    }
                    const content = await readFile(safePath, 'utf-8');
                    return { filename, content };
                }));
                results.push(...batchResults);
            }
            return { data: results, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        }
    },

    writeFile: async (event, filename, content) => {
        try {
            const workspacePath = await getCurrentWorkspace();
            const safePath = path.join(workspacePath, filename);
            if (!safePath.startsWith(path.resolve(workspacePath))) {
                return { data: null, error: 'Access denied: writing outside workspace.' };
            }
            await writeFile(safePath, content, 'utf-8');
            return { data: `Successfully wrote ${filename}`, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }

};
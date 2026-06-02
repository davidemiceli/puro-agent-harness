import { describe, it, expect, vi, beforeEach } from 'vitest';
import fileHandlers from './fileHandlers.js';
import path from 'node:path';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';

// Create a temporary workspace for tests
const testWorkspacePath = '/tmp/puro-coding-agent-tests';

const mockDialog = {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn()
};

const mockGetCurrentWorkspace = vi.fn();

describe('fileHandlers', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        // Ensure the test workspace exists before each test
        await mkdir(testWorkspacePath, { recursive: true });
    });

    describe('fileSelect', () => {
        it('should return canceled state when dialog is canceled', async () => {
            mockDialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
            
            const handler = fileHandlers.fileSelect(mockDialog);
            const result = await handler(null, '/some/default/path');

            expect(result.data).toEqual([]);
            expect(result.error).toBeNull();
            expect(mockDialog.showOpenDialog).toHaveBeenCalledTimes(1);
        });

        it('should return file data when dialog is not canceled', async () => {
            const testFilePath = path.join(testWorkspacePath, 'test.txt');
            await writeFile(testFilePath, 'test content', 'utf-8');
            
            mockDialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [testFilePath] });
            
            const handler = fileHandlers.fileSelect(mockDialog);
            const result = await handler(null, undefined);
            
            expect(result.error).toBeNull();
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('test.txt');
            expect(result.data[0].content).toBe('test content');
        });

        it('should handle errors gracefully', async () => {
            mockDialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/nonexistent/file.txt'] });
            
            const handler = fileHandlers.fileSelect(mockDialog);
            const result = await handler(null, undefined);
            
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });
    });

    describe('folderSelect', () => {
        it('should return canceled state when dialog is canceled', async () => {
            mockDialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
            
            const handler = fileHandlers.folderSelect(mockDialog);
            const result = await handler(null, '/some/default/path');
            
            expect(result.data).toBeNull();
            expect(result.error).toBeNull();
        });

        it('should return selected folder path when not canceled', async () => {
            mockDialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [testWorkspacePath] });
            
            const handler = fileHandlers.folderSelect(mockDialog);
            const result = await handler(null, undefined);
            
            expect(result.error).toBeNull();
            expect(result.data).toBe(testWorkspacePath);
        });
    });

    describe('fileSelectFromWorkspace', () => {
        it('should return files with relative paths', async () => {
            const testFilePath = path.join(testWorkspacePath, 'test.txt');
            await writeFile(testFilePath, 'test content', 'utf-8');
            
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            mockDialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [testFilePath] });
            
            const handler = fileHandlers.fileSelectFromWorkspace(mockDialog, mockGetCurrentWorkspace);
            const result = await handler(null);
            
            expect(result.error).toBeNull();
            expect(result.data).toHaveLength(1);
            expect(result.data[0].path).toBe('test.txt'); // relative path
        });

        it('should return canceled state when dialog is canceled', async () => {
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            mockDialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
            
            const handler = fileHandlers.fileSelectFromWorkspace(mockDialog, mockGetCurrentWorkspace);
            const result = await handler(null);
            
            expect(result.data).toEqual([]);
        });
    });

    describe('fileSaveDialog', () => {
        it('should not save when dialog is canceled', async () => {
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            mockDialog.showSaveDialog.mockResolvedValue({ canceled: true, filePath: null });
            
            const handler = fileHandlers.fileSaveDialog(mockDialog, mockGetCurrentWorkspace);
            const result = await handler(null, 'test content');
            
            expect(result.data).toBe(false);
            expect(result.error).toBeNull();
        });

        it('should save content when dialog is not canceled', async () => {
            const savePath = path.join(testWorkspacePath, 'saved.txt');
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            mockDialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: savePath });
            
            const handler = fileHandlers.fileSaveDialog(mockDialog, mockGetCurrentWorkspace);
            const result = await handler(null, 'test content');
            
            expect(result.error).toBeNull();
            expect(result.data).toBe(true);
            
            // Verify the file was actually saved
            const savedContent = await readFile(savePath, 'utf-8');
            expect(savedContent).toBe('test content');
        });

        it('should handle save errors gracefully', async () => {
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            mockDialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/root/protected/file.txt' });
            
            const handler = fileHandlers.fileSaveDialog(mockDialog, mockGetCurrentWorkspace);
            const result = await handler(null, 'test content');
            
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });
    });

    describe('fileList', () => {
        it('should return empty list when no workspace is set', async () => {
            mockGetCurrentWorkspace.mockResolvedValue(null);
            
            const handler = fileHandlers.fileList(mockGetCurrentWorkspace);
            const result = await handler(null);
            
            expect(result.data).toEqual([]);
            expect(result.error).toBeNull();
        });

        it('should return files from workspace directory', async () => {
            const testFilePath = path.join(testWorkspacePath, 'file.txt');
            const testDir = path.join(testWorkspacePath, 'dir');
            await writeFile(testFilePath, 'content', 'utf-8');
            await mkdir(testDir, { recursive: true });
            
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            
            const handler = fileHandlers.fileList(mockGetCurrentWorkspace);
            const result = await handler(null);
            
            expect(result.error).toBeNull();
            expect(result.data).toEqual(
                expect.arrayContaining([
                    { relativePath: 'dir', isDirectory: true },
                    { relativePath: 'file.txt', isDirectory: false }
                ])
            );
        });

        it('should respect .aiignore patterns', async () => {
            const ignoredFile = path.join(testWorkspacePath, 'file.ignored.txt');
            const keptFile = path.join(testWorkspacePath, 'kept.txt');
            await writeFile(ignoredFile, 'ignored', 'utf-8');
            await writeFile(keptFile, 'kept', 'utf-8');
            await writeFile(path.join(testWorkspacePath, '.aiignore'), '*.ignored', 'utf-8');
            
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            
            const handler = fileHandlers.fileList(mockGetCurrentWorkspace);
            const result = await handler(null);
            
            expect(result.error).toBeNull();
            // Should contain kept.txt but not ignored.txt
            const relativePaths = result.data.map(item => item.relativePath);
            expect(relativePaths).not.toContain('ignored.txt');
            expect(relativePaths).toContain('kept.txt');
            
            // Cleanup
            await rm(path.join(testWorkspacePath, '.aiignore'));
        });
    });

    describe('fileContent', () => {
        it('should return file content when file exists', async () => {
            const testFile = path.join(testWorkspacePath, 'content.txt');
            await writeFile(testFile, 'test content', 'utf-8');
            
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            
            const handler = fileHandlers.fileContent(mockGetCurrentWorkspace);
            const result = await handler(null, 'content.txt');
            
            expect(result.error).toBeNull();
            expect(result.data).toBe('test content');
        });

        it('should handle file not found errors', async () => {
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            
            const handler = fileHandlers.fileContent(mockGetCurrentWorkspace);
            const result = await handler(null, 'nonexistent.txt');
            
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });
    });

    describe('fileSaveContent', () => {
        it('should save content to file', async () => {
            const testFile = path.join(testWorkspacePath, 'saveTest.txt');
            
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            
            const handler = fileHandlers.fileSaveContent(mockGetCurrentWorkspace);
            const result = await handler(null, 'saveTest.txt', 'new content');
            
            expect(result.error).toBeNull();
            expect(result.data).toBe(true);
            
            // Verify content was saved
            const savedContent = await readFile(testFile, 'utf-8');
            expect(savedContent).toBe('new content');
        });

        it('should handle save errors', async () => {
            mockGetCurrentWorkspace.mockResolvedValue(testWorkspacePath);
            
            const handler = fileHandlers.fileSaveContent(mockGetCurrentWorkspace);
            // Try to save to a path that will fail
            const result = await handler(null, '../root/protected/file.txt', 'content');
            
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });
    });
});

// Cleanup test directory after all tests
describe('cleanup', () => {
    it('should clean up test workspace', async () => {
        try {
            await rm(testWorkspacePath, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });
});

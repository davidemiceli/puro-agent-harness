import { describe, it, expect, vi, beforeEach } from 'vitest';
import agentRegistryHandlers from './agentRegistryHandlers.js';
import path from 'node:path';
import { writeFile, mkdir, rm } from 'node:fs/promises';


const testRegistryPath = '/tmp/puro-agent-registry-tests';
const mockSettings = {
    agent_registry_folder: testRegistryPath
};

const mockGetSettings = vi.fn();

beforeEach(async () => {
    vi.clearAllMocks();
    await mkdir(testRegistryPath, { recursive: true });
});

describe('agentRegistryList', () => {
    it('should return empty list when registry path is not set', async () => {
        mockGetSettings.mockResolvedValue({});
        
        const handler = agentRegistryHandlers.agentRegistryList(mockGetSettings);
        const result = await handler();
        
        expect(result.data).toEqual([]);
        expect(result.error).toBeNull();
    });

    it('should return files and directories from registry', async () => {
        await mkdir(path.join(testRegistryPath, 'agents'), { recursive: true });
        await writeFile(path.join(testRegistryPath, 'agent1.md'), 'content1');
        await writeFile(path.join(testRegistryPath, 'agents/agent2.md'), 'content2');
        
        mockGetSettings.mockResolvedValue(mockSettings);
        
        const handler = agentRegistryHandlers.agentRegistryList(mockGetSettings);
        const result = await handler();
        
        expect(result.error).toBeNull();
        expect(result.data.length).gt(0);
        
        // Check if directories and files are present
        const relativePaths = result.data.map(item => item.relativePath);
        expect(relativePaths).toContain('agent1.md');
        expect(relativePaths).toContain(path.join('agents', 'agent2.md'));
    });

    it('should handle errors gracefully', async () => {
        mockGetSettings.mockResolvedValue({ agent_registry_folder: '/nonexistent/path' });
        
        const handler = agentRegistryHandlers.agentRegistryList(mockGetSettings);
        const result = await handler();
        
        expect(result.data).toStrictEqual([]);
        expect(result.error).toBeNull();
    });
});

describe('agentRegistryGet', () => {
    it('should return null when registry path is not set', async () => {
        mockGetSettings.mockResolvedValue({});
        
        const handler = agentRegistryHandlers.agentRegistryGet(mockGetSettings);
        const result = await handler(null, 'agent.md');
        
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('should return file content with metadata for simple file', async () => {
        const content = `---
name: Test Agent
description: A test agent
---

This is the agent content.`;
        await writeFile(path.join(testRegistryPath, 'test-agent.md'), content);
        
        mockGetSettings.mockResolvedValue(mockSettings);
        
        const handler = agentRegistryHandlers.agentRegistryGet(mockGetSettings);
        const result = await handler(null, 'test-agent.md');
        
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe('Test Agent');
        expect(result.data.description).toBe('A test agent');
        expect(result.data.content).toBe('This is the agent content.');
    });

    it('should use filename as name if name is not in frontmatter', async () => {
        const content = `---
description: Just a description
---

Agent without name.`;
        await writeFile(path.join(testRegistryPath, 'no-name-agent.md'), content);
        
        mockGetSettings.mockResolvedValue(mockSettings);
        
        const handler = agentRegistryHandlers.agentRegistryGet(mockGetSettings);
        const result = await handler(null, 'no-name-agent.md');
        
        expect(result.error).toBeNull();
        expect(result.data.name).toBe('no-name-agent');
        expect(result.data.description).toBe('Just a description');
    });

    it('should return null if file does not exist', async () => {
        mockGetSettings.mockResolvedValue(mockSettings);
        
        const handler = agentRegistryHandlers.agentRegistryGet(mockGetSettings);
        const result = await handler(null, 'nonexistent.md');
        
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
    });
});

// Cleanup test directory after all tests
describe('cleanup', () => {
    it('should clean up test registry', async () => {
        try {
            await rm(testRegistryPath, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });
});

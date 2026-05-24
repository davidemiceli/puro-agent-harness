import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPromptStore } from './promptStoreFactory';


vi.mock('@/src/agent-engine/libs/prompt', () => {
    return {
        default: class Prompt {
            constructor() {
                this.parts = [];
            }
            addSystem(category, content) {
                this.parts.push({ type: 'system', category, content });
            }
            addContext(content, role, toolName) {
                this.parts.push({ type: 'context', content, role, toolName });
            }
            get() {
                return this.parts;
            }
        }
    };
});

vi.mock('@/src/agent-engine/tools/index', () => ({
    toolRegistry: {
        tool1: { name: 'tool1', displayName: 'Tool 1' },
        tool2: { name: 'tool2', displayName: 'Tool 2' }
    }
}));

describe('createPromptStore', () => {
    let storeFactory;
    let prompt;
    let promptActions;

    beforeEach(() => {
        storeFactory = createPromptStore();
        prompt = storeFactory.prompt;
        promptActions = storeFactory.promptActions;
    });

    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            expect(prompt.isRunning).toBe(false);
            expect(prompt.isLoaded).toBe(true);
            expect(prompt.system).toEqual([]);
            expect(prompt.context).toEqual([]);
            expect(prompt.tools).toHaveLength(2);
            expect(prompt.tools[0].name).toBe('tool1');
        });
    });

    describe('promptActions', () => {
        it('resetPrompt should reset the store to initial state', () => {
            promptActions.addPrompt('system', 'user', 'hello');
            promptActions.resetPrompt();
            expect(prompt.system).toHaveLength(0);
        });

        it('addPrompt should add a new prompt item to the specified key', () => {
            const content = 'test content';
            promptActions.addPrompt('system', 'user', content, { category: 'test-cat' });
            
            expect(prompt.system).toHaveLength(1);
            expect(prompt.system[0].content).toBe(content);
            expect(prompt.system[0].role).toBe('user');
            expect(prompt.system[0].category).toBe('test-cat');
            expect(prompt.system[0].included).toBe(true);
        });

        it('toggleIncludePrompt should toggle the included property', () => {
            promptActions.addPrompt('system', 'user', 'test');
            const id = prompt.system[0].id;
            
            expect(prompt.system[0].included).toBe(true);
            promptActions.toggleIncludePrompt('system', id);
            expect(prompt.system[0].included).toBe(false);
            promptActions.toggleIncludePrompt('system', id);
            expect(prompt.system[0].included).toBe(true);
        });

        it('addPromptFile should add a file prompt and wrap content in XML tags', () => {
            const filename = 'test.txt';
            const content = 'file content';
            promptActions.addPromptFile('context', filename, content);

            expect(prompt.context).toHaveLength(1);
            expect(prompt.context[0].filename).toBe(filename);
            expect(prompt.context[0].content).toContain(`<file name="${filename}">`);
            expect(prompt.context[0].content).toContain(content);
        });

        it('removePromptFile should remove the file by filename', () => {
            promptActions.addPromptFile('context', 'file1.txt', 'content');
            promptActions.addPromptFile('context', 'file2.txt', 'content');
            
            promptActions.removePromptFile('context', 'file1.txt');
            
            expect(prompt.context).toHaveLength(1);
            expect(prompt.context[0].filename).toBe('file2.txt');
        });

        it('toggleRolePrompt should cycle through user -> assistant -> system -> user', () => {
            promptActions.addPrompt('system', 'user', 'test');
            const id = prompt.system[0].id;

            promptActions.toggleRolePrompt('system', id);
            expect(prompt.system[0].role).toBe('assistant');

            promptActions.toggleRolePrompt('system', id);
            expect(prompt.system[0].role).toBe('system');

            promptActions.toggleRolePrompt('system', id);
            expect(prompt.system[0].role).toBe('user');
        });

        it('movePrompt should change the order of items', () => {
            promptActions.addPrompt('system', 'user', 'first');
            promptActions.addPrompt('system', 'user', 'second');
            
            const firstId = prompt.system[0].id;
            const secondId = prompt.system[1].id;

            // Move second item up (direction -1)
            promptActions.movePrompt('system', secondId, -1);

            expect(prompt.system[0].id).toBe(secondId);
            expect(prompt.system[1].id).toBe(firstId);
        });

        it('toggleTool should enable/disable a tool', () => {
            expect(prompt.tools[0].enabled).toBe(true);
            promptActions.toggleTool('tool1');
            expect(prompt.tools[0].enabled).toBe(false);
            promptActions.toggleTool('tool1');
            expect(prompt.tools[0].enabled).toBe(true);
        });

        it('buildPrompt and getBuiltPrompt should return processed prompt parts', () => {
            promptActions.addPrompt('system', 'user', 'sys content', { category: 'cat1' });
            promptActions.addPrompt('context', 'user', 'ctx content', { role: 'user' });
            
            // Set included to false for one to test filtering
            promptActions.toggleIncludePrompt('system', prompt.system[0].id);

            const built = promptActions.getBuiltPrompt();
            // Only context should be there because system was toggled to false
            expect(built).toHaveLength(1);
            expect(built[0].type).toBe('context');
            expect(built[0].content).toBe('ctx content');
        });

        it('getEnabledTools should return only names of enabled tools', () => {
            promptActions.toggleTool('tool1'); // disable tool1
            const enabled = promptActions.getEnabledTools();
            expect(enabled).toEqual(['tool2']);
        });

        it('updateResponse should update response text', () => {
            const msg = 'Hello World';
            promptActions.updateResponse(msg);
            expect(prompt.response).toBe(msg);
        });

        it('updateResponseError should update error text', () => {
            const err = 'Error occurred';
            promptActions.updateResponseError(err);
            expect(prompt.responseError).toBe(err);
        });
    });
});
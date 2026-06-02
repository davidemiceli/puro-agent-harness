import { createStore, unwrap } from 'solid-js/store';
import Prompt from '@/src/agent-engine/libs/prompt';
import { toolRegistry } from '@/src/agent-engine/tools/index';


export const createPromptStore = () => {

    const initialState = () => ({
        isRunning: false,
        isLoaded: true,
        tools: Object.values(toolRegistry).map(({name, displayName}) => ({name, displayName, enabled: true})),
        system: [],
        context: [],
        response: '',
        responseError: ''
    });

    const [prompt, setPrompt] = createStore(initialState());

    const promptActions = {

        getPromptById: (key, id) => prompt[key].find(o => o.id === id),

        getChat: () => prompt.context.filter(p => p.included && !p.filename && ['user', 'assistant'].includes(p.role)),

        resetPrompt: () => setPrompt(initialState()),

        resetPromptByKey: key => setPrompt(key, []),

        addPrompt: (key, role, content, args) => setPrompt(key, prompt[key].length, {
            id: self.crypto.randomUUID(),
            datetime: new Date().toISOString(), // When node.js lts will be > v26 use: Temporal.Now.instant().toString(),
            included: true,
            expanded: true,
            role,
            content,
            ...args ? args : {}
        }),
        
        togglePromptByName: (key, item) => setPrompt(key, l => {
            const exists = l.some((p) => p.name === item.name);
            if (exists) return l.filter((p) => p.name !== item.name);
            else return [...l, item];
        }),

        toggleIncludePrompt: (key, id) => setPrompt(
            key,
            o => o.id == id,
            'included',
            v => !v
        ),

        addPromptFile: (key, filename, content, opts) => setPrompt(key, a => [
            ...a.filter(o => o.id != filename),
            {
                id: self.crypto.randomUUID(),
                filename,
                datetime: new Date().toISOString(), // When node.js lts will be > v26 use: Temporal.Now.instant().toString(),
                included: true,
                expanded: false,
                role: 'user',
                ...opts ?? {},
                content: `<file name="${filename}">\n${content}\n</file>`
            }
        ]),

        removePromptFile: (key, filename) => setPrompt(key, a => a.filter(o => o.filename != filename)),

        clearPromptFiles: (key) => setPrompt(key, a => a.filter(o => !o.filename)),
        
        deleteFromPrompt: (key, id) => setPrompt(key, a => a.filter(o => o.id != id)),
        
        toggleRolePrompt: (key, id) => setPrompt(
            key,
            o => o.id == id,
            'role',
            v => v === 'user' ? 'assistant' : v === 'system' ? 'user' : 'system'
        ),
        
        editPrompt: (key, id, field, value) => setPrompt(key, o => o.id == id, field, value),

        editPromptData: (key, id, items) => setPrompt(key, o => o.id == id, p => ({ ...p, ...items })),

        moveItem: (arr, index, direction) => {
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= arr.length) return arr;
            [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
            return arr;
        },

        movePrompt: (key, id, direction) => {
            const currentIndex = prompt[key].findIndex(o => o.id === id);
            if (currentIndex === -1) return;
            setPrompt(key, () => {
                const currentList = [...prompt[key]];
                return promptActions.moveItem(currentList, currentIndex, direction);
            });
        },

        movePromptAtIndex: (key, fromIndex, toIndex) => setPrompt(key, () => {
            const list = [...prompt[key]];
            const [moved] = list.splice(fromIndex, 1);
            const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
            list.splice(adjustedTo, 0, moved);
            return list;
        }),

        toggleExpandPrompt: (key, id) => setPrompt(key, o => o.id == id, 'expanded', v => !v),

        toggleTool: name => {
            const index = prompt.tools.findIndex(t => t.name === name);
            if (index !== -1) setPrompt('tools', index, 'enabled', v => !v);
        },
        
        updateResponse: r => setPrompt('response', r),
        updateResponseError: r => setPrompt('responseError', r),

        buildPrompt: () => {
            const promptBuilder = new Prompt();
            prompt.system
                .filter(p => p.included)
                .forEach(p => promptBuilder.addSystem(p.category, p.content));
            prompt.context
                .filter(p => p.included)
                .forEach(p => promptBuilder.addContext(p.content, p.role, p.toolName));
            return promptBuilder;
        },

        getBuiltPrompt: () => unwrap(promptActions.buildPrompt().get()),

        getEnabledTools: () => prompt.tools.filter(tool => tool.enabled).map(tool => tool.name)

    };

    return { prompt, setPrompt, promptActions };
};

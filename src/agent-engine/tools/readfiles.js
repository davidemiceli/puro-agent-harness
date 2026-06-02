import ToolsAPIs from '@/src/services/tools';
import { promptActions } from '@/src/features/prompt/stores/promptStore';


const definition = {
    type: 'function',
    function: {
        name: 'read_files',
        description: 'Retrieves raw text content from one or more local files. Use this to gather context for your task (e.g. to inspect code, check configurations, etc).',
        parameters: {
            type: 'object',
            required: ['filenames'],
            properties: {
                filenames: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of relative file paths (e.g., ["src/app.ts"]).'
                }
            }
        },
    },
};

const handler = async ({filenames}) => await ToolsAPIs.readFiles(filenames);

const handleResult = async (toolName, _args, result) => {
    result.forEach(f => promptActions.addPromptFile('context', f.filename, f.content, {
        role: 'user',
        toolName
    }));
};

export default {
    name: definition.function.name,
    definition,
    handler,
    handleResult
};
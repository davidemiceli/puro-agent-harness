import { promptActions } from '@/src/features/prompt/stores/promptStore';

const definition = {
    type: 'function',
    function: {
        name: 'execute_bash',
        description: 'Executes a bash shell command and returns the output',
        parameters: {
            type: 'object',
            properties: {
                command: {
                    type: 'string',
                    description: 'The bash command to execute (e.g., "ls -la")',
                },
            },
            required: ['command'],
        },
    },
};

const handler = async ({command}) => command;

const handleResult = async (toolName, _args, result) => {
    promptActions.addPrompt('context', 'tool', result, { toolName });
};

export default {
    name: definition.function.name,
    definition,
    handler,
    handleResult
};

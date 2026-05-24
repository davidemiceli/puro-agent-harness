import ToolsAPIs from '@/src/services/tools';
import { promptActions } from '@/src/features/prompt/stores/promptStore';


const definition = {
    type: 'function',
    function: {
        name: 'write_file',
        description: 'Creates a new file or overwrites an existing file with the provided content. Automatically creates any missing parent directories in the path.',
        parameters: {
            type: 'object',
            required: ['filename', 'content'],
            properties: {
                filename: {
                    type: 'string',
                    description: 'The relative path where the file should be saved (e.g., "src/libs/helper.js"). Missing folders in the path will be created automatically.'
                },
                content: {
                    type: 'string',
                    description: 'The full text content to be written into the file.'
                }
            }
        }
    }
};

const handler = async ({filename, content}) => await ToolsAPIs.writeFile(filename, content);

const handleResult = async (toolName, {filename}, _) => {
    const msg = `Written ${filename} with success.`;
    promptActions.addPrompt('context', 'tool', msg, { toolName });
};

export default {
    name: definition.function.name,
    definition,
    handler,
    handleResult
};
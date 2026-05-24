import { createSignal } from 'solid-js';
import APIs from '@/src/services/apis';
import { promptActions } from '@/src/features/prompt/stores/promptStore';
import { category } from './stores/category';
import AgentContainer from '@/src/features/agent/components/AgentContainer';
import { Sidebar } from '@/src/features/agent/components/Sidebar';


export default function Agent() {
    const [selectedPaths, setSelectedPaths] = createSignal([]);

    const onSelectPath = newPath => setSelectedPaths(p => p.includes(newPath) ? p.filter(v => v != newPath) : [...p, newPath]);
    const deselectAllPaths = () => setSelectedPaths([]);

    const addSelectedPaths = async () => {
        for (const filename of selectedPaths()) {
            const { name, description, content } = await APIs.getFileAgentRegistry(filename);
            addSystemPrompt(filename, name, description, content);
        }
    };

    const removeSelectedPaths = async () => {
        for (const filename of selectedPaths()) {
            promptActions.removePromptFile('system', filename);
        }
    };

    const addPathToPrompt = async filename => {
        const { name, description, content } = await APIs.getFileAgentRegistry(filename);
        addSystemPrompt(filename, name, description, content);
    };

    const addSystemPrompt = (filename, name, description, content) => promptActions.addPrompt('system', 'system', content, {
        category: category.selectedCategory,
        name,
        description,
        filename
    });

    return <div class="flex flex-1 overflow-hidden">
        <Sidebar
            selectedPaths={selectedPaths}
            onSelectPath={onSelectPath}
            addSelectedPaths={addSelectedPaths}
            removeSelectedPaths={removeSelectedPaths}
            addPathToPrompt={addPathToPrompt}
            deselectAllPaths={deselectAllPaths}
        />

        <div class="flex flex-col flex-1 overflow-hidden px-4 py-2">
            <AgentContainer selectedPaths={selectedPaths} />
        </div>
    </div>;
}
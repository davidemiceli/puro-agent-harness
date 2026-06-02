
class Prompt {

    constructor(system, context) {
        this.system = system || [];
        this.context = context || [];
    }

    addSystem(category, content) {
        this.system.push({role: 'system', category, content});
        return this;
    }

    addContext(content, role, toolName) {
        this.context.push({
            role: role || 'user',
            ...toolName ? {} : {tool_name: toolName},
            content
        });
        return this;
    }

    get() {
        return [
            ...this.system,
            ...this.context
        ];
    }

    getAllContent() {
        return this.get().map(p => p.content).join('');
    }
}

export default Prompt;
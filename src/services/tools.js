import { BaseAPIs } from './base';


class ToolsAPIs extends BaseAPIs {

    async bash(command) {
        const resp = await window.api.tool.bash(command);
        return this.handleResponse(resp);
    }

    async readFiles(filenames) {
        const resp = await window.api.tool.readFiles(filenames);
        return this.handleResponse(resp);
    }

    async writeFile(filename, content) {
        const resp = await window.api.tool.writeFile(filename, content);
        return this.handleResponse(resp);
    }

}

export default new ToolsAPIs();

import bashTool from './bash';
import readFilesTool from './readfiles';
import writeFileTool from './writefile';

const allTools = [
    bashTool,
    readFilesTool,
    writeFileTool
];

export const toolRegistry = allTools.reduce((a, tool) => {
    a[tool.name] = tool;
    return a;
}, {});

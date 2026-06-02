import { contextBridge, ipcRenderer } from 'electron/main';


contextBridge.exposeInMainWorld('api', {
    settings: {
        get: () => ipcRenderer.invoke('api:settings-get'),
        default: () => ipcRenderer.invoke('api:settings-default'),
        save: (data) => ipcRenderer.invoke('api:settings-save', data)
    },
    workspace: {
        get: () => ipcRenderer.invoke('api:workspace-get'),
        delete: path => ipcRenderer.invoke('api:workspace-delete', path),
        add: path => ipcRenderer.invoke('api:workspace-add', path),
        open: () => ipcRenderer.invoke('api:workspace-open')
    },
    session: {
        list: () => ipcRenderer.invoke('api:session-list'),
        load: name => ipcRenderer.invoke('api:session-load', name),
        save: (name, data) => ipcRenderer.invoke('api:session-save', name, data),
        delete: name => ipcRenderer.invoke('api:session-delete', name)
    },
    clipboard: {
        copy: text => ipcRenderer.invoke('api:copy-to-clipboard', text)
    },
    browser: {
        open: url => ipcRenderer.invoke('api:open-browser', url)
    },
    dialog: {
        saveConfirmation: name => ipcRenderer.invoke('api:save-confirmation', name),
        actionConfirmation: (title, message) => ipcRenderer.invoke('api:action-confirmation', title, message),
        notifySuccess: msg => ipcRenderer.send('api:notify-success', msg),
        notifyError: msg => ipcRenderer.send('api:notify-error', msg)
    },
    agentRegistry: {
        list: () => ipcRenderer.invoke('api:agent-registry-list'),
        get: filename => ipcRenderer.invoke('api:agent-registry-get', filename)
    },
    folder: {
        select: defaultPath => ipcRenderer.invoke('api:folder-select', defaultPath),
        list: () => ipcRenderer.invoke('api:folder-list')
    },
    file: {
        select: () => ipcRenderer.invoke('api:file-select'),
        selectFromWorkspace: () => ipcRenderer.invoke('api:file-select-from-workspace'),
        saveDialog: content => ipcRenderer.invoke('api:file-save-dialog', content),
        save: (filename, content) => ipcRenderer.invoke('api:file-save-content', filename, content),
        getContent: filename => ipcRenderer.invoke('api:file-content', filename),
        list: () => ipcRenderer.invoke('api:file-list')
    },
    tool: {
        bash: command => ipcRenderer.invoke('api:tool-execute-bash', command),
        readFiles: filenames => ipcRenderer.invoke('api:tool-read-files', filenames),
        writeFile: (filename, content) => ipcRenderer.invoke('api:tool-write-file', filename, content)
    }
});

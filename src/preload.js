const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zero', {
  getUpdateStatus: () => ipcRenderer.invoke('updates:get-status'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  onUpdateStatus: callback => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('updates:status', listener);
    return () => ipcRenderer.removeListener('updates:status', listener);
  }
});

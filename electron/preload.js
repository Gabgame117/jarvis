const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ares', {
  getConfig: () => ipcRenderer.invoke('ares:get-config'),
  saveConfig: config => ipcRenderer.invoke('ares:save-config', config),
  askLocal: (messages, model) => ipcRenderer.invoke('ares:ask-local', messages, model),
  askOnline: messages => ipcRenderer.invoke('ares:ask-online', messages)
});

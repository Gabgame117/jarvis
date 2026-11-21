const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ares', {
  askOnline: text => ipcRenderer.invoke('ask-online', text)
});

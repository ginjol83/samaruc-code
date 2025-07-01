// Preload script para exponer APIs de Electron de forma segura
const { contextBridge, ipcRenderer } = require('electron');

// Exponer ipcRenderer al contexto de la ventana
contextBridge.exposeInMainWorld('electronAPI', {
  // Métodos IPC
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, func),
  
  // Métodos específicos para el IDE
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  updateTitle: (title) => ipcRenderer.send('update-window-title', title),
  
  // Información del sistema
  isElectron: true,
  platform: process.platform
});

// Para compatibilidad con el código existente, también exponer directamente
window.require = require;

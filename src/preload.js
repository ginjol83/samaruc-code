// Preload script para exponer APIs de Electron de forma segura
const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Preload script cargado correctamente');

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
  
  // Métodos para el explorador de archivos
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  checkPathExists: (filePath) => ipcRenderer.invoke('check-path-exists', filePath),
  
  // Métodos para compilación
  showCompileSdkDialog: () => {
    console.log('🔨 Llamando a show-compile-sdk-dialog desde preload');
    return ipcRenderer.invoke('show-compile-sdk-dialog');
  },
  showCompileOptionsDialog: (sdkName) => {
    console.log('⚙️ Llamando a show-compile-options-dialog desde preload');
    return ipcRenderer.invoke('show-compile-options-dialog', sdkName);
  },
  
  // Información del sistema
  isElectron: true,
  platform: process.platform
});

console.log('🔧 electronAPI expuesto correctamente al contexto de la ventana');

// Para compatibilidad con el código existente, también exponer directamente
window.require = require;

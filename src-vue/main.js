import { createApp } from 'vue'
import App from './App.vue'

// Configurar API de Electron en el renderer process
window.electronAPI = {
  // IPC calls
  compileProject: (projectPath, mainFile) => window.ipcRenderer.invoke('compile-project', projectPath, mainFile),
  runExecutable: (executablePath) => window.ipcRenderer.invoke('run-executable', executablePath),
  readFile: (filePath) => window.ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => window.ipcRenderer.invoke('write-file', filePath, content),
  listDirectory: (dirPath) => window.ipcRenderer.invoke('list-directory', dirPath),
  createDirectory: (dirPath) => window.ipcRenderer.invoke('create-directory', dirPath),
  fileExists: (filePath) => window.ipcRenderer.invoke('file-exists', filePath),
  showSaveDialog: (options) => window.ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => window.ipcRenderer.invoke('show-open-dialog', options),
  
  // IPC listeners
  onMenuAction: (callback) => {
    window.ipcRenderer.on('menu-new-project', callback)
    window.ipcRenderer.on('menu-open-project', callback)
    window.ipcRenderer.on('menu-save', callback)
    window.ipcRenderer.on('menu-compile', callback)
    window.ipcRenderer.on('menu-compile-run', callback)
    window.ipcRenderer.on('menu-template', callback)
  }
}

// Configurar acceso a require si está disponible
if (typeof require !== 'undefined') {
  window.ipcRenderer = require('electron').ipcRenderer
} else {
  console.warn('Electron IPC no disponible - ejecutando en modo web')
}

// Crear y montar la aplicación Vue
const app = createApp(App)

app.mount('#app')

// fileManager.js - Gestión de archivos y proyectos
// Samaruc Code - IDE para desarrollo de juegos retro

// Variables de gestión de archivos
let electronIpc = null;
let recentFiles = [];

// Inicializar IPC de Electron de forma segura
function initializeElectronIpc() {
    try {
        // Verificar si estamos en un contexto de Electron
        if (window.require && window.process && window.process.versions && window.process.versions.electron) {
            const { ipcRenderer } = window.require('electron');
            electronIpc = ipcRenderer;
            console.log('Electron IPC inicializado correctamente');
            return true;
        }
        
        // NO usar require('electron') directo ya que causa conflictos con AMD
        console.log('No se detectó contexto de Electron válido');
        
    } catch (error) {
        console.warn('No se pudo inicializar Electron IPC:', error.message);
    }
    
    console.log('Ejecutándose en modo navegador web - funcionalidad limitada');
    return false;
}

// Crear nuevo archivo
function createNewFile() {
    const fileName = prompt('Nombre del archivo:', 'main.c');
    if (!fileName) return;
    
    const filePath = window.safePath?.join(window.currentProject || 'nuevo-proyecto', fileName) || fileName;
    const defaultContent = fileName.endsWith('.c') ? 
        '// Nuevo archivo\n#include <stdio.h>\n\nint main() {\n    printf("Hola mundo!\\n");\n    return 0;\n}' :
        '// Nuevo archivo\n';
    
    window.openFileInEditor?.(filePath, defaultContent, true);
}

// Abrir archivo principal
async function openFile() {
    console.log('openFile() llamada');
    window.addOutputLine?.('Intentando abrir archivo...', 'info');
    
    try {
        // Usar el IPC cacheado
        if (electronIpc) {
            console.log('Usando Electron IPC...');
            
            // Enviar solicitud al proceso principal para abrir diálogo
            const result = await electronIpc.invoke('show-open-dialog', {
                properties: ['openFile'],
                filters: [
                    { name: 'Archivos C/C++', extensions: ['c', 'h', 'cpp', 'hpp', 'cc', 'cxx', 'c++', 'hh', 'hxx', 'h++'] },
                    { name: 'Archivos C', extensions: ['c', 'h'] },
                    { name: 'Archivos C++', extensions: ['cpp', 'hpp', 'cc', 'cxx', 'c++', 'hh', 'hxx', 'h++'] },
                    { name: 'Archivos JavaScript/TypeScript', extensions: ['js', 'jsx', 'ts', 'tsx', 'json'] },
                    { name: 'Archivos Web', extensions: ['html', 'htm', 'css', 'scss', 'sass', 'less'] },
                    { name: 'Archivos Python', extensions: ['py', 'pyx', 'pyi'] },
                    { name: 'Archivos de configuración', extensions: ['json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf'] },
                    { name: 'Archivos de script', extensions: ['sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'] },
                    { name: 'Archivos de documentación', extensions: ['md', 'markdown', 'txt', 'log', 'readme'] },
                    { name: 'Archivos de construcción', extensions: ['cmake', 'makefile', 'dockerfile'] },
                    { name: 'Todos los archivos', extensions: ['*'] }
                ],
                title: 'Abrir archivo de código'
            });
            
            console.log('Resultado del diálogo:', result);
            
            if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                window.addOutputLine?.(`Abriendo archivo: ${filePath}`, 'info');
                
                const content = await electronIpc.invoke('read-file', filePath);
                console.log('Contenido del archivo recibido');
                
                if (content.success) {
                    window.openFileInEditor?.(filePath, content.content);
                    window.addOutputLine?.(`Archivo abierto correctamente: ${window.safePath?.basename(filePath) || filePath}`, 'success');
                } else {
                    window.addOutputLine?.(`Error al leer archivo: ${content.error}`, 'error');
                }
                return;
            } else if (result.canceled) {
                window.addOutputLine?.('Operación cancelada por el usuario', 'info');
                return;
            }
        } else {
            window.addOutputLine?.('Electron IPC no disponible, usando fallback...', 'warning');
        }
    } catch (error) {
        console.error('Error con API de Electron:', error);
        window.addOutputLine?.(`Error con API de Electron: ${error.message}`, 'error');
        window.addOutputLine?.('Usando método alternativo para abrir archivos...', 'warning');
    }
    
    // Fallback: usar input file dialog del navegador
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.c,.h,.cpp,.hpp,.cc,.cxx,.c++,.hh,.hxx,.h++,.js,.jsx,.ts,.tsx,.json,.html,.htm,.css,.scss,.sass,.less,.py,.pyx,.pyi,.java,.cs,.php,.rb,.go,.rs,.swift,.kt,.sh,.bash,.zsh,.fish,.ps1,.bat,.cmd,.xml,.yaml,.yml,.toml,.ini,.cfg,.conf,.md,.markdown,.txt,.log,.cmake,.makefile,.dockerfile,.sql,.r,.m,.mm,*';
    input.multiple = false;
    input.style.display = 'none';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            window.addOutputLine?.(`Cargando archivo: ${file.name}`, 'info');
            
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    const tempPath = file.name;
                    window.openFileInEditor?.(tempPath, content, true);
                    window.addOutputLine?.(`Archivo cargado: ${file.name}`, 'success');
                };
                
                reader.onerror = () => {
                    window.addOutputLine?.(`Error al leer el archivo: ${file.name}`, 'error');
                };
                
                reader.readAsText(file, 'utf-8');
            } catch (error) {
                window.addOutputLine?.(`Error al procesar archivo: ${error.message}`, 'error');
            }
        }
    };
    
    input.oncancel = () => {
        window.addOutputLine?.('Selección de archivo cancelada', 'info');
    };
    
    // Agregar al DOM temporalmente y hacer clic
    document.body.appendChild(input);
    input.click();
    
    // Limpiar después de un tiempo
    setTimeout(() => {
        if (document.body.contains(input)) {
            document.body.removeChild(input);
        }
    }, 1000);
}

// Abrir archivo desde ruta
async function openFileFromPath(filePath) {
    if (!filePath) return;
    
    try {
        if (electronIpc) {
            const content = await electronIpc.invoke('read-file', filePath);
            if (content.success) {
                window.openFileInEditor?.(filePath, content.content);
                addToRecentFiles(filePath);
                return;
            } else {
                window.addOutputLine?.(`Error al leer archivo: ${content.error}`, 'error');
            }
        }
    } catch (error) {
        console.error('Error abriendo archivo desde ruta:', error);
        window.addOutputLine?.(`Error abriendo archivo: ${error.message}`, 'error');
    }
}

// Guardar archivo actual
async function saveCurrentFile() {
    if (!window.activeFile) {
        window.addOutputLine?.('No hay archivo activo para guardar', 'warning');
        return;
    }
    
    await saveFile(window.activeFile);
}

// Guardar archivo específico
async function saveFile(filePath) {
    if (!filePath) return;
    
    const fileData = window.openFiles?.get(filePath);
    if (!fileData) {
        window.addOutputLine?.('Archivo no encontrado en la lista de archivos abiertos', 'error');
        return;
    }
    
    try {
        const content = window.getCurrentEditorContent?.() || fileData.content;
        
        if (electronIpc) {
            const result = await electronIpc.invoke('save-file', filePath, content);
            if (result.success) {
                // Marcar como guardado
                fileData.modified = false;
                fileData.isNew = false;
                window.updateTabTitle?.(filePath);
                
                window.addOutputLine?.(`Archivo guardado: ${window.safePath?.basename(filePath) || filePath}`, 'success');
                addToRecentFiles(filePath);
            } else {
                window.addOutputLine?.(`Error al guardar archivo: ${result.error}`, 'error');
            }
        } else {
            // Fallback: descargar archivo
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = window.safePath?.basename(filePath) || 'archivo.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            window.addOutputLine?.(`Archivo descargado: ${a.download}`, 'info');
        }
    } catch (error) {
        console.error('Error guardando archivo:', error);
        window.addOutputLine?.(`Error guardando archivo: ${error.message}`, 'error');
    }
}

// Gestión de archivos recientes
function addToRecentFiles(filePath) {
    if (!filePath) return;
    
    // Remover si ya existe
    recentFiles = recentFiles.filter(f => f !== filePath);
    
    // Añadir al principio
    recentFiles.unshift(filePath);
    
    // Mantener solo los últimos 10
    recentFiles = recentFiles.slice(0, 10);
    
    // Guardar en localStorage
    try {
        localStorage.setItem('samaruc-recent-files', JSON.stringify(recentFiles));
    } catch (error) {
        console.warn('Error guardando archivos recientes:', error);
    }
    
    // Actualizar UI
    updateRecentFilesUI();
}

function initializeRecentFiles() {
    try {
        // Recuperar archivos recientes del localStorage
        recentFiles = JSON.parse(localStorage.getItem('samaruc-recent-files') || '[]');
        updateRecentFilesUI();
        console.log('Archivos recientes inicializados:', recentFiles.length);
    } catch (error) {
        console.warn('Error inicializando archivos recientes:', error);
        recentFiles = [];
    }
}

function updateRecentFilesUI() {
    const recentMenu = document.getElementById('recent-files-menu');
    if (!recentMenu) return;
    
    recentMenu.innerHTML = '';
    
    if (recentFiles.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'menu-item disabled';
        emptyItem.textContent = 'No hay archivos recientes';
        recentMenu.appendChild(emptyItem);
    } else {
        recentFiles.forEach(filePath => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.textContent = window.safePath?.basename(filePath) || filePath;
            item.title = filePath;
            item.onclick = () => openFileFromPath(filePath);
            recentMenu.appendChild(item);
        });
    }
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.electronIpc = electronIpc;
    window.recentFiles = recentFiles;
    
    window.initializeElectronIpc = initializeElectronIpc;
    window.createNewFile = createNewFile;
    window.openFile = openFile;
    window.openFileFromPath = openFileFromPath;
    window.saveCurrentFile = saveCurrentFile;
    window.saveFile = saveFile;
    window.addToRecentFiles = addToRecentFiles;
    window.initializeRecentFiles = initializeRecentFiles;
    window.updateRecentFilesUI = updateRecentFilesUI;
}

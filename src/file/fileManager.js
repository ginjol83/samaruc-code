// fileManager.js - Gestión de archivos y proyectos
// SamaruC Code - IDE para desarrollo de juegos retro

// Variables de gestión de archivos
let electronIpc = null;
let recentFiles = [];
let currentProjectPath = null;
let projectFiles = [];

// Variables para archivo único (simplificado)
let currentFileName = 'nuevo_archivo.c';
let currentFileContent = '';
let isFileModified = false;

// Inicializar IPC de Electron de forma segura
function initializeElectronIpc() {
    try {
        // Estrategia 1: Usar electronAPI del preload (más seguro)
        if (window.electronAPI) {
            electronIpc = window.electronAPI;
            console.log('✅ Electron IPC inicializado con electronAPI');
            return true;
        }
        
        // Estrategia 2: Verificar contexto de Electron directo
        if (window.require && window.process && window.process.versions && window.process.versions.electron) {
            const { ipcRenderer } = window.require('electron');
            electronIpc = ipcRenderer;
            console.log('✅ Electron IPC inicializado con require directo');
            return true;
        }
        
        // Estrategia 3: Verificar si ya está expuesto globalmente
        if (window.ipcRenderer) {
            electronIpc = window.ipcRenderer;
            console.log('✅ Electron IPC inicializado con ipcRenderer global');
            return true;
        }
        
        console.log('⚠️ No se detectó contexto de Electron válido');
        
    } catch (error) {
        console.warn('❌ No se pudo inicializar Electron IPC:', error.message);
    }
    
    console.log('🌐 Ejecutándose en modo navegador web - funcionalidad limitada');
    return false;
}

// Inicializar IPC inmediatamente al cargar el módulo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Inicializando IPC desde fileManager...');
    initializeElectronIpc();
});

// También intentar inicializar después de un breve delay
setTimeout(() => {
    if (!electronIpc) {
        console.log('🔄 Reintentando inicialización de IPC...');
        initializeElectronIpc();
    }
}, 500);

// Función para actualizar el título del archivo
function updateFileTitle(fileName = null) {
    const titleElement = document.getElementById('current-file-name');
    if (titleElement) {
        const displayName = fileName || currentFileName;
        const modifiedIndicator = isFileModified ? ' • ' : '';
        titleElement.textContent = `${displayName}${modifiedIndicator}`;
    }
}

// Función para marcar archivo como modificado
function markFileAsModified(modified = true) {
    isFileModified = modified;
    updateFileTitle();
    
    // Actualizar contenido actual del editor
    if (window.monacoInstance && window.monacoInstance.getValue) {
        currentFileContent = window.monacoInstance.getValue();
    }
}

// Función simplificada para crear nuevo archivo
function createNewFile() {
    console.log('📝 Creando nuevo archivo...');
    window.addOutputLine?.('📝 Nuevo archivo creado', 'info');
    
    currentFileName = 'nuevo_archivo.c';
    currentFileContent = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;
    isFileModified = false;
    
    // Actualizar editor si está disponible
    if (window.monacoInstance && window.monacoInstance.setValue) {
        window.monacoInstance.setValue(currentFileContent);
    }
    
    updateFileTitle();
}

// Función simplificada para abrir archivo
async function openFile() {
    console.log('📁 Abriendo archivo...');
    window.addOutputLine?.('📁 Abriendo selector de archivos...', 'info');
    
    if (!electronIpc) {
        window.addOutputLine?.('❌ Función de abrir archivo no disponible en modo navegador', 'error');
        return;
    }
    
    try {
        const result = await electronIpc.invoke('show-open-dialog', {
            properties: ['openFile'],
            filters: [
                { name: 'Archivos C', extensions: ['c', 'h'] },
                { name: 'Todos los archivos', extensions: ['*'] }
            ],
            title: 'Abrir archivo de código'
        });
        
        if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            await loadFileFromPath(filePath);
        } else {
            window.addOutputLine?.('📁 Operación cancelada', 'info');
        }
    } catch (error) {
        console.error('❌ Error abriendo archivo:', error);
        window.addOutputLine?.(`❌ Error abriendo archivo: ${error.message}`, 'error');
    }
}

// Función para cargar archivo desde ruta
async function loadFileFromPath(filePath) {
    try {
        window.addOutputLine?.(`📄 Cargando archivo: ${filePath}`, 'info');
        
        const result = await electronIpc.invoke('read-file', filePath);
        
        if (result.success) {
            currentFileName = filePath.split(/[/\\]/).pop(); // Obtener solo el nombre del archivo
            currentFileContent = result.content;
            isFileModified = false;
            
            // Actualizar editor si está disponible
            if (window.monacoInstance && window.monacoInstance.setValue) {
                window.monacoInstance.setValue(currentFileContent);
            }
            
            updateFileTitle();
            window.addOutputLine?.(`✅ Archivo cargado: ${currentFileName}`, 'success');
        } else {
            window.addOutputLine?.(`❌ Error leyendo archivo: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error cargando archivo:', error);
        window.addOutputLine?.(`❌ Error cargando archivo: ${error.message}`, 'error');
    }
}

// Función simplificada para guardar archivo
async function saveCurrentFile() {
    console.log('💾 Guardando archivo...');
    window.addOutputLine?.('💾 Guardando archivo...', 'info');
    
    // Actualizar contenido desde el editor
    if (window.monacoInstance && window.monacoInstance.getValue) {
        currentFileContent = window.monacoInstance.getValue();
    }
    
    if (!electronIpc) {
        // Modo navegador: simular guardado
        window.addOutputLine?.(`💾 Archivo simulado guardado: ${currentFileName}`, 'success');
        isFileModified = false;
        updateFileTitle();
        return;
    }
    
    try {
        // Si es un archivo nuevo, pedir dónde guardarlo
        if (currentFileName === 'nuevo_archivo.c' || !currentFileName.includes('.')) {
            const result = await electronIpc.invoke('show-save-dialog', {
                filters: [
                    { name: 'Archivos C', extensions: ['c'] },
                    { name: 'Archivos Header', extensions: ['h'] },
                    { name: 'Todos los archivos', extensions: ['*'] }
                ],
                defaultPath: currentFileName,
                title: 'Guardar archivo como'
            });
            
            if (result.canceled) {
                window.addOutputLine?.('💾 Guardado cancelado', 'info');
                return;
            }
            
            currentFileName = result.filePath.split(/[/\\]/).pop();
            await saveToPath(result.filePath);
        } else {
            // Guardar en ubicación actual (aquí necesitaríamos la ruta completa)
            window.addOutputLine?.(`💾 Guardando ${currentFileName}...`, 'info');
            isFileModified = false;
            updateFileTitle();
            window.addOutputLine?.(`✅ Archivo guardado: ${currentFileName}`, 'success');
        }
    } catch (error) {
        console.error('❌ Error guardando archivo:', error);
        window.addOutputLine?.(`❌ Error guardando archivo: ${error.message}`, 'error');
    }
}

// Función para guardar en ruta específica
async function saveToPath(filePath) {
    try {
        const result = await electronIpc.invoke('write-file', filePath, currentFileContent);
        
        if (result.success) {
            isFileModified = false;
            updateFileTitle();
            window.addOutputLine?.(`✅ Archivo guardado: ${currentFileName}`, 'success');
        } else {
            window.addOutputLine?.(`❌ Error guardando archivo: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error guardando archivo:', error);
        window.addOutputLine?.(`❌ Error guardando archivo: ${error.message}`, 'error');
    }
}

// Crear nuevo archivo (versión fileManager - NO USAR, usar la de index.html)
function createNewFileFromManager() {
    // NO usar prompt() en Electron - generar nombre automático
    const fileName = `nuevo${Date.now()}.c`; // Nombre único basado en timestamp
    
    const filePath = window.safePath?.join(window.currentProject || 'nuevo-proyecto', fileName) || `temp://${fileName}`;
    const defaultContent = fileName.endsWith('.c') ? 
        `// Nuevo archivo: ${fileName}\n#include <stdio.h>\n\nint main() {\n    printf("¡Hola desde ${fileName}!\\n");\n    return 0;\n}` :
        '// Nuevo archivo\n';
    
    console.log('📄 Creando nuevo archivo desde fileManager:', fileName);
    
    // Usar el sistema de pestañas
    if (window.openFileInEditor) {
        window.openFileInEditor(filePath, defaultContent, true);
    } else {
        // Error si no está disponible
        console.error('openFileInEditor no está disponible');
        window.addOutputLine?.(`Error: No se pudo crear el archivo ${fileName} - Editor no disponible`, 'error');
    }
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
    // Usar el sistema de pestañas global
    if (!window.activeFile) {
        window.addOutputLine?.('No hay archivo activo para guardar', 'warning');
        return;
    }
    
    await saveFile(window.activeFile);
}

// Guardar archivo específico
async function saveFile(filePath) {
    if (!filePath) return;
    
    // Usar el sistema de pestañas global
    const fileData = window.openFiles?.get(filePath);
    if (!fileData) {
        window.addOutputLine?.('Archivo no encontrado en la lista de archivos abiertos', 'error');
        return;
    }
    
    try {
        const content = window.getEditorContent?.() || fileData.content;
        
        if (electronIpc) {
            const result = await electronIpc.invoke('save-file', filePath, content);
            if (result.success) {
                // Marcar como guardado usando el sistema de pestañas
                window.markFileAsSaved?.(filePath);
                
                window.addOutputLine?.(`Archivo guardado: ${window.safePath?.basename(filePath) || filePath}`, 'success');
                addToRecentFiles(filePath);
            } else {
                window.addOutputLine?.(`Error al guardar archivo: ${result.error}`, 'error');
            }
        } else {
            // Fallback: descargar archivo
            const fileName = filePath.split(/[\/\\]/).pop() || 'archivo.txt';
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
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

// ===== EXPLORADOR DE ARCHIVOS =====

// Abrir proyecto (carpeta)
async function openProject() {
    console.log('📁 Abriendo proyecto...');
    
    // Reintentar inicialización de IPC si no está disponible
    if (!electronIpc) {
        console.log('🔄 IPC no disponible, reintentando inicialización...');
        const success = initializeElectronIpc();
        if (!success) {
            console.warn('❌ Electron IPC no disponible - no se puede abrir proyecto');
            window.addOutputLine?.('❌ Error: Función no disponible en modo navegador', 'error');
            return;
        }
    }
    
    try {
        const result = await invokeIpc('open-folder-dialog');
        
        if (result.canceled) {
            console.log('📁 Selección de proyecto cancelada');
            return;
        }
        
        if (result.filePaths && result.filePaths.length > 0) {
            const projectPath = result.filePaths[0];
            console.log('📁 Proyecto seleccionado:', projectPath);
            
            await loadProject(projectPath);
        }
    } catch (error) {
        console.error('❌ Error abriendo proyecto:', error);
        window.addOutputLine?.(`❌ Error abriendo proyecto: ${error.message}`, 'error');
    }
}

// Cargar proyecto en el explorador
async function loadProject(projectPath) {
    console.log('📂 Cargando proyecto:', projectPath);
    
    try {
        // Verificar que el directorio existe
        const pathCheck = await invokeIpc('check-path-exists', projectPath);
        
        if (!pathCheck.success || !pathCheck.exists) {
            throw new Error('El directorio no existe');
        }
        
        if (!pathCheck.isDirectory) {
            throw new Error('La ruta seleccionada no es un directorio');
        }
        
        // Cargar archivos del proyecto
        const result = await invokeIpc('read-directory', projectPath);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        currentProjectPath = projectPath;
        projectFiles = result.items;
        
        // Actualizar interfaz
        updateFileExplorer();
        
        const projectName = projectPath.split(/[\/\\]/).pop();
        window.addOutputLine?.(`📁 Proyecto "${projectName}" cargado correctamente`, 'success');
        
    } catch (error) {
        console.error('❌ Error cargando proyecto:', error);
        window.addOutputLine?.(`❌ Error cargando proyecto: ${error.message}`, 'error');
    }
}

// Actualizar el explorador de archivos
function updateFileExplorer() {
    const fileExplorer = document.getElementById('file-explorer');
    
    if (!fileExplorer) {
        console.warn('Elemento file-explorer no encontrado');
        return;
    }
    
    // Limpiar explorador
    fileExplorer.innerHTML = '';
    
    if (!currentProjectPath || !projectFiles.length) {
        // Mostrar mensaje de "no hay proyecto"
        fileExplorer.innerHTML = `
            <div class="no-project">
                <p>No hay proyecto abierto</p>
                <button id="open-project-btn" class="btn btn-secondary">
                    <span class="icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8H16l.305-3.234A2 2 0 0 0 14.31 3H9.5l-1-1h-5A1 1 0 0 0 .5 3z"/>
                            <path d="M9.5 10.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-3z"/>
                        </svg>
                    </span> Abrir Proyecto
                </button>
            </div>
        `;
        
        // Reasignar event listener
        const openBtn = document.getElementById('open-project-btn');
        if (openBtn) {
            openBtn.addEventListener('click', openProject);
        }
        
        return;
    }
    
    // Mostrar archivos del proyecto
    const projectName = currentProjectPath.split(/[\/\\]/).pop();
    
    // Crear header del proyecto
    const projectHeader = document.createElement('div');
    projectHeader.className = 'project-header';
    projectHeader.innerHTML = `
        <div class="project-name">
            <span class="icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8H16l.305-3.234A2 2 0 0 0 14.31 3H9.5l-1-1h-5A1 1 0 0 0 .5 3z"/>
                </svg>
            </span>
            <span class="project-title">${projectName}</span>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="closeProject()" title="Cerrar Proyecto">
            <span class="icon">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
            </span>
        </button>
    `;
    
    fileExplorer.appendChild(projectHeader);
    
    // Crear lista de archivos
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    
    // Ordenar archivos: carpetas primero, luego archivos
    const sortedFiles = [...projectFiles].sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
    });
    
    sortedFiles.forEach(file => {
        const fileItem = createFileItem(file);
        fileList.appendChild(fileItem);
    });
    
    fileExplorer.appendChild(fileList);
}

// Crear elemento de archivo/carpeta
function createFileItem(file) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.dataset.path = file.path;
    item.dataset.isDirectory = file.isDirectory;
    
    if (file.isDirectory) {
        item.classList.add('folder');
    } else {
        item.classList.add('file');
        
        // Añadir clase específica para archivos C
        if (file.name.endsWith('.c') || file.name.endsWith('.h')) {
            item.classList.add('c-file');
        }
    }
    
    // Icono
    const icon = document.createElement('span');
    icon.className = 'icon';
    
    if (file.isDirectory) {
        icon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8H16l.305-3.234A2 2 0 0 0 14.31 3H9.5l-1-1h-5A1 1 0 0 0 .5 3z"/>
            </svg>
        `;
    } else {
        icon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM4 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5L9.5 1H4z"/>
            </svg>
        `;
    }
    
    // Nombre del archivo
    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = file.name;
    
    item.appendChild(icon);
    item.appendChild(name);
    
    // Event listener
    item.addEventListener('click', () => handleFileClick(file));
    
    return item;
}

// Manejar click en archivo/carpeta
async function handleFileClick(file) {
    console.log('🔍 Click en archivo:', file.name);
    
    if (file.isDirectory) {
        // TODO: Implementar navegación de carpetas
        console.log('📁 Navegación de carpetas no implementada aún');
        window.addOutputLine?.(`📁 Carpeta: ${file.name} (navegación pendiente)`, 'info');
    } else {
        // Abrir archivo
        await openFileFromExplorer(file.path);
    }
}

// Abrir archivo desde el explorador
async function openFileFromExplorer(filePath) {
    console.log('📄 Abriendo archivo desde explorador:', filePath);
    
    try {
        // Leer contenido del archivo
        const result = await invokeIpc('read-file', filePath);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // Abrir en el editor
        if (window.openFileInEditor) {
            window.openFileInEditor(filePath, result.content, false);
        } else {
            console.error('openFileInEditor no disponible');
            window.addOutputLine?.('❌ Error: Editor no disponible', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error abriendo archivo:', error);
        window.addOutputLine?.(`❌ Error abriendo archivo: ${error.message}`, 'error');
    }
}

// Cerrar proyecto
function closeProject() {
    console.log('📁 Cerrando proyecto');
    
    currentProjectPath = null;
    projectFiles = [];
    
    updateFileExplorer();
    
    window.addOutputLine?.('📁 Proyecto cerrado', 'info');
}

// Función auxiliar para llamadas IPC
async function invokeIpc(channel, ...args) {
    if (!electronIpc) {
        throw new Error('IPC no disponible');
    }
    
    // Si es electronAPI (preload), usar directamente
    if (electronIpc.invoke) {
        return await electronIpc.invoke(channel, ...args);
    }
    
    // Si es ipcRenderer directo, usar invoke
    if (electronIpc.invoke) {
        return await electronIpc.invoke(channel, ...args);
    }
    
    throw new Error('Método invoke no disponible en IPC');
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
    
    // Funciones del explorador de archivos
    window.openProject = openProject;
    window.loadProject = loadProject;
    window.closeProject = closeProject;
    window.updateFileExplorer = updateFileExplorer;
    window.openFileFromExplorer = openFileFromExplorer;
    
    // Funciones simplificadas para archivo único
    window.createNewFile = createNewFile;
    window.openFile = openFile;
    window.saveCurrentFile = saveCurrentFile;
    window.loadFileFromPath = loadFileFromPath;
    window.markFileAsModified = markFileAsModified;
    window.updateFileTitle = updateFileTitle;
    
    // Variables del archivo actual
    window.currentFileName = currentFileName;
    window.currentFileContent = currentFileContent;
    window.isFileModified = isFileModified;
}

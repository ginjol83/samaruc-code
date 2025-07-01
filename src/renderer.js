// Helpers seguros para evitar errores de require
function getIpcRenderer() {
    try {
        const { ipcRenderer } = require('electron');
        return ipcRenderer;
    } catch (error) {
        console.error('Error obteniendo ipcRenderer:', error);
        return null;
    }
}

function getFs() {
    try {
        if (typeof require !== 'undefined' && typeof window !== 'undefined' && window.require) {
            return window.require('fs');
        }
    } catch (error) {
        console.warn('fs no disponible:', error.message);
    }
    return null;
}

// Utilidades de path seguras (sin require)
const safePath = {
    basename: (filePath) => {
        if (!filePath || typeof filePath !== 'string') return '';
        return filePath.split(/[\\/]/).pop() || '';
    },
    extname: (filePath) => {
        if (!filePath || typeof filePath !== 'string') return '';
        const name = safePath.basename(filePath);
        const lastDot = name.lastIndexOf('.');
        return lastDot > 0 ? name.substring(lastDot) : '';
    },
    dirname: (filePath) => {
        if (!filePath || typeof filePath !== 'string') return '';
        const parts = filePath.split(/[\\/]/);
        parts.pop();
        return parts.join('/') || '/';
    },
    join: (...parts) => {
        const validParts = parts.filter(part => part && typeof part === 'string');
        return validParts.join('/').replace(/\/+/g, '/');
    }
};

// Variables globales
let monaco;
let editor;
let currentProject = null;
let openFiles = new Map();
let activeFile = null;
let electronIpc = null; // Cache para ipcRenderer

// Inicializar IPC de Electron de forma segura
function initializeElectronIpc() {
    try {
        if (typeof require !== 'undefined') {
            const { ipcRenderer } = require('electron');
            electronIpc = ipcRenderer;
            console.log('Electron IPC inicializado correctamente');
            return true;
        }
    } catch (error) {
        console.warn('No se pudo inicializar Electron IPC:', error.message);
        electronIpc = null;
    }
    return false;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando aplicación...');
    
    try {
        // Inicializar IPC de Electron ANTES que Monaco
        const electronAvailable = initializeElectronIpc();
        console.log('Electron disponible:', electronAvailable);
        
        // Test básico de entorno
        console.log('=== TEST INICIAL ===');
        console.log('typeof require:', typeof require);
        console.log('typeof window:', typeof window);
        console.log('window.process:', window.process);
        console.log('electronIpc:', !!electronIpc);
        
        // Configurar funciones básicas primero
        setupEventListeners();
        setupMenuHandlers();
        setupKeyboardShortcuts();
        initializeRecentFiles();
        initializeDragAndDrop();
        
        // Inicializar editor (Monaco o básico)
        if (typeof require !== 'undefined' && require.config) {
            console.log('Intentando cargar Monaco Editor...');
            initializeMonaco();
        } else {
            console.log('require() no disponible, usando editor básico');
            initializeBasicEditor();
        }
        
        addOutputLine('IDE iniciado correctamente', 'success');
        
    } catch (error) {
        console.error('Error en inicialización general:', error);
        addOutputLine(`Error de inicialización: ${error.message}`, 'error');
        
        // Inicializar funciones esenciales como fallback
        try {
            setupEventListeners();
            setupKeyboardShortcuts();
            initializeRecentFiles();
            initializeDragAndDrop();
            initializeBasicEditor();
            addOutputLine('IDE iniciado en modo básico', 'warning');
        } catch (fallbackError) {
            console.error('Error crítico en fallback:', fallbackError);
            addOutputLine(`Error crítico: ${fallbackError.message}`, 'error');
        }
    }
});

// Editor básico sin Monaco (fallback)
function initializeBasicEditor() {
    const container = document.getElementById('monaco-editor');
    container.innerHTML = `
        <div class="basic-editor">
            <textarea id="basic-textarea" placeholder="// Editor básico - Monaco Editor no disponible
#include <stdio.h>

int main() {
    printf('Hola mundo!\\n');
    return 0;
}"></textarea>
        </div>
        <style>
        .basic-editor { width: 100%; height: 100%; }
        #basic-textarea { 
            width: 100%; height: 100%; 
            background: #1e1e1e; color: #d4d4d4; 
            border: none; font-family: 'Consolas', monospace; 
            font-size: 14px; padding: 16px;
            resize: none; outline: none;
        }
        </style>
    `;
    
    // Configurar editor básico
    const textarea = document.getElementById('basic-textarea');
    textarea.addEventListener('input', () => {
        if (activeFile) {
            markFileAsModified(activeFile);
        }
    });
    
    // Función para obtener contenido
    window.getEditorContent = () => textarea.value;
    window.setEditorContent = (content) => textarea.value = content;
}

// Inicializar Monaco Editor
function initializeMonaco() {
    console.log('Iniciando carga de Monaco Editor...');
    
    try {
        // Configurar AMD loader de manera más segura
        if (typeof require !== 'undefined' && require.config) {
            require.config({ 
                paths: { vs: 'https://unpkg.com/monaco-editor@0.34.0/min/vs' },
                // Evitar conflictos con Electron
                baseUrl: '.',
                waitSeconds: 30
            });
            
            // Cargar Monaco con manejo de errores
            require(['vs/editor/editor.main'], function() {
                try {
                    monaco = window.monaco;
                    
                    if (!monaco) {
                        throw new Error('Monaco no se cargó correctamente');
                    }
                    
                    console.log('Monaco Editor cargado correctamente');
                    
                    // Configurar tema oscuro
                    monaco.editor.defineTheme('retro-dark', {
                        base: 'vs-dark',
                        inherit: true,
                        rules: [
                            { token: 'comment', foreground: '6A9955' },
                            { token: 'keyword', foreground: '569CD6' },
                            { token: 'string', foreground: 'CE9178' },
                            { token: 'number', foreground: 'B5CEA8' },
                            { token: 'type', foreground: '4EC9B0' },
                            { token: 'function', foreground: 'DCDCAA' }
                        ],
                        colors: {
                            'editor.background': '#1e1e1e',
                            'editor.foreground': '#d4d4d4',
                            'editorLineNumber.foreground': '#858585',
                            'editor.selectionBackground': '#264f78',
                            'editor.inactiveSelectionBackground': '#3a3d41'
                        }
                    });
                    
                    addOutputLine('Editor inicializado correctamente', 'success');
                    initializeEditor();
                    
                } catch (error) {
                    console.error('Error configurando Monaco:', error);
                    addOutputLine(`Error configurando Monaco: ${error.message}`, 'error');
                    initializeBasicEditor();
                }
            }, function(error) {
                console.error('Error cargando Monaco Editor:', error);
                addOutputLine('Error cargando Monaco Editor, usando editor básico', 'warning');
                initializeBasicEditor();
            });
            
        } else {
            throw new Error('AMD loader no disponible');
        }
        
    } catch (error) {
        console.error('Error inicializando Monaco:', error);
        addOutputLine(`Error inicializando Monaco: ${error.message}`, 'error');
        initializeBasicEditor();
    }
}

// Inicializar editor
function initializeEditor() {
    const container = document.getElementById('monaco-editor');
    container.innerHTML = '<div class="welcome-screen"><div class="welcome-content"><h1><i class="fas fa-fish"></i> Samaruc Code</h1><p>IDE para desarrollo de juegos retro en C</p><div class="welcome-actions"><button class="btn btn-primary btn-large" onclick="openProject()"><i class="fas fa-folder-open"></i> Abrir Proyecto</button><button class="btn btn-secondary btn-large" onclick="createNewProject()"><i class="fas fa-plus"></i> Nuevo Proyecto</button></div></div></div>';
}

// Crear editor para archivo
function createEditor(content = '', language = 'c') {
    const container = document.getElementById('monaco-editor');
    container.innerHTML = '';
    
    editor = monaco.editor.create(container, {
        value: content,
        language: language,
        theme: 'retro-dark',
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on',
        bracketPairColorization: { enabled: true },
        suggest: {
            enabledCompletionItems: ['snippet', 'text', 'keyword', 'function', 'constructor', 'field', 'variable', 'class', 'interface', 'module', 'property', 'value', 'enum', 'reference', 'color', 'file', 'folder']
        }
    });
    
    // Escuchar cambios
    editor.onDidChangeModelContent(() => {
        if (activeFile) {
            markFileAsModified(activeFile);
        }
    });
    
    // Atajos de teclado
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveCurrentFile();
    });
    
    editor.addCommand(monaco.KeyCode.F5, () => {
        compileProject();
    });
    
    editor.addCommand(monaco.KeyCode.F6, () => {
        compileAndRun();
    });
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Verificar que los elementos existan antes de asignar event listeners
    const newFileBtn = document.getElementById('new-file-btn');
    const openFileBtn = document.getElementById('open-file-btn');
    const saveFileBtn = document.getElementById('save-file-btn');
    const compileBtn = document.getElementById('compile-btn');
    const runBtn = document.getElementById('run-btn');
    const loadTemplateBtn = document.getElementById('load-template-btn');
    const openProjectBtn = document.getElementById('open-project-btn');
    
    console.log('Elementos encontrados:', {
        newFileBtn: !!newFileBtn,
        openFileBtn: !!openFileBtn,
        saveFileBtn: !!saveFileBtn,
        compileBtn: !!compileBtn,
        runBtn: !!runBtn,
        loadTemplateBtn: !!loadTemplateBtn,
        openProjectBtn: !!openProjectBtn
    });
    
    // Botones de la toolbar
    if (newFileBtn) newFileBtn.addEventListener('click', createNewFile);
    if (openFileBtn) {
        openFileBtn.addEventListener('click', () => {
            console.log('Botón de abrir archivo clickeado');
            openFile();
        });
    }
    if (saveFileBtn) saveFileBtn.addEventListener('click', saveCurrentFile);
    if (compileBtn) compileBtn.addEventListener('click', compileProject);
    if (runBtn) runBtn.addEventListener('click', compileAndRun);
    if (loadTemplateBtn) loadTemplateBtn.addEventListener('click', loadSelectedTemplate);
    if (openProjectBtn) openProjectBtn.addEventListener('click', openProject);
    
    // Pestañas del panel inferior
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchPanel(tab.dataset.panel);
        });
    });
    
    // Atajos de teclado
    setupKeyboardShortcuts();
}

// Configurar manejadores de menú
function setupMenuHandlers() {
    ipcRenderer.on('menu-new-project', createNewProject);
    ipcRenderer.on('menu-open-project', (event, projectPath) => {
        loadProject(projectPath);
    });
    ipcRenderer.on('menu-save', saveCurrentFile);
    ipcRenderer.on('menu-compile', compileProject);
    ipcRenderer.on('menu-compile-run', compileAndRun);
    ipcRenderer.on('menu-template', (event, templateName) => {
        loadTemplate(templateName);
    });
}

// Crear nuevo archivo
function createNewFile() {
    const fileName = prompt('Nombre del archivo:', 'main.c');
    if (!fileName) return;
    
    const filePath = path.join(currentProject || process.cwd(), fileName);
    openFileInEditor(filePath, '// Nuevo archivo\n#include <stdio.h>\n\nint main() {\n    printf("Hola mundo!\\n");\n    return 0;\n}', true);
}

// Abrir archivo
async function openFile() {
    console.log('openFile() llamada');
    addOutputLine('Intentando abrir archivo...', 'info');
    
    try {
        // Usar el IPC cacheado
        if (electronIpc) {
            console.log('Usando Electron IPC cacheado...');
            
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
                addOutputLine(`Abriendo archivo: ${filePath}`, 'info');
                
                const content = await electronIpc.invoke('read-file', filePath);
                console.log('Contenido del archivo recibido:', content);
                
                if (content.success) {
                    openFileInEditor(filePath, content.content);
                    addOutputLine(`Archivo abierto correctamente: ${safePath.basename(filePath)}`, 'success');
                } else {
                    addOutputLine(`Error al leer archivo: ${content.error}`, 'error');
                }
                return;
            } else if (result.canceled) {
                addOutputLine('Operación cancelada por el usuario', 'info');
                return;
            }
        } else {
            addOutputLine('Electron IPC no disponible, usando fallback...', 'warning');
        }
    } catch (error) {
        console.error('Error con API de Electron:', error);
        addOutputLine(`Error con API de Electron: ${error.message}`, 'error');
        addOutputLine('Usando método alternativo para abrir archivos...', 'warning');
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
            addOutputLine(`Cargando archivo: ${file.name}`, 'info');
            
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    // Usar el nombre del archivo como path temporal
                    const tempPath = file.name;
                    openFileInEditor(tempPath, content, true);
                    addOutputLine(`Archivo cargado: ${file.name}`, 'success');
                };
                
                reader.onerror = () => {
                    addOutputLine(`Error al leer el archivo: ${file.name}`, 'error');
                };
                
                reader.readAsText(file, 'utf-8');
            } catch (error) {
                addOutputLine(`Error al procesar archivo: ${error.message}`, 'error');
            }
        }
    };
    
    input.oncancel = () => {
        addOutputLine('Selección de archivo cancelada', 'info');
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

// Abrir archivo en editor
function openFileInEditor(filePath, content, isNew = false) {
    console.log('openFileInEditor llamada con:', { filePath, contentLength: content?.length, isNew });
    
    // Validar parámetros
    if (!filePath || content === undefined) {
        addOutputLine('Error: Parámetros inválidos para abrir archivo', 'error');
        console.error('Parámetros inválidos:', { filePath, content });
        return;
    }
    
    // Validar que filePath sea string
    if (typeof filePath !== 'string') {
        addOutputLine('Error: Ruta de archivo inválida', 'error');
        return;
    }
    
    // Si ya está abierto, cambiar a esa pestaña
    if (openFiles.has(filePath)) {
        switchToFile(filePath);
        addOutputLine(`Cambiando a archivo ya abierto: ${safePath.basename(filePath)}`, 'info');
        return;
    }
    
    // Detectar el tipo de archivo y preparar el contenido
    const fileExtension = safePath.extname(filePath).toLowerCase();
    const language = getLanguageFromFile(filePath);
    
    // Validar que el contenido sea texto
    if (typeof content !== 'string') {
        // Intentar convertir a string si es posible
        try {
            content = String(content);
        } catch (error) {
            addOutputLine('Error: El archivo no contiene texto válido', 'error');
            return;
        }
    }
    
    // Verificar si el archivo es muy grande (más de 2MB)
    if (content.length > 2 * 1024 * 1024) {
        const fileSize = (content.length / (1024 * 1024)).toFixed(2);
        const shouldContinue = confirm(
            `El archivo ${safePath.basename(filePath)} es muy grande (${fileSize}MB). ` +
            '¿Deseas abrirlo de todas formas? Esto podría afectar el rendimiento del editor.'
        );
        if (!shouldContinue) {
            addOutputLine('Apertura de archivo cancelada por el usuario', 'info');
            return;
        }
    }
    
    // Detectar si es un archivo binario
    if (isBinaryFile(content)) {
        const shouldContinue = confirm(
            `El archivo ${safePath.basename(filePath)} parece ser un archivo binario. ` +
            '¿Deseas abrirlo como texto de todas formas?'
        );
        if (!shouldContinue) {
            addOutputLine('Apertura de archivo binario cancelada por el usuario', 'info');
            return;
        }
    }
    
    // Agregar archivo a la lista
    openFiles.set(filePath, {
        content: content,
        modified: isNew,
        isNew: isNew,
        language: language,
        fileSize: content.length,
        lastModified: new Date(),
        encoding: 'utf-8'
    });
    
    // Crear pestaña
    createTab(filePath);
    
    // Cambiar a este archivo
    switchToFile(filePath);
    
    // Actualizar título de la ventana
    updateWindowTitle(filePath);
    
    addOutputLine(`Archivo abierto: ${safePath.basename(filePath)} (${language}, ${formatFileSize(content.length)})`, 'success');
    
    // Easter egg del samaruc cada 5 archivos
    filesOpenedCount++;
    if (filesOpenedCount % 5 === 0) {
        setTimeout(() => showSamarucMessage(), 1000);
    }
    
    // Añadir a archivos recientes solo si no es un archivo nuevo
    if (!isNew) {
        addToRecentFiles(filePath);
    }
}

// Crear pestaña
function createTab(filePath) {
    const tabsContainer = document.getElementById('editor-tabs');
    const fileName = safePath.basename(filePath);
    
    const tab = document.createElement('button');
    tab.className = 'editor-tab';
    tab.dataset.file = filePath;
    tab.innerHTML = `
        <i class="fas fa-file"></i>
        <span>${fileName}</span>
        <button class="close-btn" onclick="closeFile('${filePath}')" title="Cerrar">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    tab.addEventListener('click', (e) => {
        if (!e.target.classList.contains('close-btn') && !e.target.closest('.close-btn')) {
            switchToFile(filePath);
        }
    });
    
    tabsContainer.appendChild(tab);
}

// Cambiar a archivo
function switchToFile(filePath) {
    activeFile = filePath;
    const fileData = openFiles.get(filePath);
    
    // Actualizar pestañas
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.file === filePath);
    });
    
    // Crear/actualizar editor
    if (editor && editor.dispose) {
        editor.dispose();
    }
    
    const language = getLanguageFromFile(filePath);
    
    if (monaco) {
        createEditor(fileData.content, language);
    } else if (window.setEditorContent) {
        window.setEditorContent(fileData.content);
    }
}

// Obtener lenguaje por extensión
function getLanguageFromFile(filePath) {
    const ext = safePath.extname(filePath).toLowerCase();
    const fileName = safePath.basename(filePath).toLowerCase();
    
    // Mapeo de extensiones a lenguajes de Monaco Editor
    const languageMap = {
        // C/C++
        '.c': 'c',
        '.h': 'c',
        '.cpp': 'cpp',
        '.cc': 'cpp',
        '.cxx': 'cpp',
        '.c++': 'cpp',
        '.hpp': 'cpp',
        '.hh': 'cpp',
        '.hxx': 'cpp',
        '.h++': 'cpp',
        
        // Web
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.json': 'json',
        '.html': 'html',
        '.htm': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.sass': 'sass',
        '.less': 'less',
        
        // Scripts
        '.py': 'python',
        '.java': 'java',
        '.cs': 'csharp',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust',
        '.swift': 'swift',
        '.kt': 'kotlin',
        
        // Shell
        '.sh': 'shell',
        '.bash': 'shell',
        '.zsh': 'shell',
        '.fish': 'shell',
        '.ps1': 'powershell',
        '.bat': 'bat',
        '.cmd': 'bat',
        
        // Config
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.toml': 'toml',
        '.ini': 'ini',
        '.cfg': 'ini',
        '.conf': 'ini',
        
        // Documentation
        '.md': 'markdown',
        '.markdown': 'markdown',
        '.txt': 'plaintext',
        '.log': 'plaintext',
        
        // Build systems
        '.cmake': 'cmake',
        '.dockerfile': 'dockerfile',
        '.makefile': 'makefile',
        
        // SQL
        '.sql': 'sql',
        
        // Others
        '.r': 'r',
        '.m': 'objective-c',
        '.mm': 'objective-c'
    };
    
    // Casos especiales por nombre de archivo
    const specialFiles = {
        'makefile': 'makefile',
        'cmakelists.txt': 'cmake',
        'dockerfile': 'dockerfile',
        'readme': 'markdown',
        'license': 'plaintext',
        'changelog': 'markdown',
        'todo': 'plaintext'
    };
    
    // Verificar archivos especiales primero
    if (specialFiles[fileName]) {
        return specialFiles[fileName];
    }
    
    // Usar mapeo de extensiones
    return languageMap[ext] || 'plaintext';
}

// Marcar archivo como modificado
function markFileAsModified(filePath) {
    const fileData = openFiles.get(filePath);
    if (fileData && !fileData.modified) {
        fileData.modified = true;
        updateTabTitle(filePath);
    }
}

// Actualizar título de pestaña
function updateTabTitle(filePath) {
    const tab = document.querySelector(`[data-file="${filePath}"]`);
    if (tab) {
        const fileData = openFiles.get(filePath);
        const fileName = path.basename(filePath);
        const span = tab.querySelector('span');
        span.textContent = fileData.modified ? `${fileName} •` : fileName;
    }
}

// Guardar archivo actual
async function saveCurrentFile() {
    if (!activeFile) return;
    
    let content;
    if (editor && editor.getValue) {
        content = editor.getValue();
    } else if (window.getEditorContent) {
        content = window.getEditorContent();
    } else {
        addOutputLine('Error: No se puede obtener el contenido del editor', 'error');
        return;
    }
    
    const fileData = openFiles.get(activeFile);
    
    if (fileData.isNew) {
        // Guardar como...
        try {
            const result = await ipcRenderer.invoke('write-file', activeFile, content);
            if (result.success) {
                fileData.content = content;
                fileData.modified = false;
                fileData.isNew = false;
                updateTabTitle(activeFile);
                addOutputLine(`Archivo guardado: ${activeFile}`, 'success');
            } else {
                addOutputLine(`Error al guardar: ${result.error}`, 'error');
            }
        } catch (error) {
            // Fallback: mostrar contenido en consola
            console.log('Contenido del archivo:', content);
            addOutputLine('Archivo guardado (solo en memoria)', 'warning');
        }
    } else {
        // Guardar archivo existente
        try {
            const result = await ipcRenderer.invoke('write-file', activeFile, content);
            if (result.success) {
                fileData.content = content;
                fileData.modified = false;
                updateTabTitle(activeFile);
                addOutputLine(`Archivo guardado: ${activeFile}`, 'success');
            } else {
                addOutputLine(`Error al guardar: ${result.error}`, 'error');
            }
        } catch (error) {
            addOutputLine(`Error al guardar: ${error.message}`, 'error');
        }
    }
}

// Cerrar archivo
function closeFile(filePath) {
    const fileData = openFiles.get(filePath);
    
    if (fileData && fileData.modified) {
        const result = confirm(`¿Guardar cambios en ${path.basename(filePath)}?`);
        if (result) {
            // TODO: Implementar guardado antes de cerrar
        }
    }
    
    // Remover pestaña
    const tab = document.querySelector(`[data-file="${filePath}"]`);
    if (tab) {
        tab.remove();
    }
    
    // Remover de archivos abiertos
    openFiles.delete(filePath);
    
    // Si era el archivo activo, cambiar a otro o mostrar pantalla de bienvenida
    if (activeFile === filePath) {
        const remainingFiles = Array.from(openFiles.keys());
        if (remainingFiles.length > 0) {
            switchToFile(remainingFiles[0]);
        } else {
            activeFile = null;
            if (editor) {
                editor.dispose();
                editor = null;
            }
            initializeEditor();
        }
    }
}

// Compilar proyecto
async function compileProject() {
    if (!activeFile) {
        addOutputLine('No hay archivo activo para compilar', 'error');
        return;
    }
    
    // Guardar archivo actual primero
    await saveCurrentFile();
    
    addOutputLine('Iniciando compilación...', 'info');
    
    const projectPath = currentProject || path.dirname(activeFile);
    const mainFile = path.basename(activeFile);
    
    try {
        const result = await ipcRenderer.invoke('compile-project', projectPath, mainFile);
        
        if (result.success) {
            addOutputLine('Compilación exitosa!', 'success');
            if (result.output) {
                addOutputLine(result.output);
            }
        } else {
            addOutputLine('Error de compilación:', 'error');
            addOutputLine(result.error, 'error');
            parseCompilationErrors(result.error);
        }
    } catch (error) {
        addOutputLine(`Error: ${error.message}`, 'error');
    }
}

// Compilar y ejecutar
async function compileAndRun() {
    await compileProject();
    
    if (!activeFile) return;
    
    const projectPath = currentProject || path.dirname(activeFile);
    const mainFile = path.basename(activeFile);
    const executablePath = path.join(projectPath, mainFile.replace('.c', '.exe'));
    
    try {
        const result = await ipcRenderer.invoke('run-executable', executablePath);
        if (result.success) {
            addOutputLine(`Ejecutando programa (PID: ${result.pid})...`, 'success');
        }
    } catch (error) {
        addOutputLine(`Error al ejecutar: ${error.message}`, 'error');
    }
}

// Parsear errores de compilación
function parseCompilationErrors(errorText) {
    const problems = document.getElementById('problems-content');
    problems.innerHTML = '';
    
    const lines = errorText.split('\n');
    let hasProblems = false;
    
    lines.forEach(line => {
        if (line.includes('error:') || line.includes('warning:')) {
            hasProblems = true;
            const problemItem = document.createElement('div');
            problemItem.className = 'problem-item';
            
            const isError = line.includes('error:');
            problemItem.innerHTML = `
                <div class="problem-icon ${isError ? 'error' : 'warning'}">
                    <i class="fas ${isError ? 'fa-times-circle' : 'fa-exclamation-triangle'}"></i>
                </div>
                <div class="problem-details">
                    <div class="problem-message">${line}</div>
                </div>
            `;
            
            problems.appendChild(problemItem);
        }
    });
    
    if (!hasProblems) {
        problems.innerHTML = '<div class="no-problems">No hay problemas detectados</div>';
    }
    
    // Cambiar a pestaña de problemas si hay errores
    if (hasProblems) {
        switchPanel('problems');
    }
}

// Cargar plantilla seleccionada
function loadSelectedTemplate() {
    const select = document.getElementById('template-select');
    const templateName = select.value;
    if (templateName) {
        loadTemplate(templateName);
        select.value = '';
    }
}

// Cargar plantilla
function loadTemplate(templateName) {
    const templates = getTemplates();
    const template = templates[templateName];
    
    if (template) {
        openFileInEditor(`${template.name}.c`, template.code, true);
        addOutputLine(`Plantilla cargada: ${template.name}`, 'success');
    }
}

// Obtener plantillas
function getTemplates() {
    return {
        'basic-game': {
            name: 'basic_game',
            code: `#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <conio.h>

#define WIDTH 20
#define HEIGHT 10

// Estructura del juego
typedef struct {
    int x, y;
    int score;
    int game_over;
} Game;

Game game;

void init_game() {
    game.x = WIDTH / 2;
    game.y = HEIGHT / 2;
    game.score = 0;
    game.game_over = 0;
    srand(time(NULL));
}

void draw_screen() {
    system("cls");
    
    // Dibujar bordes superiores
    for (int i = 0; i < WIDTH + 2; i++) {
        printf("#");
    }
    printf("\\n");
    
    // Dibujar área de juego
    for (int i = 0; i < HEIGHT; i++) {
        printf("#");
        for (int j = 0; j < WIDTH; j++) {
            if (i == game.y && j == game.x) {
                printf("@");  // Jugador
            } else {
                printf(" ");
            }
        }
        printf("#\\n");
    }
    
    // Dibujar bordes inferiores
    for (int i = 0; i < WIDTH + 2; i++) {
        printf("#");
    }
    printf("\\n");
    
    printf("Puntuación: %d\\n", game.score);
    printf("Controles: W/A/S/D para moverse, Q para salir\\n");
}

void update_game() {
    if (_kbhit()) {
        char input = _getch();
        switch (input) {
            case 'w':
            case 'W':
                if (game.y > 0) game.y--;
                break;
            case 's':
            case 'S':
                if (game.y < HEIGHT - 1) game.y++;
                break;
            case 'a':
            case 'A':
                if (game.x > 0) game.x--;
                break;
            case 'd':
            case 'D':
                if (game.x < WIDTH - 1) game.x++;
                break;
            case 'q':
            case 'Q':
                game.game_over = 1;
                break;
        }
        game.score += 10;
    }
}

int main() {
    init_game();
    
    while (!game.game_over) {
        draw_screen();
        update_game();
        
        // Pequeña pausa
        for (int i = 0; i < 10000000; i++);
    }
    
    printf("\\n¡Juego terminado! Puntuación final: %d\\n", game.score);
    printf("Presiona cualquier tecla para salir...\\n");
    _getch();
    
    return 0;
}`
        },
        'platform-game': {
            name: 'platform_game',
            code: `#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <time.h>

#define WIDTH 30
#define HEIGHT 15
#define GRAVITY 1
#define JUMP_FORCE -3

typedef struct {
    int x, y;
    int vel_y;
    int on_ground;
    int score;
    int game_over;
} Player;

typedef struct {
    int x, y;
    int active;
} Platform;

Player player;
Platform platforms[10];
int level_offset = 0;

void init_game() {
    player.x = 5;
    player.y = HEIGHT - 3;
    player.vel_y = 0;
    player.on_ground = 0;
    player.score = 0;
    player.game_over = 0;
    level_offset = 0;
    
    // Inicializar plataformas
    for (int i = 0; i < 10; i++) {
        platforms[i].x = 10 + i * 8;
        platforms[i].y = HEIGHT - 2 - (rand() % 5);
        platforms[i].active = 1;
    }
    
    srand(time(NULL));
}

void update_physics() {
    // Aplicar gravedad
    if (!player.on_ground) {
        player.vel_y += GRAVITY;
    }
    
    // Actualizar posición Y
    player.y += player.vel_y;
    
    // Verificar colisiones con plataformas
    player.on_ground = 0;
    
    // Suelo
    if (player.y >= HEIGHT - 2) {
        player.y = HEIGHT - 2;
        player.vel_y = 0;
        player.on_ground = 1;
    }
    
    // Plataformas
    for (int i = 0; i < 10; i++) {
        if (platforms[i].active) {
            int platform_screen_x = platforms[i].x - level_offset;
            if (platform_screen_x >= 0 && platform_screen_x < WIDTH &&
                player.x >= platform_screen_x - 2 && player.x <= platform_screen_x + 2 &&
                player.y >= platforms[i].y - 1 && player.y <= platforms[i].y &&
                player.vel_y >= 0) {
                player.y = platforms[i].y - 1;
                player.vel_y = 0;
                player.on_ground = 1;
            }
        }
    }
    
    // Límites de pantalla
    if (player.y < 0) {
        player.y = 0;
        player.vel_y = 0;
    }
    
    // Game over si cae muy abajo
    if (player.y > HEIGHT) {
        player.game_over = 1;
    }
}

void draw_screen() {
    system("cls");
    
    char screen[HEIGHT][WIDTH + 1];
    
    // Limpiar pantalla
    for (int i = 0; i < HEIGHT; i++) {
        for (int j = 0; j < WIDTH; j++) {
            screen[i][j] = ' ';
        }
        screen[i][WIDTH] = '\\0';
    }
    
    // Dibujar suelo
    for (int j = 0; j < WIDTH; j++) {
        screen[HEIGHT - 1][j] = '#';
    }
    
    // Dibujar plataformas
    for (int i = 0; i < 10; i++) {
        if (platforms[i].active) {
            int platform_screen_x = platforms[i].x - level_offset;
            if (platform_screen_x >= 0 && platform_screen_x < WIDTH - 2) {
                screen[platforms[i].y][platform_screen_x] = '=';
                screen[platforms[i].y][platform_screen_x + 1] = '=';
                screen[platforms[i].y][platform_screen_x + 2] = '=';
            }
        }
    }
    
    // Dibujar jugador
    if (player.x >= 0 && player.x < WIDTH && player.y >= 0 && player.y < HEIGHT) {
        screen[player.y][player.x] = '@';
    }
    
    // Mostrar pantalla
    for (int i = 0; i < HEIGHT; i++) {
        printf("%s\\n", screen[i]);
    }
    
    printf("Puntuación: %d | Posición: %d\\n", player.score, level_offset + player.x);
    printf("Controles: A/D moverse, W saltar, Q salir\\n");
}

void handle_input() {
    if (_kbhit()) {
        char input = _getch();
        switch (input) {
            case 'a':
            case 'A':
                if (player.x > 0) {
                    player.x--;
                } else if (level_offset > 0) {
                    level_offset--;
                    player.score += 5;
                }
                break;
            case 'd':
            case 'D':
                if (player.x < WIDTH - 1) {
                    player.x++;
                } else {
                    level_offset++;
                    player.score += 5;
                }
                break;
            case 'w':
            case 'W':
                if (player.on_ground) {
                    player.vel_y = JUMP_FORCE;
                    player.on_ground = 0;
                }
                break;
            case 'q':
            case 'Q':
                player.game_over = 1;
                break;
        }
    }
}

int main() {
    init_game();
    
    while (!player.game_over) {
        draw_screen();
        handle_input();
        update_physics();
        
        // Pequeña pausa para controlar la velocidad del juego
        for (int i = 0; i < 8000000; i++);
    }
    
    printf("\\n¡Juego terminado!\\n");
    printf("Puntuación final: %d\\n", player.score);
    printf("Presiona cualquier tecla para salir...\\n");
    _getch();
    
    return 0;
}`
        },
        'shooter-game': {
            name: 'shooter_game',
            code: `#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <time.h>

#define WIDTH 25
#define HEIGHT 20
#define MAX_BULLETS 10
#define MAX_ENEMIES 5

typedef struct {
    int x, y;
    int active;
} Bullet;

typedef struct {
    int x, y;
    int active;
} Enemy;

typedef struct {
    int x, y;
    int lives;
    int score;
    int game_over;
} Player;

Player player;
Bullet bullets[MAX_BULLETS];
Enemy enemies[MAX_ENEMIES];
int enemy_spawn_timer = 0;

void init_game() {
    player.x = WIDTH / 2;
    player.y = HEIGHT - 2;
    player.lives = 3;
    player.score = 0;
    player.game_over = 0;
    enemy_spawn_timer = 0;
}

void spawn_bullet() {
    for (int i = 0; i < MAX_BULLETS; i++) {
        if (!bullets[i].active) {
            bullets[i].x = player.x;
            bullets[i].y = player.y - 1;
            bullets[i].active = 1;
            break;
        }
    }
}

void spawn_enemy() {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (!enemies[i].active) {
            enemies[i].x = rand() % WIDTH;
            enemies[i].y = 0;
            enemies[i].active = 1;
            break;
        }
    }
}

void update_bullets() {
    for (int i = 0; i < MAX_BULLETS; i++) {
        if (bullets[i].active) {
            bullets[i].y--;
            if (bullets[i].y < 0) {
                bullets[i].active = 0;
            }
        }
    }
}

void update_enemies() {
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemies[i].active) {
            enemies[i].y++;
            if (enemies[i].y >= HEIGHT) {
                enemies[i].active = 0;
            }
            
            // Colisión con jugador
            if (enemies[i].x == player.x && enemies[i].y == player.y) {
                player.lives--;
                enemies[i].active = 0;
                if (player.lives <= 0) {
                    player.game_over = 1;
                }
            }
        }
    }
}

void check_collisions() {
    for (int i = 0; i < MAX_BULLETS; i++) {
        if (bullets[i].active) {
            for (int j = 0; j < MAX_ENEMIES; j++) {
                if (enemies[j].active && 
                    bullets[i].x == enemies[j].x && 
                    bullets[i].y == enemies[j].y) {
                    bullets[i].active = 0;
                    enemies[j].active = 0;
                    player.score += 100;
                }
            }
        }
    }
}

void draw_screen() {
    system("cls");
    
    char screen[HEIGHT][WIDTH + 1];
    
    // Limpiar pantalla
    for (int i = 0; i < HEIGHT; i++) {
        for (int j = 0; j < WIDTH; j++) {
            screen[i][j] = ' ';
        }
        screen[i][WIDTH] = '\\0';
    }
    
    // Dibujar bordes
    for (int i = 0; i < HEIGHT; i++) {
        screen[i][0] = '|';
        screen[i][WIDTH - 1] = '|';
    }
    for (int j = 0; j < WIDTH; j++) {
        screen[0][j] = '-';
        screen[HEIGHT - 1][j] = '-';
    }
    
    // Dibujar jugador
    screen[player.y][player.x] = 'A';
    
    // Dibujar balas
    for (int i = 0; i < MAX_BULLETS; i++) {
        if (bullets[i].active) {
            screen[bullets[i].y][bullets[i].x] = '|';
        }
    }
    
    // Dibujar enemigos
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemies[i].active) {
            screen[enemies[i].y][enemies[i].x] = 'V';
        }
    }
    
    // Mostrar pantalla
    for (int i = 0; i < HEIGHT; i++) {
        printf("%s\\n", screen[i]);
    }
    
    printf("Puntuación: %d | Vidas: %d\\n", player.score, player.lives);
    printf("Controles: A/D moverse, W disparar, Q salir\\n");
}

void handle_input() {
    if (_kbhit()) {
        char input = _getch();
        switch (input) {
            case 'a':
            case 'A':
                if (player.x > 1) player.x--;
                break;
            case 'd':
            case 'D':
                if (player.x < WIDTH - 2) player.x++;
                break;
            case 'w':
            case 'W':
                spawn_bullet();
                break;
            case 'q':
            case 'Q':
                player.game_over = 1;
                break;
        }
    }
}

int main() {
    init_game();
    
    while (!player.game_over) {
        draw_screen();
        handle_input();
        update_bullets();
        update_enemies();
        check_collisions();
        
        // Generar enemigos
        enemy_spawn_timer++;
        if (enemy_spawn_timer > 15) {
            spawn_enemy();
            enemy_spawn_timer = 0;
        }
        
        // Pequeña pausa
        for (int i = 0; i < 5000000; i++);
    }
    
    printf("\\n¡Juego terminado!\\n");
    printf("Puntuación final: %d\\n", player.score);
    printf("Presiona cualquier tecla para salir...\\n");
    _getch();
    
    return 0;
}`
        }
    };
}

// Easter eggs de Samaruc
const samarucEasterEggs = [
    "🐟 El samaruc nada feliz por tu código",
    "🌊 Navegando por el código como un pez en el agua",
    "🐠 El samaruc encuentra tu código muy elegante",
    "🎣 ¡Pescando bugs con estilo!",
    "🏊‍♂️ Sumérgete en el desarrollo retro"
];

function showSamarucMessage() {
    const randomIndex = Math.floor(Math.random() * samarucEasterEggs.length);
    const message = samarucEasterEggs[randomIndex];
    addOutputLine(message, 'success');
}

// Mostrar mensaje de bienvenida especial cada vez que se abre un archivo
let filesOpenedCount = 0;

// ===== FUNCIONES DE PROYECTO =====

// Función para crear un nuevo proyecto (versión simplificada)
async function createNewProject() {
    console.log('createNewProject() llamada');
    addOutputLine('🐟 Iniciando creación de nuevo proyecto...', 'info');
    
    try {
        // Usar un diálogo personalizado en lugar de prompt
        const projectName = await showProjectNameDialog();
        if (!projectName) {
            addOutputLine('Creación de proyecto cancelada', 'warning');
            return;
        }
        
        // Limpiar nombre del proyecto
        const cleanProjectName = projectName.trim().replace(/[^a-zA-Z0-9\-_]/g, '-');
        
        // Configuración por defecto (sin diálogos complicados por ahora)
        const buildConfig = {
            platform: "spectrum",
            compiler: "sdcc",
            target: "z80"
        };
        
        addOutputLine(`Configuración: ${buildConfig.platform}/${buildConfig.compiler}/${buildConfig.target}`, 'info');
        
        // Usar el IPC para mostrar diálogo de selección de carpeta
        if (electronIpc) {
            try {
                const result = await electronIpc.invoke('show-save-dialog', {
                    title: 'Seleccionar ubicación para el proyecto',
                    defaultPath: cleanProjectName,
                    properties: ['createDirectory'],
                    buttonLabel: 'Crear Proyecto Aquí'
                });
                
                if (result.canceled) {
                    addOutputLine('Selección de ubicación cancelada', 'info');
                    return;
                }
                
                const projectPath = result.filePath;
                addOutputLine(`Creando proyecto en: ${projectPath}`, 'info');
                
                // Crear el proyecto usando IPC
                const createResult = await electronIpc.invoke('create-project', 
                    projectPath, 
                    cleanProjectName, 
                    buildConfig
                );
                
                if (createResult.success) {
                    addOutputLine(`✅ Proyecto "${cleanProjectName}" creado exitosamente!`, 'success');
                    addOutputLine(`📁 Ubicación: ${projectPath}`, 'info');
                    addOutputLine(`📄 Archivos creados: ${createResult.files.join(', ')}`, 'info');
                    addOutputLine(`🔧 Configuración: ${buildConfig.platform}/${buildConfig.compiler}/${buildConfig.target}`, 'info');
                    
                    // Mostrar mensaje motivacional del samaruc
                    setTimeout(() => {
                        showSamarucMessage();
                    }, 1000);
                    
                    // Preguntar si abrir el proyecto recién creado
                    const shouldOpen = await showConfirmDialog('¿Deseas abrir el proyecto recién creado?');
                    if (shouldOpen) {
                        // Abrir el archivo main.c del proyecto
                        const mainCPath = safePath.join(projectPath, 'main.c');
                        openFileFromPath(mainCPath);
                    }
                    
                } else {
                    addOutputLine(`❌ Error creando proyecto: ${createResult.error}`, 'error');
                }
                
            } catch (error) {
                console.error('Error en createNewProject:', error);
                addOutputLine(`Error en creación de proyecto: ${error.message}`, 'error');
            }
        } else {
            // Fallback para navegador
            addOutputLine('⚠️  Función de crear proyecto solo disponible en Electron', 'warning');
            addOutputLine('Para crear proyectos manualmente:', 'info');
            addOutputLine(`1. Crear carpeta: ${cleanProjectName}`, 'info');
            addOutputLine(`2. Crear archivo build.json con la configuración`, 'info');
            addOutputLine(`3. Crear archivo main.c con el código inicial`, 'info');
            
            // Mostrar configuración que se habría creado
            const configExample = JSON.stringify(buildConfig, null, 2);
            addOutputLine(`Configuración build.json:`, 'info');
            addOutputLine(configExample, 'info');
        }
        
    } catch (error) {
        console.error('Error en createNewProject:', error);
        addOutputLine(`Error creando proyecto: ${error.message}`, 'error');
    }
}

// Función auxiliar para mostrar diálogo de nombre de proyecto
async function showProjectNameDialog() {
    return new Promise((resolve) => {
        // Crear un diálogo personalizado
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        dialog.innerHTML = `
            <div style="background: #2d2d30; padding: 20px; border-radius: 8px; border: 1px solid #3e3e42; min-width: 300px;">
                <h3 style="color: #d4d4d4; margin-bottom: 15px;">🐟 Nuevo Proyecto Samaruc</h3>
                <label style="color: #d4d4d4; display: block; margin-bottom: 5px;">Nombre del proyecto:</label>
                <input type="text" id="projectNameInput" value="mi-juego-retro" 
                       style="width: 100%; padding: 8px; background: #1e1e1e; color: #d4d4d4; border: 1px solid #3e3e42; border-radius: 4px; margin-bottom: 15px;">
                <div style="text-align: right;">
                    <button id="cancelBtn" style="background: #6c6c6c; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px; cursor: pointer;">Cancelar</button>
                    <button id="createBtn" style="background: #0e639c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Crear</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const input = dialog.querySelector('#projectNameInput');
        const cancelBtn = dialog.querySelector('#cancelBtn');
        const createBtn = dialog.querySelector('#createBtn');
        
        input.focus();
        input.select();
        
        const cleanup = () => {
            document.body.removeChild(dialog);
        };
        
        cancelBtn.onclick = () => {
            cleanup();
            resolve(null);
        };
        
        createBtn.onclick = () => {
            const name = input.value.trim();
            cleanup();
            resolve(name || null);
        };
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                createBtn.click();
            } else if (e.key === 'Escape') {
                cancelBtn.click();
            }
        };
    });
}

// Función auxiliar para mostrar diálogo de confirmación
async function showConfirmDialog(message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        dialog.innerHTML = `
            <div style="background: #2d2d30; padding: 20px; border-radius: 8px; border: 1px solid #3e3e42; min-width: 300px;">
                <h3 style="color: #d4d4d4; margin-bottom: 15px;">🐟 Samaruc Code</h3>
                <p style="color: #d4d4d4; margin-bottom: 20px;">${message}</p>
                <div style="text-align: right;">
                    <button id="noBtn" style="background: #6c6c6c; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px; cursor: pointer;">No</button>
                    <button id="yesBtn" style="background: #0e639c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Sí</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const noBtn = dialog.querySelector('#noBtn');
        const yesBtn = dialog.querySelector('#yesBtn');
        
        const cleanup = () => {
            document.body.removeChild(dialog);
        };
        
        noBtn.onclick = () => {
            cleanup();
            resolve(false);
        };
        
        yesBtn.onclick = () => {
            cleanup();
            resolve(true);
        };
    });
}

// Función para abrir proyecto existente
async function openProject() {
    console.log('openProject() llamada');
    addOutputLine('📂 Abriendo proyecto...', 'info');
    
    try {
        if (electronIpc) {
            const result = await electronIpc.invoke('show-open-dialog', {
                title: 'Seleccionar carpeta del proyecto',
                properties: ['openDirectory'],
                buttonLabel: 'Abrir Proyecto'
            });
            
            if (result.canceled) {
                addOutputLine('Apertura de proyecto cancelada', 'info');
                return;
            }
            
            const projectPath = result.filePaths[0];
            addOutputLine(`Abriendo proyecto desde: ${projectPath}`, 'info');
            
            // Buscar archivos principales del proyecto
            const listResult = await electronIpc.invoke('list-directory', projectPath);
            
            if (listResult.success) {
                const files = listResult.items.filter(item => !item.isDirectory);
                const cFiles = files.filter(file => file.name.endsWith('.c') || file.name.endsWith('.h'));
                const buildJson = files.find(file => file.name === 'build.json');
                
                addOutputLine(`📄 Encontrados ${files.length} archivos (${cFiles.length} de código)`, 'info');
                
                if (buildJson) {
                    // Leer configuración del proyecto
                    const buildResult = await electronIpc.invoke('read-file', buildJson.path);
                    if (buildResult.success) {
                        try {
                            const config = JSON.parse(buildResult.content);
                            addOutputLine(`🔧 Configuración: ${config.platform}/${config.compiler}/${config.target}`, 'info');
                        } catch (e) {
                            addOutputLine('⚠️ Archivo build.json no válido', 'warning');
                        }
                    }
                }
                
                // Abrir archivo principal si existe
                const mainFile = files.find(file => 
                    file.name === 'main.c' || 
                    file.name === 'index.c' || 
                    file.name.toLowerCase().includes('main')
                );
                
                if (mainFile) {
                    openFileFromPath(mainFile.path);
                    addOutputLine(`📖 Abriendo archivo principal: ${mainFile.name}`, 'success');
                } else if (cFiles.length > 0) {
                    openFileFromPath(cFiles[0].path);
                    addOutputLine(`📖 Abriendo primer archivo de código: ${cFiles[0].name}`, 'success');
                }
                
                currentProject = projectPath;
                addOutputLine('🎯 Proyecto abierto correctamente', 'success');
                
            } else {
                addOutputLine(`Error listando archivos: ${listResult.error}`, 'error');
            }
            
        } else {
            addOutputLine('⚠️  Función de abrir proyecto solo disponible en Electron', 'warning');
        }
        
    } catch (error) {
        console.error('Error en openProject:', error);
        addOutputLine(`Error abriendo proyecto: ${error.message}`, 'error');
    }
}

// Función auxiliar para abrir archivo desde path
async function openFileFromPath(filePath) {
    try {
        if (electronIpc) {
            const result = await electronIpc.invoke('read-file', filePath);
            if (result.success) {
                openFileInEditor(filePath, result.content, false);
            } else {
                addOutputLine(`Error leyendo archivo: ${result.error}`, 'error');
            }
        }
    } catch (error) {
        console.error('Error abriendo archivo:', error);
        addOutputLine(`Error: ${error.message}`, 'error');
    }
}

// Exponer funciones globalmente para acceso desde HTML
window.createNewProject = createNewProject;
window.openProject = openProject;
window.openFileFromPath = openFileFromPath;

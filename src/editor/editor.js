// editor.js - Funciones del editor Monaco (Versión simplificada)
// Samaruc Code - IDE para desarrollo de juegos retro

// Variables globales del editor
let monaco;
let editor;
let currentProject = null;
let openFiles = new Map();
let activeFile = null;
let filesOpenedCount = 0;

// Inicializar Monaco Editor - Versión simplificada
function initializeMonaco() {
    console.log('Iniciando Monaco Editor...');
    
    // Verificar si ya está inicializado
    if (window.monaco) {
        console.log('Monaco ya disponible');
        setupBasicCLanguage();
        defineCustomTheme();
        initializeEditor();
        return;
    }
    
    // Verificar AMD loader
    if (typeof require === 'undefined') {
        console.warn('AMD loader no disponible, usando editor básico');
        initializeBasicEditor();
        return;
    }

    // Configurar y cargar Monaco
    require.config({ 
        paths: { 
            'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' 
        }
    });

    require(['vs/editor/editor.main'], function() {
        console.log('Monaco cargado correctamente');
        window.monaco = monaco;
        
        // Configurar lenguaje C básico
        setupBasicCLanguage();
        
        // Definir tema
        defineCustomTheme();
        
        initializeEditor();
        window.addOutputLine?.('Monaco Editor cargado correctamente', 'success');
    }, function(error) {
        console.error('Error cargando Monaco:', error);
        initializeBasicEditor();
    });
}

// Configurar lenguaje C básico
function setupBasicCLanguage() {
    if (!monaco || !monaco.languages) {
        console.error('Monaco no disponible para configurar lenguaje C');
        return;
    }
    
    console.log('Configurando lenguaje C...');
    // El lenguaje C ya viene incluido en Monaco, solo necesitamos verificar que esté disponible
}

// Definir tema personalizado
function defineCustomTheme() {
    if (!monaco || !monaco.editor) {
        console.error('Monaco no disponible para definir tema');
        return;
    }
    
    try {
        monaco.editor.defineTheme('retro-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'preprocessor', foreground: 'C586C0' }
            ],
            colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4',
                'editorLineNumber.foreground': '#858585',
                'editor.selectionBackground': '#264F78'
            }
        });
        console.log('Tema personalizado definido');
    } catch (error) {
        console.error('Error definiendo tema:', error);
    }
}

// Inicializar editor básico (fallback)
function initializeBasicEditor() {
    const container = document.getElementById('monaco-editor');
    if (!container) return;
    
    container.innerHTML = `
        <div class="basic-editor">
            <textarea id="basic-textarea" placeholder="Escribe tu código aquí..."></textarea>
        </div>
    `;
    
    const textarea = document.getElementById('basic-textarea');
    if (textarea) {
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            background: #1E1E1E;
            color: #D4D4D4;
            border: none;
            outline: none;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            padding: 10px;
            resize: none;
            tab-size: 4;
        `;
        
        // Función para establecer contenido
        window.setEditorContent = (content) => {
            textarea.value = content || '';
        };
        
        // Función para obtener contenido
        window.getEditorContent = () => {
            return textarea.value;
        };
    }
    
    console.log('Editor básico inicializado');
    window.addOutputLine?.('Editor básico inicializado', 'info');
}

// Inicializar editor principal
function initializeEditor() {
    const container = document.getElementById('monaco-editor');
    if (!container) return;
    
    container.innerHTML = `
        <div class="welcome-screen">
            <div class="welcome-content">
                <h1><i class="fas fa-fish"></i> Samaruc Code</h1>
                <p>IDE para desarrollo de juegos retro en C</p>
                <div class="welcome-actions">
                    <button class="btn btn-primary btn-large" onclick="openProject()">
                        <i class="fas fa-folder-open"></i> Abrir Proyecto
                    </button>
                    <button class="btn btn-secondary btn-large" onclick="createNewProject()">
                        <i class="fas fa-plus"></i> Nuevo Proyecto
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Crear editor para archivo
function createEditor(content = '', language = 'c') {
    if (!monaco) {
        // Usar editor básico si Monaco no está disponible
        if (window.setEditorContent) {
            window.setEditorContent(content);
        }
        return;
    }
    
    const container = document.getElementById('monaco-editor');
    if (!container) return;
    
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
        matchBrackets: 'always',
        autoIndent: 'full',
        formatOnPaste: true,
        formatOnType: true
    });
    
    // Escuchar cambios
    editor.onDidChangeModelContent(() => {
        if (activeFile) {
            markFileAsModified(activeFile);
        }
    });
    
    // Atajos de teclado del editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveCurrentFile();
    });
    
    editor.addCommand(monaco.KeyCode.F5, () => {
        window.compileProject?.();
    });
    
    editor.addCommand(monaco.KeyCode.F6, () => {
        window.compileAndRun?.();
    });
}

// Abrir archivo en editor
function openFileInEditor(filePath, content, isNew = false) {
    //console.log('openFileInEditor llamada con:', { filePath, contentLength: content?.length, isNew });
    
    // Validar parámetros
    if (!filePath || content === undefined) {
        window.addOutputLine?.('Error: Parámetros inválidos para abrir archivo', 'error');
        console.error('Parámetros inválidos:', { filePath, content });
        return;
    }
    
    // Validar que filePath sea string
    if (typeof filePath !== 'string') {
        window.addOutputLine?.('Error: Ruta de archivo inválida', 'error');
        return;
    }
    
    // Si ya está abierto, cambiar a esa pestaña
    if (openFiles.has(filePath)) {
        switchToFile(filePath);
        window.addOutputLine?.(`Cambiando a archivo ya abierto: ${window.safePath?.basename(filePath) || filePath}`, 'info');
        return;
    }
    
    // Detectar el tipo de archivo y preparar el contenido
    const language = window.getLanguageFromFile?.(filePath) || 'plaintext';
    
    // Validar que el contenido sea texto
    if (typeof content !== 'string') {
        try {
            content = String(content);
        } catch (error) {
            window.addOutputLine?.('Error: El archivo no contiene texto válido', 'error');
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
    window.createTab?.(filePath);
    
    // Cambiar a este archivo
    switchToFile(filePath);
    
    // Actualizar título de la ventana
    window.updateWindowTitle?.(filePath);
    
    window.addOutputLine?.(`Archivo abierto: ${window.safePath?.basename(filePath) || filePath} (${language})`, 'success');
    
    // Easter egg del samaruc cada 5 archivos
    filesOpenedCount++;
    if (filesOpenedCount % 5 === 0) {
        setTimeout(() => window.showSamarucMessage?.(), 1000);
    }
    
    // Añadir a archivos recientes solo si no es un archivo nuevo
    if (!isNew && window.addToRecentFiles) {
        window.addToRecentFiles(filePath);
    }
}

// Cambiar a archivo
function switchToFile(filePath) {
    activeFile = filePath;
    const fileData = openFiles.get(filePath);
    
    if (!fileData) {
        console.error('Archivo no encontrado en openFiles:', filePath);
        return;
    }
    
    // Actualizar pestañas
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.file === filePath);
    });
    
    // Crear/actualizar editor
    if (editor && editor.dispose) {
        editor.dispose();
    }
    
    const language = window.getLanguageFromFile?.(filePath) || 'plaintext';
    
    if (monaco) {
        createEditor(fileData.content, language);
    } else if (window.setEditorContent) {
        window.setEditorContent(fileData.content);
    }
}

// Marcar archivo como modificado
function markFileAsModified(filePath) {
    const fileData = openFiles.get(filePath);
    if (fileData && !fileData.modified) {
        fileData.modified = true;
        window.updateTabTitle?.(filePath);
    }
}

// Cerrar archivo
function closeFile(filePath) {
    const fileData = openFiles.get(filePath);
    if (fileData && fileData.modified) {
        const shouldSave = confirm(`El archivo ${window.safePath?.basename(filePath) || filePath} tiene cambios sin guardar. ¿Deseas guardarlo?`);
        if (shouldSave) {
            // Intentar guardar antes de cerrar
            if (window.saveFile) {
                window.saveFile(filePath);
            }
        }
    }
    
    openFiles.delete(filePath);
    
    // Remover pestaña
    const tab = document.querySelector(`[data-file="${filePath}"]`);
    if (tab) {
        tab.remove();
    }
    
    // Si era el archivo activo, cambiar a otro
    if (activeFile === filePath) {
        const remainingFiles = Array.from(openFiles.keys());
        if (remainingFiles.length > 0) {
            switchToFile(remainingFiles[0]);
        } else {
            activeFile = null;
            initializeEditor(); // Mostrar pantalla de bienvenida
        }
    }
    
    window.addOutputLine?.(`Archivo cerrado: ${window.safePath?.basename(filePath) || filePath}`, 'info');
}

// Obtener contenido actual del editor
function getCurrentEditorContent() {
    if (editor && editor.getValue) {
        return editor.getValue();
    } else if (window.getEditorContent) {
        return window.getEditorContent();
    }
    return '';
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.monaco = monaco;
    window.editor = editor;
    window.currentProject = currentProject;
    window.openFiles = openFiles;
    window.activeFile = activeFile;
    window.filesOpenedCount = filesOpenedCount;
    
    window.initializeMonaco = initializeMonaco;
    window.initializeBasicEditor = initializeBasicEditor;
    window.initializeEditor = initializeEditor;
    window.createEditor = createEditor;
    window.openFileInEditor = openFileInEditor;
    window.switchToFile = switchToFile;
    window.markFileAsModified = markFileAsModified;
    window.closeFile = closeFile;
    window.getCurrentEditorContent = getCurrentEditorContent;
}

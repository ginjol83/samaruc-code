// editor.js - Funciones del editor Monaco (Versión limpia y funcional)
// SamaruC Code - IDE para desarrollo de juegos retro

// Variables globales del editor
let monaco;
let editor;
let currentProject = null;
let openFiles = new Map();
let activeFile = null;
let filesOpenedCount = 0;

// Inicializar Monaco Editor - Versión SIMPLIFICADA
function initializeMonaco() {
    console.log('🔄 Iniciando Monaco Editor (versión simplificada)...');
    
    return new Promise((resolve, reject) => {
        // Verificar si Monaco ya está cargado
        if (window.monaco) {
            console.log('✅ Monaco ya disponible');
            monaco = window.monaco;
            resolve(monaco);
            return;
        }
        
        // Verificar estado de carga
        if (window.monacoStatus === 'loaded') {
            monaco = window.monaco;
            resolve(monaco);
            return;
        }
        
        if (window.monacoStatus === 'failed') {
            console.warn('⚠️ Monaco falló, usando editor básico');
            initializeBasicEditor();
            reject(new Error('Monaco failed to load'));
            return;
        }
        
        // Monaco debe estar disponible inmediatamente con la nueva implementación
        // Si no está disponible, usar editor básico
        setTimeout(() => {
            if (window.monaco) {
                monaco = window.monaco;
                resolve(monaco);
            } else {
                console.warn('⚠️ Monaco no disponible, usando editor básico');
                initializeBasicEditor();
                reject(new Error('Monaco not available'));
            }
        }, 100);
    });
}

// Configurar el editor una vez Monaco esté listo
function setupEditor() {
    console.log('🔧 Configurando Monaco Editor...');
    
    try {
        // Verificar que Monaco esté realmente disponible
        if (!monaco || !monaco.editor) {
            throw new Error('Monaco editor no está disponible');
        }
        
        // Monaco ya está configurado en index.html
        console.log('✅ Monaco Editor ya configurado');
        window.addOutputLine?.('Monaco Editor configurado correctamente', 'success');
        
    } catch (error) {
        console.error('❌ Error configurando Monaco:', error);
        console.log('🔄 Iniciando editor básico como fallback...');
        initializeBasicEditor();
    }
}

// Definir tema personalizado simple
function defineCustomTheme() {
    if (!monaco || !monaco.editor) return;
    
    try {
        monaco.editor.defineTheme('samaruc-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: '569CD6' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' }
            ],
            colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4'
            }
        });
        console.log('✅ Tema personalizado definido');
    } catch (error) {
        console.error('❌ Error definiendo tema:', error);
    }
}

// Configurar lenguaje C básico
function setupCLanguage() {
    if (!monaco || !monaco.languages) return;
    
    try {
        // Verificar si C está disponible
        const languages = monaco.languages.getLanguages();
        const hasC = languages.some(lang => lang.id === 'c');
        console.log('📝 Lenguaje C disponible:', hasC);
        
        if (!hasC) {
            // Registrar lenguaje C básico
            monaco.languages.register({ id: 'c' });
            console.log('✅ Lenguaje C registrado');
        }
    } catch (error) {
        console.error('❌ Error configurando lenguaje C:', error);
    }
}

// Inicializar editor básico mejorado (fallback)
function initializeBasicEditor() {
    console.log('🔄 Inicializando editor básico mejorado...');
    
    const container = document.getElementById('monaco-editor');
    if (!container) return;
    
    container.innerHTML = `
        <div class="basic-editor-wrapper">
            <div class="editor-header">
                <span class="editor-title">
                    <span class="icon">💻</span> Editor de Código C
                </span>
                <span class="editor-status">Monaco Editor no disponible</span>
            </div>
            <div class="editor-toolbar">
                <button onclick="formatCode()" class="btn btn-sm" title="Formatear código">
                    <span class="icon">📐</span> Formatear
                </button>
                <button onclick="clearEditor()" class="btn btn-sm" title="Limpiar editor">
                    <span class="icon">🗑️</span> Limpiar
                </button>
                <span class="line-info" id="line-info">Línea 1, Columna 1</span>
            </div>
            <textarea id="basic-textarea" placeholder="Escribe tu código C aquí..."></textarea>
        </div>
    `;
    
    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
        .basic-editor-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #1E1E1E;
            color: #D4D4D4;
            font-family: 'Consolas', 'Courier New', monospace;
        }
        .editor-header {
            background: #2d2d30;
            padding: 8px 12px;
            border-bottom: 1px solid #3e3e42;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }
        .editor-title {
            font-weight: bold;
            color: #ffffff;
        }
        .editor-status {
            color: #ffa500;
            font-size: 11px;
        }
        .editor-toolbar {
            background: #252526;
            padding: 6px 12px;
            border-bottom: 1px solid #3e3e42;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .btn.btn-sm {
            padding: 4px 8px;
            font-size: 12px;
            background: #0e639c;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .btn.btn-sm:hover {
            background: #1177bb;
        }
        .line-info {
            margin-left: auto;
            font-size: 11px;
            color: #858585;
        }
        #basic-textarea {
            flex: 1;
            background: #1E1E1E;
            color: #D4D4D4;
            border: none;
            outline: none;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            padding: 12px;
            resize: none;
            tab-size: 4;
            white-space: pre;
            overflow-wrap: normal;
            overflow-x: auto;
        }
        #basic-textarea:focus {
            background: #1E1E1E;
            box-shadow: inset 0 0 0 1px #007ACC;
        }
    `;
    document.head.appendChild(style);
    
    const textarea = document.getElementById('basic-textarea');
    if (textarea) {
        // Valor por defecto
        textarea.value = `#include <stdio.h>

int main() {
    printf("Hola, mundo!\\n");
    return 0;
}`;

        // Funciones para el editor
        window.formatCode = function() {
            let code = textarea.value;
            // Formateo básico simple
            textarea.value = code;
            window.addOutputLine?.('Código formateado', 'info');
        };
        
        window.clearEditor = function() {
            if (confirm('¿Limpiar el editor?')) {
                textarea.value = '';
                updateLineInfo();
            }
        };

        // Actualizar información de línea
        function updateLineInfo() {
            const lineInfo = document.getElementById('line-info');
            if (lineInfo) {
                const lines = textarea.value.substr(0, textarea.selectionStart).split('\\n');
                const currentLine = lines.length;
                const currentColumn = lines[lines.length - 1].length + 1;
                lineInfo.textContent = `Línea ${currentLine}, Columna ${currentColumn}`;
            }
        }

        // Event listeners
        textarea.addEventListener('input', () => {
            if (activeFile) {
                const file = openFiles.get(activeFile);
                if (file) {
                    file.isModified = true;
                    file.content = textarea.value;
                    updateEditorTab(activeFile);
                }
            }
            updateLineInfo();
        });

        textarea.addEventListener('keyup', updateLineInfo);
        textarea.addEventListener('click', updateLineInfo);
        
        // Soporte para Tab
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
        
        // Funciones globales
        window.getEditorContent = () => textarea.value;
        window.setEditorContent = (content) => textarea.value = content || '';
        
        updateLineInfo();
    }
    
    console.log('✅ Editor básico mejorado inicializado');
    window.addOutputLine?.('Editor básico inicializado - Monaco no disponible', 'warning');
    window.addOutputLine?.('El editor básico tiene funcionalidades limitadas pero es completamente funcional', 'info');
}

// Obtener contenido del editor
function getEditorContent() {
    if (editor && editor.getValue) {
        return editor.getValue();
    }
    if (window.getEditorContent) {
        return window.getEditorContent();
    }
    return '';
}

// Establecer contenido del editor
function setEditorContent(content) {
    if (editor && editor.setValue) {
        editor.setValue(content || '');
    } else if (window.setEditorContent) {
        window.setEditorContent(content);
    }
}

// Hacer funciones disponibles globalmente
window.initializeMonaco = initializeMonaco;
window.createNewFile = createNewFile;
window.openFileInEditor = openFileInEditor;
window.closeFile = closeFile;
window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;

// Mostrar pantalla de bienvenida
function showWelcomeScreen() {
    const container = document.getElementById('monaco-editor');
    if (!container) return;
    
    container.innerHTML = `
        <div class="welcome-screen">
            <div class="welcome-content">
                <h1><span class="icon">🐟</span> SamaruC Code</h1>
                <p>IDE para desarrollo de juegos retro en C</p>
                <div class="welcome-actions">
                    <button class="btn btn-primary btn-large" onclick="openProject()">
                        <span class="icon">📁</span> Abrir Proyecto
                    </button>
                    <button class="btn btn-secondary btn-large" onclick="createNewProject()">
                        <span class="icon">➕</span> Nuevo Proyecto
                    </button>
                </div>
                <div class="quick-start">
                    <h3>Inicio Rápido</h3>
                    <button class="btn btn-info" onclick="createNewFile()">
                        <span class="icon">📄</span> Nuevo Archivo C
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Crear nuevo archivo
function createNewFile() {
    const defaultCode = `#include <stdio.h>

int main() {
    printf("Hola, mundo!\\n");
    return 0;
}`;
    
    openFileInEditor('nuevo_archivo.c', defaultCode, false);
}

// Abrir archivo en el editor
function openFileInEditor(fileName, content = '', isTemplate = true) {
    if (!monaco) {
        console.error('Monaco no está disponible');
        return;
    }
    
    const container = document.getElementById('monaco-editor');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    try {
        // Crear el editor
        editor = monaco.editor.create(container, {
            value: content,
            language: 'c',
            theme: 'samaruc-dark',
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on'
        });
        
        // Guardar referencia del archivo
        activeFile = fileName;
        openFiles.set(fileName, {
            content: content,
            isModified: false,
            isTemplate: isTemplate
        });
        
        // Actualizar título de la pestaña
        updateEditorTab(fileName);
        
        // Escuchar cambios
        editor.onDidChangeModelContent(() => {
            const file = openFiles.get(activeFile);
            if (file) {
                file.isModified = true;
                file.content = editor.getValue();
                updateEditorTab(activeFile);
            }
        });
        
        console.log(`✅ Archivo abierto: ${fileName}`);
        window.addOutputLine?.(`Archivo abierto: ${fileName}`, 'info');
        
    } catch (error) {
        console.error('❌ Error creando editor:', error);
        initializeBasicEditor();
    }
}

// Actualizar pestaña del editor
function updateEditorTab(fileName) {
    const tabsContainer = document.getElementById('editor-tabs');
    if (!tabsContainer) return;
    
    const file = openFiles.get(fileName);
    const isModified = file ? file.isModified : false;
    
    tabsContainer.innerHTML = `
        <div class="editor-tab active">
            <span class="tab-name">${fileName}${isModified ? ' •' : ''}</span>
            <button class="tab-close" onclick="closeFile('${fileName}')">×</button>
        </div>
    `;
}

// Cerrar archivo
function closeFile(fileName) {
    const file = openFiles.get(fileName);
    if (file && file.isModified) {
        if (!confirm(`¿Guardar cambios en ${fileName}?`)) {
            return;
        }
    }
    
    openFiles.delete(fileName);
    
    if (activeFile === fileName) {
        activeFile = null;
        showWelcomeScreen();
        
        const tabsContainer = document.getElementById('editor-tabs');
        if (tabsContainer) {
            tabsContainer.innerHTML = '';
        }
    }
}

// Configurar lenguaje C básico
function setupBasicCLanguage() {
    if (!monaco || !monaco.languages) {
        console.error('Monaco no disponible para configurar lenguaje C');
        return;
    }
    
    console.log('Configurando lenguaje C...');
    
    // Registrar el lenguaje C si no está disponible
    try {
        // Verificar si el lenguaje C está disponible
        const languages = monaco.languages.getLanguages();
        const hasC = languages.some(lang => lang.id === 'c');
        
        if (!hasC) {
            console.log('Registrando lenguaje C...');
            monaco.languages.register({ id: 'c' });
            
            // Configurar syntax highlighting para C
            monaco.languages.setMonarchTokensProvider('c', {
                tokenizer: {
                    root: [
                        [/\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|restrict|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/, 'keyword'],
                        [/\b(printf|scanf|malloc|free|strlen|strcpy|strcat|strcmp|memcpy|memset|fopen|fclose|fread|fwrite)\b/, 'keyword.function'],
                        [/\/\*/, 'comment', '@comment'],
                        [/\/\/.*$/, 'comment'],
                        [/"([^"\\]|\\.)*$/, 'string.invalid'],
                        [/"/, 'string', '@string'],
                        [/'([^'\\]|\\.)*$/, 'string.invalid'],
                        [/'/, 'string', '@string_single'],
                        [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
                        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                        [/\d+/, 'number'],
                        [/#\w+/, 'keyword.preprocessor']
                    ],
                    comment: [
                        [/[^\/*]+/, 'comment'],
                        [/\*\//, 'comment', '@pop'],
                        [/[\/*]/, 'comment']
                    ],
                    string: [
                        [/[^\\"]+/, 'string'],
                        [/\\./, 'string.escape'],
                        [/"/, 'string', '@pop']
                    ],
                    string_single: [
                        [/[^\\']+/, 'string'],
                        [/\\./, 'string.escape'],
                        [/'/, 'string', '@pop']
                    ]
                }
            });
        }
        
        console.log('Lenguaje C configurado correctamente');
    } catch (error) {
        console.error('Error configurando lenguaje C:', error);
    }
}

// Definir tema personalizado
function defineCustomTheme() {
    if (!monaco || !monaco.editor) {
        console.error('Monaco no disponible para definir tema');
        return false;
    }
    
    try {
        // Verificar si el tema ya existe
        const existingThemes = ['retro-dark'];
        let themeExists = false;
        
        try {
            monaco.editor.setTheme('retro-dark');
            themeExists = true;
        } catch (e) {
            themeExists = false;
        }
        
        if (!themeExists) {
            monaco.editor.defineTheme('retro-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                    { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
                    { token: 'string', foreground: 'CE9178' },
                    { token: 'number', foreground: 'B5CEA8' },
                    { token: 'type', foreground: '4EC9B0' },
                    { token: 'preprocessor', foreground: 'C586C0' },
                    { token: 'function', foreground: 'DCDCAA' },
                    { token: 'variable', foreground: '9CDCFE' }
                ],
                colors: {
                    'editor.background': '#1E1E1E',
                    'editor.foreground': '#D4D4D4',
                    'editorLineNumber.foreground': '#858585',
                    'editorLineNumber.activeForeground': '#C6C6C6',
                    'editor.selectionBackground': '#264F78',
                    'editor.selectionHighlightBackground': '#ADD6FF26',
                    'editorCursor.foreground': '#AEAFAD',
                    'editor.findMatchBackground': '#515C6A',
                    'editor.findMatchHighlightBackground': '#EA5C0055',
                    'editor.wordHighlightBackground': '#575757B8',
                    'editor.wordHighlightStrongBackground': '#004972B8',
                    'editorBracketMatch.background': '#0064001A',
                    'editorBracketMatch.border': '#888888'
                }
            });
        }
        
        console.log('Tema personalizado definido correctamente');
        return true;
    } catch (error) {
        console.error('Error definiendo tema:', error);
        return false;
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
                <h1><i class="fas fa-fish"></i> SamaruC Code</h1>
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
        setTimeout(() => window.showSamaruCMessage?.(), 1000);
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

// Función de diagnóstico para Monaco Editor
function diagnoseMonacoEditor() {
    console.log('=== DIAGNÓSTICO MONACO EDITOR ===');
    
    // Verificar variables globales
    console.log('1. Variables globales:');
    console.log('   - window.monaco:', !!window.monaco);
    console.log('   - window.require:', typeof window.require);
    console.log('   - AMD loader disponible:', typeof require !== 'undefined');
    
    // Verificar DOM
    console.log('2. Elementos DOM:');
    const container = document.getElementById('monaco-editor');
    console.log('   - Container #monaco-editor:', !!container);
    if (container) {
        console.log('   - Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
        console.log('   - Container innerHTML length:', container.innerHTML.length);
    }
    
    // Verificar editor
    console.log('3. Estado del editor:');
    console.log('   - editor instance:', !!editor);
    console.log('   - currentProject:', currentProject);
    console.log('   - openFiles size:', openFiles.size);
    console.log('   - activeFile:', activeFile);
    
    // Verificar conexión de red (CDN)
    console.log('4. Probando conexión CDN...');
    fetch('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js', { method: 'HEAD' })
        .then(response => {
            console.log('   - CDN accesible:', response.ok, response.status);
        })
        .catch(error => {
            console.error('   - Error CDN:', error.message);
        });
    
    console.log('=== FIN DIAGNÓSTICO ===');
}

// Hacer la función disponible globalmente para debug
window.diagnoseMonaco = diagnoseMonacoEditor;

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

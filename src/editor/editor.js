// editor.js - Funciones del editor Monaco
// Samaruc Code - IDE para desarrollo de juegos retro

// Variables globales del editor
let monaco;
let editor;
let currentProject = null;
let openFiles = new Map();
let activeFile = null;
let filesOpenedCount = 0;

// Inicializar Monaco Editor
function initializeMonaco() {
    try {
        if (typeof require === 'undefined') {
            console.warn('AMD loader no disponible, usando editor básico');
            initializeBasicEditor();
            return;
        }

        require.config({ 
            paths: { 
                'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' 
            },
            'vs/nls': {
                availableLanguages: {
                    '*': 'es'
                }
            }
        });

        require(['vs/editor/editor.main'], function() {
            try {
                // Configurar lenguajes personalizados para C/C++
                setupLanguageConfiguration();
                
                // Definir tema personalizado
                monaco.editor.defineTheme('retro-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                        { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
                        { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
                        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
                        { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
                        { token: 'keyword.operator', foreground: 'D4D4D4' },
                        { token: 'string', foreground: 'CE9178' },
                        { token: 'string.escape', foreground: 'D7BA7D' },
                        { token: 'number', foreground: 'B5CEA8' },
                        { token: 'number.hex', foreground: 'B5CEA8' },
                        { token: 'number.float', foreground: 'B5CEA8' },
                        { token: 'function', foreground: 'DCDCAA' },
                        { token: 'type', foreground: '4EC9B0' },
                        { token: 'type.identifier', foreground: '4EC9B0' },
                        { token: 'variable', foreground: '9CDCFE' },
                        { token: 'variable.parameter', foreground: '9CDCFE' },
                        { token: 'constant', foreground: '4FC1FF' },
                        { token: 'preprocessor', foreground: 'C586C0' },
                        { token: 'macro', foreground: 'C586C0' }
                    ],
                    colors: {
                        'editor.background': '#1E1E1E',
                        'editor.foreground': '#D4D4D4',
                        'editorLineNumber.foreground': '#858585',
                        'editor.selectionBackground': '#264F78',
                        'editor.lineHighlightBackground': '#2D2D30'
                    }
                });

                console.log('Monaco Editor inicializado correctamente');
                window.addOutputLine?.('Monaco Editor cargado correctamente', 'success');
                initializeEditor();
            } catch (error) {
                console.error('Error configurando Monaco:', error);
                window.addOutputLine?.(`Error configurando Monaco: ${error.message}`, 'error');
                initializeBasicEditor();
            }
        }, function(error) {
            console.error('Error cargando Monaco Editor:', error);
            window.addOutputLine?.('Error cargando Monaco Editor, usando editor básico', 'warning');
            initializeBasicEditor();
        });
    } catch (error) {
        console.error('Error inicializando Monaco:', error);
        window.addOutputLine?.(`Error inicializando Monaco: ${error.message}`, 'error');
        initializeBasicEditor();
    }
}

// Configurar lenguajes personalizados
function setupLanguageConfiguration() {
    // Registrar lenguaje C personalizado con mejor sintaxis
    monaco.languages.register({ id: 'c' });
    
    // Configurar tokens para C
    monaco.languages.setMonarchTokensProvider('c', {
        keywords: [
            'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
            'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
            'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
            'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while',
            'inline', 'restrict', '_Bool', '_Complex', '_Imaginary'
        ],
        
        typeKeywords: [
            'bool', 'char', 'double', 'float', 'int', 'long', 'short', 'signed',
            'unsigned', 'void', 'size_t', 'ssize_t', 'ptrdiff_t', 'wchar_t'
        ],
        
        operators: [
            '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
            '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
            '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
            '%=', '<<=', '>>=', '>>>='
        ],
        
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        
        tokenizer: {
            root: [
                // Preprocessor directives
                [/^\s*#\s*\w+/, 'preprocessor'],
                
                // identifiers and keywords
                [/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'type',
                                             '@keywords': 'keyword',
                                             '@default': 'identifier' } }],
                [/[A-Z][\w\$]*/, 'type.identifier'],
                
                // whitespace
                { include: '@whitespace' },
                
                // delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, { cases: { '@operators': 'operator',
                                        '@default'  : '' } } ],
                
                // numbers
                [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+[Ll]?/, 'number.hex'],
                [/0[0-7]+[Ll]?/, 'number.octal'],
                [/\d+[lL]?/, 'number'],
                
                // delimiter: after number because of .\d floats
                [/[;,.]/, 'delimiter'],
                
                // strings
                [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
                [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],
                
                // characters
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string','string.escape','string']],
                [/'/, 'string.invalid']
            ],
            
            comment: [
                [/[^\/*]+/, 'comment' ],
                [/\/\*/,    'comment', '@push' ],    // nested comment
                ["\\*/",    'comment', '@pop'  ],
                [/[\/*]/,   'comment' ]
            ],
            
            string: [
                [/[^\\"]+/,  'string'],
                [/@escapes/, 'string.escape'],
                [/\\./,      'string.escape.invalid'],
                [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
            ],
            
            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/,       'comment', '@comment' ],
                [/\/\/.*$/,    'comment'],
            ],
        },
    });
    
    // Configurar autocompletado para C
    monaco.languages.registerCompletionItemProvider('c', {
        provideCompletionItems: function(model, position) {
            const suggestions = [
                // Funciones stdio.h
                {
                    label: 'printf',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'printf("${1:format}", ${2:args});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Imprime texto formateado a stdout'
                },
                {
                    label: 'scanf',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'scanf("${1:format}", ${2:&variable});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Lee datos formateados desde stdin'
                },
                {
                    label: 'fprintf',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'fprintf(${1:stream}, "${2:format}", ${3:args});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Imprime texto formateado a un stream'
                },
                
                // Funciones string.h
                {
                    label: 'strlen',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'strlen(${1:str})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Obtiene la longitud de una cadena'
                },
                {
                    label: 'strcpy',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'strcpy(${1:dest}, ${2:src});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Copia una cadena'
                },
                {
                    label: 'strcmp',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'strcmp(${1:str1}, ${2:str2})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Compara dos cadenas'
                },
                
                // Funciones stdlib.h
                {
                    label: 'malloc',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'malloc(${1:size})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Asigna memoria dinámicamente'
                },
                {
                    label: 'free',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'free(${1:ptr});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Libera memoria asignada dinámicamente'
                },
                {
                    label: 'calloc',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'calloc(${1:num}, ${2:size})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Asigna memoria inicializada a cero'
                },
                
                // Estructuras de control
                {
                    label: 'if',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'if (${1:condition}) {\n\t${2:// código}\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Estructura condicional if'
                },
                {
                    label: 'for',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'for (${1:int i = 0}; ${2:i < count}; ${3:i++}) {\n\t${4:// código}\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Bucle for'
                },
                {
                    label: 'while',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'while (${1:condition}) {\n\t${2:// código}\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Bucle while'
                },
                
                // Plantillas comunes
                {
                    label: 'main',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'int main() {\n\t${1:// código principal}\n\treturn 0;\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Función main básica'
                },
                {
                    label: 'struct',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'typedef struct {\n\t${1:// campos}\n} ${2:NombreStruct};',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Definición de estructura'
                }
            ];
            
            return { suggestions: suggestions };
        }
    });
    
    console.log('Configuración de lenguaje C mejorada aplicada');
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
        formatOnType: true,
        suggest: {
            enabledCompletionItems: ['snippet', 'text', 'keyword', 'function', 'constructor', 'field', 'variable', 'class', 'interface', 'module', 'property', 'value', 'enum', 'reference', 'color', 'file', 'folder'],
            insertMode: 'replace',
            filterGraceful: true,
            showKeywords: true,
            showWords: true,
            showSnippets: true
        },
        quickSuggestions: {
            other: true,
            comments: false,
            strings: false
        },
        parameterHints: {
            enabled: true
        },
        snippetSuggestions: 'top',
        wordBasedSuggestions: true,
        // Configuraciones específicas para C
        renderWhitespace: 'selection',
        renderControlCharacters: true,
        fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
        fontLigatures: true,
        cursorStyle: 'line',
        cursorBlinking: 'blink',
        mouseWheelZoom: true,
        occurrencesHighlight: true,
        selectionHighlight: true,
        codeLens: true,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'mouseover',
        foldingHighlight: true,
        rulers: [80, 120]
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
    console.log('openFileInEditor llamada con:', { filePath, contentLength: content?.length, isNew });
    
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
    
    // Verificar si el archivo es muy grande (más de 2MB)
    if (content.length > 2 * 1024 * 1024) {
        const fileSize = (content.length / (1024 * 1024)).toFixed(2);
        const shouldContinue = confirm(
            `El archivo ${window.safePath?.basename(filePath) || filePath} es muy grande (${fileSize}MB). ` +
            '¿Deseas abrirlo de todas formas? Esto podría afectar el rendimiento del editor.'
        );
        if (!shouldContinue) {
            window.addOutputLine?.('Apertura de archivo cancelada por el usuario', 'info');
            return;
        }
    }
    
    // Detectar si es un archivo binario
    if (window.isBinaryFile?.(content)) {
        const shouldContinue = confirm(
            `El archivo ${window.safePath?.basename(filePath) || filePath} parece ser un archivo binario. ` +
            '¿Deseas abrirlo como texto de todas formas?'
        );
        if (!shouldContinue) {
            window.addOutputLine?.('Apertura de archivo binario cancelada por el usuario', 'info');
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
    
    window.addOutputLine?.(`Archivo abierto: ${window.safePath?.basename(filePath) || filePath} (${language}, ${window.formatFileSize?.(content.length) || content.length + ' bytes'})`, 'success');
    
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

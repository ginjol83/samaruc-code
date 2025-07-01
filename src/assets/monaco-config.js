/* Configuración adicional para Monaco Editor */

/* Autocompletado mejorado para C */
const cKeywords = [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
    'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
    'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
    'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while'
];

const cLibraryFunctions = [
    'printf', 'scanf', 'malloc', 'free', 'strlen', 'strcpy', 'strcmp',
    'strcat', 'memcpy', 'memset', 'fopen', 'fclose', 'fread', 'fwrite',
    'fprintf', 'fscanf', 'getchar', 'putchar', 'gets', 'puts', 'exit',
    'rand', 'srand', 'time', 'clock', 'system', 'abs', 'pow', 'sqrt'
];

// Configurar autocompletado personalizado
function setupCAutocompletion(monaco, editor) {
    monaco.languages.registerCompletionItemProvider('c', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const suggestions = [];

            // Palabras clave
            cKeywords.forEach(keyword => {
                suggestions.push({
                    label: keyword,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                    range: range
                });
            });

            // Funciones de biblioteca
            cLibraryFunctions.forEach(func => {
                suggestions.push({
                    label: func,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: func + '()',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                });
            });

            // Snippets comunes
            const snippets = [
                {
                    label: 'main',
                    insertText: [
                        'int main() {',
                        '\t$0',
                        '\treturn 0;',
                        '}'
                    ].join('\n'),
                    documentation: 'Función main básica'
                },
                {
                    label: 'for',
                    insertText: [
                        'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {',
                        '\t$0',
                        '}'
                    ].join('\n'),
                    documentation: 'Bucle for'
                },
                {
                    label: 'while',
                    insertText: [
                        'while (${1:condition}) {',
                        '\t$0',
                        '}'
                    ].join('\n'),
                    documentation: 'Bucle while'
                },
                {
                    label: 'if',
                    insertText: [
                        'if (${1:condition}) {',
                        '\t$0',
                        '}'
                    ].join('\n'),
                    documentation: 'Declaración if'
                },
                {
                    label: 'printf',
                    insertText: 'printf("${1:Hello World}\\n");',
                    documentation: 'Imprimir texto'
                }
            ];

            snippets.forEach(snippet => {
                suggestions.push({
                    label: snippet.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: snippet.insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: snippet.documentation,
                    range: range
                });
            });

            return { suggestions: suggestions };
        }
    });
}

// Configurar diagnósticos básicos para C
function setupCDiagnostics(monaco, editor) {
    // Esta función se puede expandir para incluir validación básica de sintaxis
    monaco.languages.onLanguage('c', function() {
        // Configurar validación personalizada si es necesario
    });
}

// Exportar funciones para usar en renderer.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupCAutocompletion,
        setupCDiagnostics
    };
}

<template>
  <div ref="monacoContainer" class="monaco-editor-container"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

export default {
  name: 'MonacoEditor',
  props: {
    filePath: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'c'
    }
  },
  emits: ['content-change'],
  setup(props, { emit }) {
    const monacoContainer = ref(null)
    let editor = null
    
    onMounted(async () => {
      await nextTick()
      initializeMonaco()
    })
    
    onUnmounted(() => {
      if (editor) {
        editor.dispose()
      }
    })
    
    // Watch for content changes from outside
    watch(() => props.content, (newContent) => {
      if (editor && editor.getValue() !== newContent) {
        editor.setValue(newContent)
      }
    })
    
    // Watch for language changes
    watch(() => props.language, (newLanguage) => {
      if (editor) {
        const model = editor.getModel()
        if (model) {
          monaco.editor.setModelLanguage(model, newLanguage)
        }
      }
    })
    
    const initializeMonaco = () => {
      if (!monacoContainer.value) return
      
      // Configure Monaco Editor theme
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
      })
      
      // Create editor
      editor = monaco.editor.create(monacoContainer.value, {
        value: props.content,
        language: props.language,
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
          enabledCompletionItems: [
            'snippet', 'text', 'keyword', 'function', 
            'constructor', 'field', 'variable', 'class', 
            'interface', 'module', 'property', 'value', 
            'enum', 'reference', 'color', 'file', 'folder'
          ]
        }
      })
      
      // Listen for content changes
      editor.onDidChangeModelContent(() => {
        emit('content-change', editor.getValue())
      })
      
      // Add keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Save command will be handled by parent
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true,
          bubbles: true
        }))
      })
      
      editor.addCommand(monaco.KeyCode.F5, () => {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'F5',
          bubbles: true
        }))
      })
      
      editor.addCommand(monaco.KeyCode.F6, () => {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'F6',
          bubbles: true
        }))
      })
      
      // Setup C language features
      setupCLanguageFeatures()
    }
    
    const setupCLanguageFeatures = () => {
      // Register completion provider for C
      monaco.languages.registerCompletionItemProvider('c', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          }
          
          const suggestions = []
          
          // C keywords
          const keywords = [
            'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
            'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
            'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
            'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while'
          ]
          
          keywords.forEach(keyword => {
            suggestions.push({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range: range
            })
          })
          
          // Common C functions
          const functions = [
            'printf', 'scanf', 'malloc', 'free', 'strlen', 'strcpy', 'strcmp',
            'strcat', 'memcpy', 'memset', 'fopen', 'fclose', 'fread', 'fwrite',
            'fprintf', 'fscanf', 'getchar', 'putchar', 'gets', 'puts', 'exit',
            'rand', 'srand', 'time', 'clock', 'system', 'abs', 'pow', 'sqrt'
          ]
          
          functions.forEach(func => {
            suggestions.push({
              label: func,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: func + '($0)',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range
            })
          })
          
          // Code snippets
          const snippets = [
            {
              label: 'main',
              insertText: [
                'int main() {',
                '\t$0',
                '\treturn 0;',
                '}'
              ].join('\n'),
              documentation: 'Main function'
            },
            {
              label: 'for',
              insertText: [
                'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {',
                '\t$0',
                '}'
              ].join('\n'),
              documentation: 'For loop'
            },
            {
              label: 'while',
              insertText: [
                'while (${1:condition}) {',
                '\t$0',
                '}'
              ].join('\n'),
              documentation: 'While loop'
            },
            {
              label: 'if',
              insertText: [
                'if (${1:condition}) {',
                '\t$0',
                '}'
              ].join('\n'),
              documentation: 'If statement'
            },
            {
              label: 'printf',
              insertText: 'printf("${1:Hello World}\\n");',
              documentation: 'Print text'
            }
          ]
          
          snippets.forEach(snippet => {
            suggestions.push({
              label: snippet.label,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: snippet.insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: snippet.documentation,
              range: range
            })
          })
          
          return { suggestions }
        }
      })
    }
    
    return {
      monacoContainer
    }
  }
}
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
}
</style>

import { reactive, computed } from 'vue'

// Store reactivo para el estado global de la aplicación
export const store = reactive({
  // Estado del proyecto
  currentProject: null,
  projectFiles: [],
  
  // Estado del editor
  openFiles: new Map(),
  activeFile: null,
  
  // Estado de la compilación
  isCompiling: false,
  compilationOutput: [],
  problems: [],
  
  // Estado de la UI
  activePanel: 'output',
  sidebarWidth: 250,
  bottomPanelHeight: 200,
  
  // Configuración
  settings: {
    theme: 'dark',
    fontSize: 14,
    tabSize: 4,
    wordWrap: true,
    autoSave: true,
    compiler: 'gcc'
  }
})

// Acciones para manejar archivos
export const fileActions = {
  openFile(filePath, content, isNew = false) {
    store.openFiles.set(filePath, {
      content: content,
      modified: isNew,
      isNew: isNew,
      language: this.getLanguageFromFile(filePath)
    })
    
    this.setActiveFile(filePath)
  },
  
  closeFile(filePath) {
    const fileData = store.openFiles.get(filePath)
    
    if (fileData && fileData.modified) {
      // Aquí podrías mostrar un diálogo de confirmación
      const shouldSave = confirm(`¿Guardar cambios en ${this.getFileName(filePath)}?`)
      if (shouldSave) {
        this.saveFile(filePath)
      }
    }
    
    store.openFiles.delete(filePath)
    
    // Si era el archivo activo, cambiar a otro
    if (store.activeFile === filePath) {
      const remainingFiles = Array.from(store.openFiles.keys())
      if (remainingFiles.length > 0) {
        this.setActiveFile(remainingFiles[0])
      } else {
        store.activeFile = null
      }
    }
  },
  
  setActiveFile(filePath) {
    store.activeFile = filePath
  },
  
  markFileAsModified(filePath) {
    const fileData = store.openFiles.get(filePath)
    if (fileData && !fileData.modified) {
      fileData.modified = true
    }
  },
  
  async saveFile(filePath) {
    const fileData = store.openFiles.get(filePath)
    if (!fileData) return
    
    try {
      const result = await window.electronAPI.writeFile(filePath, fileData.content)
      if (result.success) {
        fileData.modified = false
        fileData.isNew = false
        outputActions.addLine(`Archivo guardado: ${filePath}`, 'success')
      } else {
        outputActions.addLine(`Error al guardar: ${result.error}`, 'error')
      }
    } catch (error) {
      outputActions.addLine(`Error al guardar: ${error.message}`, 'error')
    }
  },
  
  getLanguageFromFile(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'c': return 'c'
      case 'h': return 'c'
      case 'cpp': case 'cc': case 'cxx': return 'cpp'
      case 'hpp': case 'hh': case 'hxx': return 'cpp'
      case 'js': return 'javascript'
      case 'json': return 'json'
      case 'html': return 'html'
      case 'css': return 'css'
      case 'md': return 'markdown'
      default: return 'plaintext'
    }
  },
  
  getFileName(filePath) {
    return filePath.split(/[/\\]/).pop() || filePath
  }
}

// Acciones para el proyecto
export const projectActions = {
  async loadProject(projectPath) {
    store.currentProject = projectPath
    await this.refreshFileTree()
    outputActions.addLine(`Proyecto cargado: ${projectPath}`, 'success')
  },
  
  async refreshFileTree() {
    if (!store.currentProject) return
    
    try {
      const result = await window.electronAPI.listDirectory(store.currentProject)
      if (result.success) {
        store.projectFiles = result.items
      }
    } catch (error) {
      outputActions.addLine(`Error al cargar archivos: ${error.message}`, 'error')
    }
  },
  
  async createProject(projectPath, projectName) {
    const fullPath = `${projectPath}/${projectName}`
    
    try {
      // Crear directorio del proyecto
      await window.electronAPI.createDirectory(fullPath)
      
      // Crear archivo main.c básico
      const mainContent = `#include <stdio.h>

int main() {
    printf("¡Hola desde ${projectName}!\\n");
    return 0;
}`
      
      await window.electronAPI.writeFile(`${fullPath}/main.c`, mainContent)
      
      // Crear Makefile
      const makefileContent = `CC=gcc
CFLAGS=-Wall -Wextra -std=c99
TARGET=${projectName}
SOURCES=main.c

all: $(TARGET)

$(TARGET): $(SOURCES)
\t$(CC) $(CFLAGS) -o $(TARGET) $(SOURCES)

clean:
\trm -f $(TARGET) $(TARGET).exe

.PHONY: all clean`
      
      await window.electronAPI.writeFile(`${fullPath}/Makefile`, makefileContent)
      
      // Crear README
      const readmeContent = `# ${projectName}

Un juego retro desarrollado en C.

## Compilación

\`\`\`bash
make
\`\`\`

## Ejecución

\`\`\`bash
./${projectName}
\`\`\`
`
      
      await window.electronAPI.writeFile(`${fullPath}/README.md`, readmeContent)
      
      // Cargar el proyecto
      await this.loadProject(fullPath)
      
      // Abrir main.c
      fileActions.openFile(`${fullPath}/main.c`, mainContent)
      
      outputActions.addLine(`Proyecto creado: ${fullPath}`, 'success')
      
    } catch (error) {
      outputActions.addLine(`Error al crear proyecto: ${error.message}`, 'error')
    }
  }
}

// Acciones para la compilación
export const compilerActions = {
  async compile() {
    if (!store.activeFile) {
      outputActions.addLine('No hay archivo activo para compilar', 'error')
      return false
    }
    
    store.isCompiling = true
    outputActions.addLine('Iniciando compilación...', 'info')
    
    try {
      const projectPath = store.currentProject || store.activeFile.split(/[/\\]/).slice(0, -1).join('/')
      const mainFile = fileActions.getFileName(store.activeFile)
      
      const result = await window.electronAPI.compileProject(projectPath, mainFile)
      
      if (result.success) {
        outputActions.addLine('Compilación exitosa!', 'success')
        if (result.output) {
          outputActions.addLine(result.output, 'info')
        }
        store.problems = []
        return true
      } else {
        outputActions.addLine('Error de compilación:', 'error')
        outputActions.addLine(result.error, 'error')
        this.parseErrors(result.error)
        return false
      }
    } catch (error) {
      outputActions.addLine(`Error: ${error.message}`, 'error')
      return false
    } finally {
      store.isCompiling = false
    }
  },
  
  async compileAndRun() {
    const compiled = await this.compile()
    if (!compiled) return
    
    try {
      const projectPath = store.currentProject || store.activeFile.split(/[/\\]/).slice(0, -1).join('/')
      const mainFile = fileActions.getFileName(store.activeFile)
      const executablePath = `${projectPath}/${mainFile.replace('.c', '.exe')}`
      
      const result = await window.electronAPI.runExecutable(executablePath)
      if (result.success) {
        outputActions.addLine(`Ejecutando programa (PID: ${result.pid})...`, 'success')
      }
    } catch (error) {
      outputActions.addLine(`Error al ejecutar: ${error.message}`, 'error')
    }
  },
  
  parseErrors(errorText) {
    const problems = []
    const lines = errorText.split('\n')
    
    lines.forEach(line => {
      if (line.includes('error:') || line.includes('warning:')) {
        const isError = line.includes('error:')
        problems.push({
          type: isError ? 'error' : 'warning',
          message: line,
          file: store.activeFile,
          line: 0, // Podrías parsear el número de línea del mensaje
          column: 0
        })
      }
    })
    
    store.problems = problems
    
    if (problems.length > 0) {
      uiActions.setActivePanel('problems')
    }
  }
}

// Acciones para la salida/output
export const outputActions = {
  addLine(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    store.compilationOutput.push({
      timestamp,
      message,
      type
    })
    
    // Mantener solo las últimas 1000 líneas
    if (store.compilationOutput.length > 1000) {
      store.compilationOutput.splice(0, store.compilationOutput.length - 1000)
    }
    
    // Cambiar al panel de salida automáticamente
    uiActions.setActivePanel('output')
  },
  
  clear() {
    store.compilationOutput = []
  }
}

// Acciones para la UI
export const uiActions = {
  setActivePanel(panel) {
    store.activePanel = panel
  },
  
  setSidebarWidth(width) {
    store.sidebarWidth = Math.max(200, Math.min(600, width))
  },
  
  setBottomPanelHeight(height) {
    store.bottomPanelHeight = Math.max(150, Math.min(400, height))
  },
  
  updateSettings(newSettings) {
    Object.assign(store.settings, newSettings)
    // Aquí podrías guardar en localStorage o archivo
  }
}

// Plantillas de juegos
export const templates = {
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
    code: `// Código del juego de plataformas aquí...
// (Mantendría el mismo código que ya creamos)`
  },
  
  'shooter-game': {
    name: 'shooter_game',
    code: `// Código del juego de disparos aquí...
// (Mantendría el mismo código que ya creamos)`
  }
}

export const templateActions = {
  loadTemplate(templateName) {
    const template = templates[templateName]
    if (template) {
      fileActions.openFile(`${template.name}.c`, template.code, true)
      outputActions.addLine(`Plantilla cargada: ${template.name}`, 'success')
    }
  }
}

// Computed properties
export const computed = {
  openFilesList: computed(() => Array.from(store.openFiles.keys())),
  activeFileData: computed(() => store.activeFile ? store.openFiles.get(store.activeFile) : null),
  hasOpenFiles: computed(() => store.openFiles.size > 0),
  hasProject: computed(() => !!store.currentProject),
  hasProblems: computed(() => store.problems.length > 0),
  problemCount: computed(() => store.problems.length),
  outputLines: computed(() => store.compilationOutput)
}

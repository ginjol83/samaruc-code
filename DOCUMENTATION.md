# 🎮 Retro Game IDE - Documentación Completa

## ¿Qué hemos creado?

Hemos desarrollado un IDE completo para el desarrollo de juegos retro en C usando Electron.js. Esta es una aplicación de escritorio moderna con todas las herramientas necesarias para crear juegos clásicos.

## 📁 Estructura del Proyecto

```
retro-game-ide/
├── src/                          # Código fuente principal
│   ├── main.js                   # Proceso principal de Electron
│   ├── renderer.js               # Lógica de la interfaz de usuario
│   ├── index.html                # Interfaz HTML principal
│   ├── styles.css                # Estilos CSS
│   └── assets/
│       └── monaco-config.js      # Configuración del editor
├── examples/                     # Ejemplos de juegos completos
│   ├── snake.c                   # Juego de Snake completo
│   └── tetris.c                  # Juego de Tetris completo
├── package.json                  # Configuración del proyecto
├── setup.bat                     # Script de configuración
├── start.bat                     # Script de inicio
├── README.md                     # Documentación principal
├── QUICKSTART.md                 # Guía de inicio rápido
└── LICENSE                       # Licencia MIT
```

## 🌟 Características Principales

### 1. **Editor de Código Avanzado**
- Basado en Monaco Editor (el mismo que usa VS Code)
- Resaltado de sintaxis específico para C
- Autocompletado inteligente
- Numeración de líneas
- Minimapa
- Tema oscuro optimizado para programación

### 2. **Compilador Integrado**
- Integración con GCC
- Compilación con un solo clic (F5)
- Detección automática de errores
- Panel de problemas integrado
- Soporte para bibliotecas estándar

### 3. **Plantillas de Juegos**
- **Juego Básico**: Estructura fundamental con controles y puntuación
- **Juego de Plataformas**: Física básica, gravedad, saltos
- **Juego de Disparos**: Sistema de balas, enemigos, colisiones

### 4. **Gestión de Proyectos**
- Explorador de archivos integrado
- Creación automática de estructura de proyecto
- Soporte para múltiples archivos
- Sistema de pestañas para navegación

### 5. **Interfaz Profesional**
- Diseño moderno estilo VS Code
- Paneles redimensionables
- Terminal integrada
- Sistema de salida con colores
- Atajos de teclado profesionales

## 🚀 Cómo Usar el IDE

### Instalación y Configuración

1. **Ejecutar configuración inicial:**
   ```bash
   setup.bat
   ```

2. **Iniciar el IDE:**
   ```bash
   start.bat
   ```

### Crear tu Primer Juego

1. **Abrir el IDE** y hacer clic en "Nuevo Proyecto"
2. **Seleccionar una plantilla** o empezar desde cero
3. **Escribir el código** en el editor
4. **Compilar** presionando F5
5. **Ejecutar** presionando F6

### Atajos de Teclado

| Atajo | Función |
|-------|---------|
| `Ctrl+N` | Nuevo proyecto |
| `Ctrl+O` | Abrir proyecto |
| `Ctrl+S` | Guardar archivo |
| `F5` | Compilar proyecto |
| `F6` | Compilar y ejecutar |
| `Ctrl+Q` | Salir del IDE |

## 🎯 Ejemplos Incluidos

### 1. Snake Game (`examples/snake.c`)
- Juego completo de la serpiente
- Controles con W/A/S/D
- Sistema de puntuación
- Detección de colisiones
- Interfaz gráfica ASCII

### 2. Tetris (`examples/tetris.c`)
- Juego completo de Tetris
- 7 tipos de piezas diferentes
- Sistema de rotación
- Eliminación de líneas
- Niveles de dificultad

## 🛠️ Tecnologías Utilizadas

- **Electron.js**: Framework para aplicaciones de escritorio
- **Monaco Editor**: Editor de código avanzado
- **Node.js**: Runtime para JavaScript
- **HTML/CSS/JavaScript**: Interfaz de usuario
- **GCC**: Compilador de C

## 📋 Requisitos del Sistema

- **Windows 10 o superior**
- **Node.js 16+**
- **GCC (MinGW recomendado)**
- **2GB RAM mínimo**
- **500MB espacio en disco**

## 🔧 Configuración de GCC

Para compilar juegos en C necesitas GCC instalado:

1. **Descargar MinGW-w64** desde https://www.mingw-w64.org/
2. **Instalar** siguiendo las instrucciones
3. **Agregar al PATH** la carpeta `bin` de MinGW
4. **Verificar** ejecutando `gcc --version` en terminal

## 📚 Tutoriales y Recursos

### Conceptos Básicos de Juegos en C

```c
// Estructura básica de un juego
#include <stdio.h>
#include <conio.h>  // Para _kbhit() y _getch()
#include <windows.h> // Para Sleep() y gotoxy()

typedef struct {
    int x, y;
    int score;
    int game_over;
} Game;

void init_game(Game* game);
void update_game(Game* game);
void draw_game(Game* game);
void handle_input(Game* game);

int main() {
    Game game;
    init_game(&game);
    
    while (!game.game_over) {
        draw_game(&game);
        handle_input(&game);
        update_game(&game);
        Sleep(50); // Pausa de 50ms
    }
    
    return 0;
}
```

### Funciones Útiles para Juegos

```c
// Posicionar cursor en consola
void gotoxy(int x, int y) {
    COORD coord;
    coord.X = x;
    coord.Y = y;
    SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
}

// Ocultar cursor
void hide_cursor() {
    CONSOLE_CURSOR_INFO cursor_info;
    GetConsoleCursorInfo(GetStdHandle(STD_OUTPUT_HANDLE), &cursor_info);
    cursor_info.bVisible = FALSE;
    SetConsoleCursorInfo(GetStdHandle(STD_OUTPUT_HANDLE), &cursor_info);
}

// Leer tecla sin bloquear
char get_key() {
    if (_kbhit()) {
        return _getch();
    }
    return 0;
}
```

## 🎨 Sprites ASCII para Juegos

```c
// Caracteres comunes para juegos retro
char player = '@';      // Jugador
char enemy = 'X';       // Enemigo  
char bullet = '|';      // Bala vertical
char bullet_h = '-';    // Bala horizontal
char wall = '#';        // Pared
char floor = '=';       // Suelo
char coin = 'o';        // Moneda
char heart = '♥';       // Vida
char diamond = '♦';     // Diamante
char club = '♣';        // Trébol
char spade = '♠';       // Pica
```

## 🐛 Solución de Problemas

### Error: "gcc no reconocido"
- Instalar MinGW-w64
- Agregar al PATH del sistema
- Reiniciar el terminal

### El editor no carga
- Verificar conexión a internet (Monaco se carga desde CDN)
- Probar con el editor básico incluido

### No se puede compilar
- Verificar que el archivo tenga extensión `.c`
- Guardar el archivo antes de compilar
- Revisar errores de sintaxis

## 🤝 Contribuir al Proyecto

1. Fork el repositorio
2. Crear una rama para tu función
3. Hacer commit de los cambios
4. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🎉 ¡Disfruta Programando!

Con este IDE tienes todo lo necesario para crear juegos retro increíbles. Desde simples juegos de texto hasta complejas aventuras ASCII, las posibilidades son infinitas.

¡Que comience la diversión! 🎮✨

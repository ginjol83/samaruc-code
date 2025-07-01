# 🐟 Samaruc Code

Un IDE moderno para el desarrollo de juegos retro en C, construido con Electron.js.

*Samaruc Code* lleva el nombre del samaruc (Valencia hispanica), un pequeño pez endémico de la Albufera de Valencia, símbolo de la programación elegante y eficiente.

## Características

- **Editor de código avanzado**: Basado en Monaco Editor con resaltado de sintaxis para C
- **Compilador integrado**: Soporte para GCC con detección automática de errores
- **Plantillas de juegos**: Plantillas predefinidas para diferentes tipos de juegos retro
- **Explorador de archivos**: Navegación fácil por la estructura del proyecto
- **Terminal integrada**: Acceso directo a la línea de comandos
- **Interfaz moderna**: Diseño oscuro optimizado para programación

## Plantillas Incluidas

### 1. Juego Básico
Estructura fundamental para cualquier juego simple con:
- Bucle principal de juego
- Entrada de usuario
- Sistema de puntuación
- Controles básicos de movimiento

### 2. Juego de Plataformas
Plantilla para juegos estilo Mario con:
- Sistema de física básico
- Gravedad y saltos
- Plataformas
- Desplazamiento horizontal

### 3. Juego de Disparos
Plantilla estilo Space Invaders con:
- Sistema de balas
- Enemigos que se mueven
- Detección de colisiones
- Sistema de vidas

## Requisitos del Sistema

- Windows 10 o superior
- GCC (MinGW recomendado para Windows)
- Node.js 16 o superior

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tuusuario/retro-game-ide.git
cd retro-game-ide
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el IDE:
```bash
npm start

# O en modo desarrollo (con DevTools)
npm run dev

# O usando los scripts batch
start-debug.bat
```

## 🧪 Probar Funcionalidad de Abrir Archivos

### Opción 1: En Electron (Recomendado)
```bash
# Ejecutar start-debug.bat o:
npm start -- --dev
```
1. Abre la consola de desarrollador (F12)
2. Haz clic en "Abrir Archivo" en la barra de herramientas
3. Selecciona `test-file.c` 
4. Observa los logs en la consola

### Opción 2: En Navegador (Para debugging)
1. Abre `test-browser.html` en tu navegador
2. Haz clic en "Probar Abrir Archivo (HTML5)"
3. Selecciona cualquier archivo de texto
4. Observa el resultado en el panel de output

### Funciones de Debug Disponibles
En la consola del navegador/Electron:
```javascript
// Información del sistema
debugOpenFiles()

// Prueba directa de apertura
testOpenFile()
```

### Archivos de Test Incluidos
- `test-file.c` - Archivo C simple para probar
- `test-browser.html` - Interfaz de prueba standalone
- `start-debug.bat` - Inicio con menos warnings

2. Instala las dependencias:
```bash
npm install
```

3. Inicia la aplicación:
```bash
npm start
```

## Compilación

Para compilar la aplicación para distribución:

```bash
npm run build
```

## Configuración de GCC

Para Windows, asegúrate de tener MinGW instalado y agregado al PATH:

1. Descarga MinGW-w64 desde: https://www.mingw-w64.org/
2. Instala y agrega el directorio `bin` al PATH del sistema
3. Verifica la instalación ejecutando `gcc --version` en la terminal

## Uso

### Crear un Nuevo Proyecto

1. Abre el IDE
2. Haz clic en "Nuevo Proyecto"
3. Selecciona una ubicación para tu proyecto
4. Comienza a codificar

### Usar Plantillas

1. Selecciona una plantilla del menú desplegable
2. Haz clic en "Cargar plantilla"
3. La plantilla se abrirá en el editor

### Compilar y Ejecutar

- **F5**: Compilar el proyecto actual
- **F6**: Compilar y ejecutar
- **Ctrl+S**: Guardar archivo actual

### Atajos de Teclado

- `Ctrl+N`: Nuevo proyecto
- `Ctrl+O`: Abrir proyecto
- `Ctrl+S`: Guardar archivo
- `F5`: Compilar
- `F6`: Compilar y ejecutar
- `Ctrl+Q`: Salir

## Estructura del Proyecto

```
retro-game-ide/
├── src/
│   ├── main.js          # Proceso principal de Electron
│   ├── renderer.js      # Lógica de la interfaz
│   ├── index.html       # Interfaz principal
│   └── styles.css       # Estilos CSS
├── templates/           # Plantillas de juegos
├── package.json
└── README.md
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu función (`git checkout -b feature/nueva-funcion`)
3. Commit tus cambios (`git commit -am 'Agrega nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para reportar bugs o solicitar nuevas características, por favor abre un issue en el repositorio de GitHub.

## Recursos Adicionales

- [Documentación de C](https://devdocs.io/c/)
- [Tutorial de juegos en C](https://www.tutorialspoint.com/c_standard_library/index.htm)
- [Documentación de Electron](https://www.electronjs.org/docs)

## Changelog

### v1.0.0
- Lanzamiento inicial
- Editor de código con resaltado de sintaxis
- Compilador integrado
- Plantillas de juegos básicas
- Explorador de archivos
- Terminal integrada

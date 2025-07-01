# Retro Game IDE - Guía de Inicio Rápido

## 🎮 ¡Bienvenido al Retro Game IDE!

Este IDE te permite crear juegos retro en C de manera fácil y rápida.

## 🚀 Primeros Pasos

### 1. Configuración Inicial

Ejecuta el archivo `setup.bat` para verificar que tienes todo lo necesario:

```bash
setup.bat
```

### 2. Iniciar el IDE

```bash
npm start
```

## 🎯 Creando tu Primer Juego

### Opción 1: Usar una Plantilla

1. **Abre el IDE**
2. **Selecciona una plantilla** del menú desplegable:
   - 🎲 **Juego Básico**: Para aprender los fundamentos
   - 🏃 **Juego de Plataformas**: Estilo Mario Bros
   - 🚀 **Juego de Disparos**: Estilo Space Invaders

3. **Haz clic en "Cargar plantilla"**
4. **Presiona F6** para compilar y ejecutar

### Opción 2: Crear desde Cero

1. **Haz clic en "Nuevo Proyecto"**
2. **Elige un nombre** para tu juego
3. **Selecciona una carpeta** donde guardarlo
4. **Comienza a programar**

## ⌨️ Atajos de Teclado Útiles

| Atajo | Función |
|-------|---------|
| `Ctrl+N` | Nuevo proyecto |
| `Ctrl+O` | Abrir proyecto |
| `Ctrl+S` | Guardar archivo |
| `F5` | Compilar |
| `F6` | Compilar y ejecutar |
| `Ctrl+Q` | Salir |

## 🔧 Solución de Problemas

### Error: "gcc no reconocido"

Necesitas instalar MinGW-w64:

1. Ve a https://www.mingw-w64.org/
2. Descarga e instala
3. Agrega la carpeta `bin` al PATH de Windows
4. Reinicia el IDE

### El juego no se ejecuta

1. Asegúrate de que el código compile sin errores (F5)
2. Verifica que el archivo tenga extensión `.c`
3. Guarda el archivo antes de compilar (Ctrl+S)

## 🎨 Consejos para Juegos Retro

### Caracteres ASCII para Gráficos

```c
// Ejemplos de sprites ASCII
char player = '@';      // Jugador
char enemy = 'X';       // Enemigo
char bullet = '|';      // Bala
char wall = '#';        // Pared
char coin = 'o';        // Moneda
```

### Colores en Consola (Windows)

```c
#include <windows.h>

void setColor(int color) {
    SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), color);
}

// Colores disponibles:
// 1=Azul, 2=Verde, 4=Rojo, 6=Amarillo, 7=Blanco, etc.
```

### Controles Básicos

```c
#include <conio.h>

char input = _getch();  // Leer tecla sin Enter
switch(input) {
    case 'w': // Arriba
    case 's': // Abajo  
    case 'a': // Izquierda
    case 'd': // Derecha
}
```

## 📚 Recursos de Aprendizaje

- **Programación en C**: https://www.learn-c.org/
- **Lógica de Juegos**: https://gamedev.net/tutorials/
- **ASCII Art**: https://www.asciiart.eu/

## 🤝 Comunidad

- ¿Tienes preguntas? Abre un issue en GitHub
- ¿Quieres compartir tu juego? ¡Etiquétanos!
- ¿Encontraste un bug? Repórtalo

## 🎉 ¡Ejemplos de Juegos que Puedes Crear!

- **Snake**: El clásico juego de la serpiente
- **Tetris**: Bloques que caen
- **Pac-Man**: Laberinto con puntos
- **Pong**: Tenis de mesa
- **Asteroids**: Nave espacial
- **Breakout**: Rompe ladrillos

¡Que disfrutes programando! 🚀🎮

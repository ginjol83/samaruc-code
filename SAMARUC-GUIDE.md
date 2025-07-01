# 🐟 Samaruc Code - Guía de Usuario

## ¿Qué es Samaruc Code?

**Samaruc Code** es un IDE moderno para el desarrollo de juegos retro en C, inspirado en el samaruc (*Valencia hispanica*), un pequeño pez endémico de la Albufera de Valencia. Como este pez único en su especie, Samaruc Code ofrece una experiencia de desarrollo única y elegante.

## 🌊 Filosofía de Samaruc

El samaruc es conocido por:
- **Adaptabilidad**: Vive en aguas dulces y saladas
- **Eficiencia**: Pequeño pero resistente
- **Elegancia**: Movimientos fluidos y precisos
- **Singularidad**: Especie única en el mundo

Samaruc Code adopta estas cualidades para ofrecer:
- **Versatilidad**: Soporta múltiples tipos de proyectos retro
- **Rendimiento**: Ligero pero potente
- **Usabilidad**: Interface intuitiva y fluida
- **Innovación**: Características únicas para desarrollo retro

## 🎣 Características Principales

### 🐠 Editor Avanzado
- **Monaco Editor**: El mismo editor de VS Code
- **Resaltado de sintaxis** para C, C++, JavaScript, HTML, CSS
- **Autocompletado** y sugerencias inteligentes
- **Tema Samaruc**: Colores inspirados en los peces del mediterráneo

### 🌊 Gestión de Archivos
- **Abrir archivos**: Drag & drop, diálogo nativo, atajos de teclado
- **Archivos recientes**: Acceso rápido a proyectos anteriores
- **Validación inteligente**: Detección de archivos binarios y grandes
- **Codificación**: Soporte UTF-8 automático

### 🏊‍♂️ Navegación Fluida
- **Ctrl+O**: Abrir archivo
- **Ctrl+N**: Nuevo archivo
- **Ctrl+S**: Guardar
- **Ctrl+Shift+O**: Archivos recientes
- **F12**: Herramientas de desarrollo

### 🐟 Easter Eggs
- Mensajes motivacionales del samaruc cada 5 archivos abiertos
- Animaciones sutiles del icono principal
- Temas de color inspired en la vida acuática

## 🎮 Plantillas de Juegos Retro

### Tetris Clásico
```c
// Implementación completa de Tetris
// Con rotación de piezas, líneas completas, puntuación
```

### Snake Game
```c
// Juego de la serpiente clásico
// Con crecimiento, colisiones, puntuación
```

### Pong
```c
// El clásico juego de ping-pong
// Con IA básica y física realista
```

## 🔧 Instalación y Uso

### Requisitos
- Node.js 16 o superior
- Git (opcional)
- Compilador GCC (para compilar juegos)

### Inicio Rápido
```bash
# Clonar el repositorio
git clone [repository-url] samaruc-code
cd samaruc-code

# Instalar dependencias
npm install

# Iniciar Samaruc Code
npm start

# O usar el script especial
./start-samaruc.bat  # Windows
```

### Primera Vez
1. **Abrir proyecto**: Presiona `Ctrl+O` o arrastra una carpeta
2. **Nuevo archivo**: `Ctrl+N` para crear un archivo vacío
3. **Plantillas**: Explora las plantillas incluidas
4. **Compilar**: Usa el terminal integrado con `gcc`

## 🐠 Solución de Problemas

### El editor no carga
- Verifica conexión a internet (Monaco se carga desde CDN)
- Revisa la consola del desarrollador (F12)
- Reinicia la aplicación

### No puedo abrir archivos
- Verifica permisos de archivo
- Comprueba que el archivo existe
- Revisa los logs en la consola

### Rendimiento lento
- Evita abrir archivos muy grandes (>2MB)
- Cierra pestañas no utilizadas
- Reinicia la aplicación si es necesario

## 🌊 Contribuir al Proyecto

Samaruc Code es un proyecto de código abierto. Como el samaruc nada mejor en grupo, ¡tu contribución es bienvenida!

### Formas de Contribuir
- **Reportar bugs**: Usa el sistema de issues
- **Nuevas características**: Propón mejoras
- **Documentación**: Mejora esta guía
- **Plantillas**: Añade nuevos juegos retro
- **Traducciones**: Ayuda a traducir la interfaz

### Desarrollo Local
```bash
# Modo desarrollo
npm run dev

# Compilar distribución
npm run build

# Ejecutar tests
npm test
```

## 🐟 Roadmap

### v1.1 - "Cardumen"
- [ ] Soporte para múltiples ventanas
- [ ] Sistema de plugins
- [ ] Compilador integrado mejorado
- [ ] Más plantillas de juegos

### v1.2 - "Banco de Peces"
- [ ] Colaboración en tiempo real
- [ ] Control de versiones Git integrado
- [ ] Debugger visual
- [ ] Generador de sprites

### v2.0 - "Océano"
- [ ] Soporte para otros lenguajes (Assembly, BASIC)
- [ ] Emuladores integrados
- [ ] Marketplace de plantillas
- [ ] IA para sugerencias de código

## 🏆 Créditos

**Samaruc Code** está dedicado a:
- Los desarrolladores de juegos retro de todo el mundo
- La comunidad de Valencia y la preservación del samaruc
- Los pioneros del desarrollo de videojuegos
- Todos los que creen que programar puede ser tan elegante como un pez nadando

---

*"Como el samaruc en las aguas de la Albufera, que cada línea de código fluya con gracia y propósito."*

**🐟 ¡Feliz programación con Samaruc Code! 🐟**

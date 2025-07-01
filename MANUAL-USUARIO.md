# 🐟 Samaruc Code - Manual de Usuario

## Crear Nuevo Proyecto

Samaruc Code permite crear proyectos configurados específicamente para desarrollo retro en diferentes plataformas.

### Pasos para Crear un Proyecto:

1. **Abrir Samaruc Code**
   ```bash
   npm start
   # o usar el script personalizado
   ./start-samaruc.bat
   ```

2. **Crear Nuevo Proyecto**
   - Haz clic en "**Nuevo Proyecto**" en la pantalla de bienvenida
   - O usa el menú: `Archivo → Nuevo Proyecto`
   - O presiona `Ctrl+Shift+N`

3. **Configurar el Proyecto**
   - Introduce el **nombre del proyecto**
   - Selecciona si quieres **configuración personalizada** o usar valores por defecto
   - Configuración por defecto:
     - Plataforma: `spectrum`
     - Compilador: `sdcc`
     - Target: `z80`

4. **Configuración Personalizada** (opcional)
   - **Plataformas soportadas**: `spectrum`, `amstrad`, `msx`, `commodore64`, `atari`
   - **Compiladores**: `sdcc`, `gcc`, `z88dk`, `cc65`
   - **Targets**: `z80`, `x86`, `6502`

5. **Seleccionar Ubicación**
   - Elige dónde crear la carpeta del proyecto
   - Samaruc Code creará automáticamente la estructura

### Estructura de Proyecto Creada:

```
mi-proyecto-retro/
├── build.json          # Configuración de compilación
├── main.c             # Archivo principal del proyecto
└── README.md          # Documentación del proyecto
```

### Archivo build.json

El archivo `build.json` contiene la configuración de compilación:

```json
{
  "platform": "spectrum",
  "compiler": "sdcc",
  "target": "z80"
}
```

### Configuraciones de Plataforma

#### ZX Spectrum
```json
{
  "platform": "spectrum",
  "compiler": "sdcc",
  "target": "z80"
}
```
- **Compilación**: `sdcc -mz80 --no-std-crt0 --opt-code-size main.c`
- **Memoria**: Código desde 0x5CCB, pantalla en 0x4000
- **Características**: 48K/128K, gráficos bitmap, 15 colores

#### Commodore 64
```json
{
  "platform": "commodore64",
  "compiler": "cc65",
  "target": "6502"
}
```
- **Compilación**: `cl65 -t c64 -O main.c -o programa.prg`
- **Memoria**: Código desde 0x0801, pantalla en 0x0400
- **Características**: 64K, sprites, SID sound, 16 colores

#### Amstrad CPC
```json
{
  "platform": "amstrad",
  "compiler": "sdcc", 
  "target": "z80"
}
```
- **Compilación**: `sdcc -mz80 main.c`
- **Memoria**: Código desde 0x4000, pantalla en 0xC000
- **Características**: 64K/128K, modos gráficos múltiples

## Ejemplos de Código Generado

### ZX Spectrum (main.c)
```c
#include <stdio.h>

#define SCREEN_ADDR   0x4000
#define ATTR_ADDR     0x5800

void plot_pixel(int x, int y) {
    // Plotear pixel en pantalla Spectrum
}

int main() {
    printf("Hola desde ZX Spectrum!\n");
    printf("Creado con Samaruc Code\n");
    return 0;
}
```

### Commodore 64 (main.c)
```c
#include <stdio.h>
#include <conio.h>
#include <c64.h>

int main() {
    clrscr();
    textcolor(COLOR_WHITE);
    cprintf("Hola desde Commodore 64!");
    cgetc();
    return 0;
}
```

## Compilación

### Herramientas Necesarias

#### Para ZX Spectrum:
- **SDCC**: `sudo apt install sdcc` (Linux) o descargar desde sdcc.sourceforge.net
- **Z88DK** (opcional): Para funciones avanzadas de Spectrum

#### Para Commodore 64:
- **CC65**: Descargar desde cc65.github.io
- **VICE**: Emulador para probar programas

#### Para Amstrad CPC:
- **SDCC**: Mismo que Spectrum
- **CPCRSLIB**: Librería específica para CPC

### Comandos de Compilación

```bash
# ZX Spectrum
sdcc -mz80 --no-std-crt0 --opt-code-size main.c

# Commodore 64  
cl65 -t c64 -O main.c -o programa.prg

# Amstrad CPC
sdcc -mz80 main.c
```

## Flujo de Trabajo Recomendado

1. **Crear proyecto** con Samaruc Code
2. **Escribir código** en el editor integrado
3. **Compilar** usando terminal integrado o externo
4. **Probar** en emulador (VICE, Fuse, WinAPE, etc.)
5. **Depurar** y repetir

## Plantillas Incluidas

Samaruc Code incluye plantillas de código para:
- 🎮 **ZX Spectrum**: Gráficos, sonido, entrada
- 🎯 **Commodore 64**: Sprites, música SID, colores
- 🎪 **Amstrad CPC**: Modos gráficos, firmware
- 🕹️ **MSX**: PSG sound, sprites, tilesets
- 🎲 **Atari**: Players/missiles, GTIA graphics

## Tips de Samaruc 🐟

- **Memoria limitada**: Optimiza siempre el código
- **Timing crítico**: Usa rutinas en ensamblador para partes críticas
- **Gráficos**: Aprovecha las características únicas de cada máquina
- **Sonido**: Cada plataforma tiene su propia personalidad sonora
- **Testing**: Prueba en hardware real siempre que sea posible

## Recursos Adicionales

### Documentación
- **ZX Spectrum**: worldofspectrum.org
- **Commodore 64**: c64-wiki.com
- **Amstrad CPC**: cpcwiki.eu

### Emuladores
- **Fuse**: Spectrum emulator (Linux/Windows/Mac)
- **VICE**: C64/VIC20/PET emulator
- **WinAPE**: Amstrad CPC emulator
- **openMSX**: MSX emulator

### Herramientas
- **SpritePad**: Editor de sprites para C64
- **SevenuP**: Graphics editor para Spectrum
- **ConvImgCpc**: Convertidor de imágenes para CPC

---

*"Como el samaruc navega por las aguas cristalinas de la Albufera, que tu código navegue elegantemente por los bytes de la memoria retro."* 🌊

**¡Feliz programación retro con Samaruc Code!** 🐟🎮

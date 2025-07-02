# Instrucciones para Iconos - SamaruC Code

## Archivos Generados

### ✅ Archivos SVG (Listos para usar)
- `icon.svg` - Icono principal de la aplicación
- `favicon.svg` - Favicon para navegador

### ⚠️ Archivos que necesitan conversión

#### PNG Files (para mejor compatibilidad)
- `icon-16.png` - 16x16 píxeles
- `icon-32.png` - 32x32 píxeles
- `icon-48.png` - 48x48 píxeles
- `icon-64.png` - 64x64 píxeles
- `icon-128.png` - 128x128 píxeles
- `icon-256.png` - 256x256 píxeles
- `icon-512.png` - 512x512 píxeles

#### ICO File (para Windows)
- `icon.ico` - Icono ejecutable de Windows

## Cómo generar los archivos PNG/ICO reales

### Opción 1: Herramientas Online (Más fácil)
1. Ve a https://convertio.co/svg-png/
2. Sube el archivo `icon.svg`
3. Descarga en los tamaños necesarios: 16, 32, 48, 64, 128, 256, 512
4. Para ICO: usa https://convertio.co/svg-ico/

### Opción 2: Inkscape (Línea de comandos)
```bash
# Instalar Inkscape primero
inkscape icon.svg --export-png=icon-16.png --export-width=16 --export-height=16
inkscape icon.svg --export-png=icon-32.png --export-width=32 --export-height=32
inkscape icon.svg --export-png=icon-48.png --export-width=48 --export-height=48
inkscape icon.svg --export-png=icon-64.png --export-width=64 --export-height=64
inkscape icon.svg --export-png=icon-128.png --export-width=128 --export-height=128
inkscape icon.svg --export-png=icon-256.png --export-width=256 --export-height=256
inkscape icon.svg --export-png=icon-512.png --export-width=512 --export-height=512
```

### Opción 3: Node.js con Sharp
```bash
npm install sharp
node -e "
const sharp = require('sharp');
const fs = require('fs');
const sizes = [16,32,48,64,128,256,512];
sizes.forEach(size => {
  sharp('icon.svg')
    .resize(size, size)
    .png()
    .toFile(`icon-${size}.png`)
    .then(() => console.log(`✅ icon-${size}.png creado`));
});
"
```

## Verificar que funciona

1. **Desarrollo**: `npm start` - Debe mostrar el icono en la barra de tareas
2. **Build**: `npm run build` - El ejecutable debe tener el icono
3. **Navegador**: El favicon debe aparecer en la pestaña

## Personalizar el icono

1. Edita `icon.svg` con cualquier editor SVG (Inkscape, Adobe Illustrator, etc.)
2. Vuelve a ejecutar `npm run generate-icons`
3. Convierte los nuevos SVG a PNG/ICO

// generate-icons.js - Generador automático de iconos para SamaruC Code
// Este script genera todos los tamaños de iconos necesarios para Electron

const fs = require('fs');
const path = require('path');

// Configuración de iconos
const ICON_SIZES = [16, 32, 48, 64, 128, 256, 512];
const SOURCE_ICON = path.join(__dirname, 'src', 'assets', 'icon.svg');
const OUTPUT_DIR = path.join(__dirname, 'src', 'assets');

console.log('🎨 Generador de Iconos - SamaruC Code');
console.log('=====================================');

// Función para crear un icono SVG básico si no existe
function createBasicIcon() {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <!-- Fondo circular -->
    <circle cx="256" cy="256" r="240" fill="#2E7D32" stroke="#1B5E20" stroke-width="8"/>
    
    <!-- Samaruc (pez) -->
    <g transform="translate(256,256)">
        <!-- Cuerpo del pez -->
        <ellipse cx="0" cy="0" rx="120" ry="60" fill="#4CAF50"/>
        
        <!-- Cola -->
        <path d="M-120,-30 L-180,-60 L-180,0 L-180,60 L-120,30 Z" fill="#388E3C"/>
        
        <!-- Aletas -->
        <ellipse cx="-40" cy="-45" rx="25" ry="15" fill="#388E3C"/>
        <ellipse cx="-40" cy="45" rx="25" ry="15" fill="#388E3C"/>
        
        <!-- Ojo -->
        <circle cx="60" cy="-20" r="20" fill="#FFFFFF"/>
        <circle cx="65" cy="-20" r="12" fill="#000000"/>
        <circle cx="68" cy="-23" r="4" fill="#FFFFFF"/>
        
        <!-- Boca -->
        <ellipse cx="115" cy="0" rx="8" ry="12" fill="#2E7D32"/>
    </g>
    
    <!-- Elementos de código -->
    <g fill="#FFFFFF" font-family="monospace" font-size="24" font-weight="bold">
        <!-- Símbolos de código -->
        <text x="120" y="120" opacity="0.8">&lt;/&gt;</text>
        <text x="360" y="140" opacity="0.8">{}</text>
        <text x="380" y="380" opacity="0.8">C</text>
        <text x="100" y="400" opacity="0.8">#</text>
    </g>
    
    <!-- Texto -->
    <text x="256" y="450" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="32" font-weight="bold">SamaruC</text>
</svg>`;

    return svgContent;
}

// Función para crear un favicon SVG simple
function createFavicon() {
    const faviconContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- Fondo -->
    <rect width="32" height="32" fill="#2E7D32" rx="4"/>
    
    <!-- Samaruc simplificado -->
    <g transform="translate(16,16)">
        <!-- Cuerpo del pez -->
        <ellipse cx="0" cy="0" rx="8" ry="4" fill="#4CAF50"/>
        
        <!-- Cola -->
        <path d="M-8,-2 L-12,-4 L-12,0 L-12,4 L-8,2 Z" fill="#388E3C"/>
        
        <!-- Ojo -->
        <circle cx="4" cy="-1" r="1.5" fill="#FFFFFF"/>
        <circle cx="4" cy="-1" r="1" fill="#000000"/>
    </g>
    
    <!-- Símbolo de código -->
    <text x="26" y="28" fill="#FFFFFF" font-family="monospace" font-size="8" font-weight="bold">C</text>
</svg>`;

    return faviconContent;
}

// Función para generar archivo ICO usando caracteres ASCII (para Windows)
function generateICOFile() {
    console.log('📝 Generando archivo .ico para Windows...');
    
    // Para un ICO real, normalmente usarías una librería como 'to-ico'
    // Pero para simplicidad, crearemos un archivo placeholder
    const icoContent = `# PLACEHOLDER ICO FILE
# Este archivo debería ser reemplazado por un verdadero archivo .ico
# Puedes usar herramientas online como:
# - https://convertio.co/svg-ico/
# - https://icoconvert.com/
# - https://cloudconvert.com/svg-to-ico

# Para generar un ICO real desde SVG:
# 1. Usa el archivo icon.svg generado
# 2. Conviértelo a ICO usando una herramienta online
# 3. Reemplaza este archivo con el ICO generado
`;

    const icoPath = path.join(OUTPUT_DIR, 'icon.ico');
    fs.writeFileSync(icoPath, icoContent, 'utf8');
    console.log(`  ✅ Placeholder ICO creado: ${icoPath}`);
    console.log(`  ⚠️  IMPORTANTE: Reemplaza este archivo con un ICO real para Windows`);
}

// Función principal
function generateIcons() {
    // Verificar que existe el directorio de assets
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Directorio creado: ${OUTPUT_DIR}`);
    }

    // 1. Generar icon.svg principal
    console.log('🎨 Generando icono principal (icon.svg)...');
    const mainIconPath = path.join(OUTPUT_DIR, 'icon.svg');
    const mainIconContent = createBasicIcon();
    fs.writeFileSync(mainIconPath, mainIconContent, 'utf8');
    console.log(`  ✅ Icono principal creado: ${mainIconPath}`);

    // 2. Generar favicon.svg
    console.log('🌐 Generando favicon (favicon.svg)...');
    const faviconPath = path.join(OUTPUT_DIR, 'favicon.svg');
    const faviconContent = createFavicon();
    fs.writeFileSync(faviconPath, faviconContent, 'utf8');
    console.log(`  ✅ Favicon creado: ${faviconPath}`);

    // 3. Generar placeholders para PNG (normalmente usarías sharp o canvas)
    console.log('📏 Generando placeholders para PNG...');
    ICON_SIZES.forEach(size => {
        const filename = `icon-${size}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        // Crear un archivo placeholder que indica cómo generar el PNG real
        const pngPlaceholder = `# PNG PLACEHOLDER - ${size}x${size}
# Este archivo debe ser reemplazado por una imagen PNG real de ${size}x${size} píxeles
# 
# Para generar PNG desde SVG, puedes usar:
# 1. Inkscape (línea de comandos):
#    inkscape icon.svg --export-png=${filename} --export-width=${size} --export-height=${size}
# 
# 2. Herramientas online:
#    - https://convertio.co/svg-png/
#    - https://cloudconvert.com/svg-to-png
# 
# 3. Programáticamente con Node.js:
#    npm install sharp
#    // Usar sharp para convertir SVG a PNG
# 
# Tamaño requerido: ${size}x${size} píxeles
`;
        
        fs.writeFileSync(filepath, pngPlaceholder, 'utf8');
        console.log(`  📄 Placeholder creado: ${filename}`);
    });

    // 4. Generar archivo ICO placeholder
    generateICOFile();

    // 5. Generar instrucciones
    const instructionsPath = path.join(OUTPUT_DIR, 'ICON_INSTRUCTIONS.md');
    const instructions = `# Instrucciones para Iconos - SamaruC Code

## Archivos Generados

### ✅ Archivos SVG (Listos para usar)
- \`icon.svg\` - Icono principal de la aplicación
- \`favicon.svg\` - Favicon para navegador

### ⚠️ Archivos que necesitan conversión

#### PNG Files (para mejor compatibilidad)
${ICON_SIZES.map(size => `- \`icon-${size}.png\` - ${size}x${size} píxeles`).join('\n')}

#### ICO File (para Windows)
- \`icon.ico\` - Icono ejecutable de Windows

## Cómo generar los archivos PNG/ICO reales

### Opción 1: Herramientas Online (Más fácil)
1. Ve a https://convertio.co/svg-png/
2. Sube el archivo \`icon.svg\`
3. Descarga en los tamaños necesarios: 16, 32, 48, 64, 128, 256, 512
4. Para ICO: usa https://convertio.co/svg-ico/

### Opción 2: Inkscape (Línea de comandos)
\`\`\`bash
# Instalar Inkscape primero
${ICON_SIZES.map(size => 
`inkscape icon.svg --export-png=icon-${size}.png --export-width=${size} --export-height=${size}`
).join('\n')}
\`\`\`

### Opción 3: Node.js con Sharp
\`\`\`bash
npm install sharp
node -e "
const sharp = require('sharp');
const fs = require('fs');
const sizes = [16,32,48,64,128,256,512];
sizes.forEach(size => {
  sharp('icon.svg')
    .resize(size, size)
    .png()
    .toFile(\`icon-\${size}.png\`)
    .then(() => console.log(\`✅ icon-\${size}.png creado\`));
});
"
\`\`\`

## Verificar que funciona

1. **Desarrollo**: \`npm start\` - Debe mostrar el icono en la barra de tareas
2. **Build**: \`npm run build\` - El ejecutable debe tener el icono
3. **Navegador**: El favicon debe aparecer en la pestaña

## Personalizar el icono

1. Edita \`icon.svg\` con cualquier editor SVG (Inkscape, Adobe Illustrator, etc.)
2. Vuelve a ejecutar \`npm run generate-icons\`
3. Convierte los nuevos SVG a PNG/ICO
`;

    fs.writeFileSync(instructionsPath, instructions, 'utf8');
    console.log(`📖 Instrucciones creadas: ${instructionsPath}`);

    console.log('\n🎉 ¡Generación de iconos completada!');
    console.log('📋 Próximos pasos:');
    console.log('   1. Revisa los archivos SVG generados');
    console.log('   2. Convierte los SVG a PNG usando las instrucciones');
    console.log('   3. Genera el archivo ICO para Windows');
    console.log('   4. Ejecuta `npm start` para probar');
    console.log(`\n📁 Archivos en: ${OUTPUT_DIR}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    try {
        generateIcons();
    } catch (error) {
        console.error('❌ Error generando iconos:', error.message);
        process.exit(1);
    }
}

module.exports = { generateIcons };

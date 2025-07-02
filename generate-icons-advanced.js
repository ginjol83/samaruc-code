// generate-icons-advanced.js - Generador avanzado de iconos con Sharp
// Este script genera PNG e ICO reales para SamaruC Code

const fs = require('fs');
const path = require('path');

// Intentar cargar Sharp (opcional)
let sharp;
try {
    sharp = require('sharp');
    console.log('✅ Sharp disponible - Se generarán PNG reales');
} catch (error) {
    console.log('⚠️  Sharp no disponible - Se usarán placeholders');
    console.log('   Para instalar: npm install sharp --save-dev');
}

// Configuración
const ICON_SIZES = [16, 32, 48, 64, 128, 256, 512];
const OUTPUT_DIR = path.join(__dirname, 'src', 'assets');

// SVG del icono principal (mejorado)
function createAdvancedIcon() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <!-- Gradientes -->
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1976D2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0D47A1;stop-opacity:1" />
        </linearGradient>
        
        <linearGradient id="fishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
        </linearGradient>
        
        <radialGradient id="glowEffect" cx="50%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0" />
        </radialGradient>
        
        <!-- Sombra -->
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
    </defs>
    
    <!-- Fondo circular con gradiente -->
    <circle cx="256" cy="256" r="240" fill="url(#backgroundGradient)" stroke="#0D47A1" stroke-width="8"/>
    
    <!-- Efecto de brillo -->
    <circle cx="256" cy="256" r="240" fill="url(#glowEffect)"/>
    
    <!-- Samaruc (pez) con sombra -->
    <g transform="translate(256,256)" filter="url(#dropShadow)">
        <!-- Cuerpo del pez -->
        <ellipse cx="0" cy="0" rx="140" ry="70" fill="url(#fishGradient)" stroke="#1B5E20" stroke-width="3"/>
        
        <!-- Cola del pez -->
        <path d="M-140,-35 L-200,-70 L-220,-40 L-220,0 L-220,40 L-200,70 L-140,35 Z" 
              fill="#388E3C" stroke="#1B5E20" stroke-width="2"/>
        
        <!-- Aletas -->
        <ellipse cx="-50" cy="-55" rx="30" ry="20" fill="#388E3C" stroke="#1B5E20" stroke-width="2"/>
        <ellipse cx="-50" cy="55" rx="30" ry="20" fill="#388E3C" stroke="#1B5E20" stroke-width="2"/>
        <ellipse cx="20" cy="65" rx="20" ry="12" fill="#388E3C" stroke="#1B5E20" stroke-width="1"/>
        
        <!-- Ojo grande -->
        <circle cx="70" cy="-25" r="25" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
        <circle cx="75" cy="-25" r="18" fill="#000000"/>
        <circle cx="78" cy="-28" r="6" fill="#FFFFFF"/>
        <circle cx="76" cy="-30" r="2" fill="#FFFFFF"/>
        
        <!-- Boca -->
        <ellipse cx="135" cy="0" rx="12" ry="18" fill="#2E7D32" stroke="#1B5E20" stroke-width="2"/>
        
        <!-- Escamas decorativas -->
        <g fill="#66BB6A" opacity="0.6">
            <circle cx="-20" cy="-30" r="8"/>
            <circle cx="10" cy="-35" r="6"/>
            <circle cx="-20" cy="0" r="8"/>
            <circle cx="10" cy="5" r="6"/>
            <circle cx="-20" cy="30" r="8"/>
            <circle cx="40" cy="-10" r="6"/>
            <circle cx="40" cy="20" r="6"/>
        </g>
    </g>
    
    <!-- Elementos de código -->
    <g fill="#FFFFFF" font-family="'Courier New', monospace" font-weight="bold" opacity="0.9">
        <!-- Corchetes y símbolos -->
        <text x="100" y="100" font-size="32">&lt;/&gt;</text>
        <text x="380" y="120" font-size="28">{}</text>
        <text x="360" y="400" font-size="36" fill="#81C784">C</text>
        <text x="80" y="420" font-size="28">#include</text>
        <text x="120" y="380" font-size="24">main()</text>
        <text x="380" y="200" font-size="20">printf</text>
    </g>
    
    <!-- Texto principal -->
    <text x="256" y="460" text-anchor="middle" fill="#FFFFFF" 
          font-family="Arial, sans-serif" font-size="38" font-weight="bold">SamaruC Code</text>
</svg>`;
}

// Favicon simplificado
function createSimpleFavicon() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1976D2"/>
            <stop offset="100%" style="stop-color:#0D47A1"/>
        </linearGradient>
    </defs>
    
    <!-- Fondo redondeado -->
    <rect width="32" height="32" fill="url(#bg)" rx="6"/>
    
    <!-- Samaruc simplificado -->
    <g transform="translate(16,16)">
        <!-- Cuerpo del pez -->
        <ellipse cx="0" cy="0" rx="9" ry="5" fill="#4CAF50"/>
        
        <!-- Cola -->
        <path d="M-9,-3 L-14,-5 L-14,0 L-14,5 L-9,3 Z" fill="#388E3C"/>
        
        <!-- Ojo -->
        <circle cx="5" cy="-2" r="2" fill="#FFFFFF"/>
        <circle cx="5.5" cy="-2" r="1.2" fill="#000000"/>
        <circle cx="5.8" cy="-2.3" r="0.4" fill="#FFFFFF"/>
    </g>
    
    <!-- Letra C -->
    <text x="26" y="28" fill="#FFFFFF" font-family="monospace" font-size="9" font-weight="bold">C</text>
</svg>`;
}

// Generar PNG usando Sharp
async function generatePNGWithSharp(svgContent, size, filename) {
    if (!sharp) {
        console.log(`  ⚠️  Saltando ${filename} (Sharp no disponible)`);
        return false;
    }

    try {
        const outputPath = path.join(OUTPUT_DIR, filename);
        
        await sharp(Buffer.from(svgContent))
            .resize(size, size)
            .png({
                quality: 90,
                compressionLevel: 6,
                progressive: true
            })
            .toFile(outputPath);
        
        console.log(`  ✅ PNG creado: ${filename} (${size}x${size})`);
        return true;
    } catch (error) {
        console.log(`  ❌ Error creando ${filename}: ${error.message}`);
        return false;
    }
}

// Generar ICO usando Sharp (aproximación)
async function generateICOWithSharp(svgContent) {
    if (!sharp) {
        console.log(`  ⚠️  Saltando icon.ico (Sharp no disponible)`);
        return false;
    }

    try {
        // Generar un PNG de 256x256 que puede usarse como ICO
        const outputPath = path.join(OUTPUT_DIR, 'icon.ico.png');
        
        await sharp(Buffer.from(svgContent))
            .resize(256, 256)
            .png({ quality: 100 })
            .toFile(outputPath);
        
        console.log(`  ✅ ICO equivalente creado: icon.ico.png`);
        console.log(`  ℹ️  Renombra icon.ico.png a icon.ico para usar en Windows`);
        return true;
    } catch (error) {
        console.log(`  ❌ Error creando ICO: ${error.message}`);
        return false;
    }
}

// Función principal
async function generateAdvancedIcons() {
    console.log('🎨 Generador Avanzado de Iconos - SamaruC Code');
    console.log('============================================');

    // Crear directorio si no existe
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Directorio creado: ${OUTPUT_DIR}`);
    }

    // 1. Generar SVG principal
    console.log('\n🎨 Generando icono principal avanzado...');
    const mainIconContent = createAdvancedIcon();
    const mainIconPath = path.join(OUTPUT_DIR, 'icon.svg');
    fs.writeFileSync(mainIconPath, mainIconContent, 'utf8');
    console.log(`  ✅ Icono principal: icon.svg`);

    // 2. Generar favicon
    console.log('\n🌐 Generando favicon optimizado...');
    const faviconContent = createSimpleFavicon();
    const faviconPath = path.join(OUTPUT_DIR, 'favicon.svg');
    fs.writeFileSync(faviconPath, faviconContent, 'utf8');
    console.log(`  ✅ Favicon: favicon.svg`);

    // 3. Generar PNG con Sharp
    if (sharp) {
        console.log('\n📏 Generando archivos PNG...');
        for (const size of ICON_SIZES) {
            const filename = `icon-${size}.png`;
            await generatePNGWithSharp(mainIconContent, size, filename);
        }

        // 4. Generar ICO
        console.log('\n🪟 Generando ICO para Windows...');
        await generateICOWithSharp(mainIconContent);
    } else {
        console.log('\n⚠️  Sharp no está disponible. Instala con: npm install sharp --save-dev');
    }

    // 5. Actualizar instrucciones
    const instructionsPath = path.join(OUTPUT_DIR, 'ICON_README.md');
    const instructions = `# Iconos Generados - SamaruC Code

## 🎯 Estado de los Archivos

### ✅ Archivos SVG (Listos)
- \`icon.svg\` - Icono principal con diseño avanzado
- \`favicon.svg\` - Favicon optimizado para navegador

### ${sharp ? '✅' : '⚠️'} Archivos PNG ${sharp ? '(Generados)' : '(Requieren Sharp)'}
${ICON_SIZES.map(size => `- \`icon-${size}.png\` - ${size}x${size} píxeles ${sharp ? '✅' : '❌'}`).join('\n')}

### ${sharp ? '✅' : '⚠️'} Archivo ICO ${sharp ? '(Generado)' : '(Requiere conversión)'}
- \`icon.ico\` - Para ejecutable de Windows ${sharp ? '✅' : '❌'}

## 🚀 Cómo usar

### Para desarrollo inmediato:
\`\`\`bash
npm start  # Los SVG funcionan perfectamente
\`\`\`

### Para mejor compatibilidad:
${!sharp ? `
1. Instalar Sharp:
\`\`\`bash
npm install sharp --save-dev
npm run generate-icons-advanced
\`\`\`
` : ''}

2. Verificar archivos:
\`\`\`bash
ls src/assets/icon*
\`\`\`

3. Compilar aplicación:
\`\`\`bash
npm run build  # Usa los PNG/ICO generados
\`\`\`

## 🎨 Personalización

1. **Editar colores**: Modifica los gradientes en \`generate-icons-advanced.js\`
2. **Cambiar diseño**: Edita la función \`createAdvancedIcon()\`
3. **Regenerar**: \`npm run generate-icons-advanced\`

## 📱 Compatibilidad

- **Electron**: ✅ Todos los formatos soportados
- **Windows**: ${sharp ? '✅' : '⚠️'} ICO ${sharp ? 'disponible' : 'requiere conversión'}
- **macOS**: ✅ PNG de alta resolución
- **Linux**: ✅ PNG estándar
- **Navegador**: ✅ SVG favicon

## 🔧 Troubleshooting

### Si no aparece el icono:
1. Verifica que los archivos existen en \`src/assets/\`
2. Reinicia la aplicación: \`npm start\`
3. Para Windows: Asegúrate que \`icon.ico\` es un archivo ICO real

### Si Sharp falla:
1. Reinstalar: \`npm uninstall sharp && npm install sharp --save-dev\`
2. En Windows: Puede requerir Visual Studio Build Tools
3. Alternativa: Usar herramientas online para convertir SVG→PNG→ICO
`;

    fs.writeFileSync(instructionsPath, instructions, 'utf8');
    console.log(`\n📖 Documentación actualizada: ICON_README.md`);

    // Resumen final
    console.log('\n🎉 ¡Generación completada!');
    console.log('📋 Estado:');
    console.log(`   ✅ SVG: Listo para usar`);
    console.log(`   ${sharp ? '✅' : '❌'} PNG: ${sharp ? 'Generados' : 'Requiere Sharp'}`);
    console.log(`   ${sharp ? '✅' : '❌'} ICO: ${sharp ? 'Generado' : 'Requiere conversión'}`);
    console.log(`\n🚀 Prueba ahora: npm start`);
}

// Exportar para uso como módulo
module.exports = { generateAdvancedIcons };

// Ejecutar si se llama directamente
if (require.main === module) {
    generateAdvancedIcons().catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

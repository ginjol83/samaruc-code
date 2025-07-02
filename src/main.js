const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const url = require('url');

// Suprimir warnings de Electron en Windows y configurar para Monaco
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
}

// Configuraciones específicas para Monaco Editor
app.commandLine.appendSwitch('--enable-experimental-web-platform-features');
app.commandLine.appendSwitch('--enable-features', 'SharedArrayBuffer');
app.commandLine.appendSwitch('--disable-web-security'); // CRÍTICO para archivos locales
app.commandLine.appendSwitch('--allow-file-access-from-files'); // CRÍTICO para workers
app.commandLine.appendSwitch('--disable-site-isolation-trials');
app.commandLine.appendSwitch('--allow-running-insecure-content');
app.commandLine.appendSwitch('--disable-features', 'BlockInsecurePrivateNetworkRequests');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // CRÍTICO: Permite cargar archivos locales
      allowRunningInsecureContent: true,
      enableRemoteModule: false,
      sandbox: false,
      experimentalFeatures: true,
      // Configuraciones específicas para Monaco Editor
      webgl: false,
      plugins: false,
      javascript: true,
      images: true,
      // Permitir workers para Monaco
      additionalArguments: ['--enable-experimental-web-platform-features'],
      // Configuración específica para file://
      allowFileAccessFromFiles: true
    },
    title: 'SamaruC Code - IDE para Juegos Retro',
    show: false,
    // Configuración de ventana
    icon: path.join(__dirname, 'assets/favicon.svg')
  });

  mainWindow.loadFile('src/index.html');

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir DevTools en modo desarrollo
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Crear menú
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo Proyecto',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'Abrir Proyecto',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory'],
              title: 'Seleccionar carpeta del proyecto'
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-open-project', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Guardar',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save');
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Construcción',
      submenu: [
        {
          label: 'Compilar',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('menu-compile');
          }
        },
        {
          label: 'Compilar y Ejecutar',
          accelerator: 'F6',
          click: () => {
            mainWindow.webContents.send('menu-compile-run');
          }
        },
        {
          label: 'Limpiar',
          click: () => {
            mainWindow.webContents.send('menu-clean');
          }
        }
      ]
    },
    {
      label: 'Plantillas',
      submenu: [
        {
          label: 'Juego Básico',
          click: () => {
            mainWindow.webContents.send('menu-template', 'basic-game');
          }
        },
        {
          label: 'Juego de Plataformas',
          click: () => {
            mainWindow.webContents.send('menu-template', 'platform-game');
          }
        },
        {
          label: 'Juego de Disparos',
          click: () => {
            mainWindow.webContents.send('menu-template', 'shooter-game');
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Documentación',
          click: () => {
            mainWindow.webContents.send('menu-docs');
          }
        },
        {
          label: 'Acerca de',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de SamaruC Code',
              message: 'SamaruC Code v1.0.0',
              detail: '🐟 IDE para desarrollo de juegos retro en C\nInspired by Valencia hispanica\nDesarrollado con Electron.js'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Manejo de IPC
ipcMain.handle('compile-project', async (event, projectPath, mainFile) => {
  return new Promise((resolve, reject) => {
    const outputFile = mainFile.replace('.c', '.exe');
    const compiler = spawn('gcc', [
      '-o', outputFile,
      mainFile,
      '-lSDL2', '-lSDL2_image', '-lSDL2_mixer', '-lSDL2_ttf'
    ], {
      cwd: projectPath
    });

    let output = '';
    let error = '';

    compiler.stdout.on('data', (data) => {
      output += data.toString();
    });

    compiler.stderr.on('data', (data) => {
      error += data.toString();
    });

    compiler.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output,
        error: error,
        executable: code === 0 ? outputFile : null
      });
    });
  });
});

ipcMain.handle('run-executable', async (event, executablePath) => {
  return new Promise((resolve, reject) => {
    const process = spawn(executablePath, [], {
      cwd: path.dirname(executablePath)
    });

    resolve({
      success: true,
      pid: process.pid
    });
  });
});

// Handler para leer archivos
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content: content };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
});

// Handler para escribir archivos
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    const fs = require('fs').promises;
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(dirPath, item.name)
    }));
    return { success: true, items: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  } catch (error) {
    return { 
      canceled: true, 
      error: error.message 
    };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  } catch (error) {
    return { 
      canceled: true, 
      error: error.message 
    };
  }
});

// Handler para actualizar título de la ventana
ipcMain.on('update-window-title', (event, title) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle(title);
    }
  } catch (error) {
    console.error('Error updating window title:', error);
  }
});

// Handler para crear directorio
ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    const fs = require('fs').promises;
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error creating directory:', error);
    return { success: false, error: error.message };
  }
});

// Handler para crear proyecto completo
ipcMain.handle('create-project', async (event, projectPath, projectName, options = {}) => {
  try {
    const fs = require('fs').promises;
    
    // Crear directorio del proyecto
    await fs.mkdir(projectPath, { recursive: true });
    
    // Crear archivo build.json
    const buildConfig = {
      platform: options.platform || "spectrum",
      compiler: options.compiler || "sdcc", 
      target: options.target || "z80"
    };
    
    const buildJsonPath = path.join(projectPath, 'build.json');
    await fs.writeFile(buildJsonPath, JSON.stringify(buildConfig, null, 2), 'utf-8');
    
    // Crear archivo main.c básico
    const mainCContent = `#include <stdio.h>

// ${projectName} - Proyecto creado con SamaruC Code
// Plataforma: ${buildConfig.platform}
// Compilador: ${buildConfig.compiler}
// Target: ${buildConfig.target}

int main() {
    printf("Hola desde ${projectName}!\\n");
    printf("Proyecto para ${buildConfig.platform} usando ${buildConfig.compiler}\\n");
    return 0;
}`;
    
    const mainCPath = path.join(projectPath, 'main.c');
    await fs.writeFile(mainCPath, mainCContent, 'utf-8');
    
    // Crear README.md del proyecto
    const readmeContent = `# ${projectName}

Proyecto creado con **SamaruC Code** 🐟

## Configuración de Build

- **Plataforma**: ${buildConfig.platform}
- **Compilador**: ${buildConfig.compiler}
- **Target**: ${buildConfig.target}

## Archivos

- \`main.c\` - Archivo principal del proyecto
- \`build.json\` - Configuración de compilación
- \`README.md\` - Este archivo

## Compilación

Dependiendo de la plataforma configurada, usa el compilador apropiado:

\`\`\`bash
# Para Z80/Spectrum con SDCC
sdcc -mz80 main.c

# Para sistemas estándar
gcc main.c -o ${projectName.toLowerCase()}
\`\`\`

## Acerca de SamaruC Code

SamaruC Code es un IDE especializado para desarrollo de juegos retro, nombrado en honor al samaruc (*Valencia hispanica*), un pez endémico de la Albufera de Valencia.

¡Que el código fluya como el samaruc en las aguas! 🌊
`;
    
    const readmePath = path.join(projectPath, 'README.md');
    await fs.writeFile(readmePath, readmeContent, 'utf-8');
    
    return { 
      success: true, 
      projectPath: projectPath,
      files: ['main.c', 'build.json', 'README.md']
    };
    
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error: error.message };
  }
});

// Función simple para detectar tipos MIME
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Servidor HTTP para servir archivos de Monaco
let monacoServer = null;

function createMonacoServer() {
  return new Promise((resolve, reject) => {
    const port = 8080;
    
    monacoServer = http.createServer((req, res) => {
      // Parsear URL
      const parsedUrl = url.parse(req.url);
      let pathname = parsedUrl.pathname;
      
      // Mapear ruta a archivo local
      const filePath = path.join(__dirname, '../', pathname);
      
      // Verificar que el archivo existe
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
          return;
        }
        
        // Obtener tipo MIME
        const mimeType = getMimeType(filePath);
        
        // Configurar headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', mimeType);
        
        // Leer y servir archivo
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Error reading file');
            return;
          }
          
          res.writeHead(200);
          res.end(data);
        });
      });
    });
    
    monacoServer.listen(port, 'localhost', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ Servidor Monaco iniciado en http://localhost:${port}`);
        resolve({ success: true, port: port });
      }
    });
    
    monacoServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Puerto ${port} en uso, intentando otro...`);
        // Intentar con puerto aleatorio
        const randomPort = 8081 + Math.floor(Math.random() * 1000);
        createMonacoServerOnPort(randomPort).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

function createMonacoServerOnPort(port) {
  return new Promise((resolve, reject) => {
    if (monacoServer) {
      monacoServer.close();
    }
    
    monacoServer = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url);
      let pathname = parsedUrl.pathname;
      const filePath = path.join(__dirname, '../', pathname);
      
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
          return;
        }
        
        const mimeType = getMimeType(filePath);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', mimeType);
        
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Error reading file');
            return;
          }
          
          res.writeHead(200);
          res.end(data);
        });
      });
    });
    
    monacoServer.listen(port, 'localhost', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ Servidor Monaco iniciado en http://localhost:${port}`);
        resolve({ success: true, port: port });
      }
    });
  });
}

// IPC Handler para iniciar servidor Monaco
ipcMain.handle('start-monaco-server', async (event) => {
  try {
    console.log('🚀 Iniciando servidor HTTP para Monaco...');
    const result = await createMonacoServer();
    return result;
  } catch (error) {
    console.error('❌ Error iniciando servidor Monaco:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

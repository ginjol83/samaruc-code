const { app, BrowserWenu, dialog, ipcMain } = require('electron');  // En desarrollo, usar webpack dev server
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar archivo compilado
    mainWindow.loadFile(path.join(__dirname, '../dist-vue/index.html'));
  }
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    title: 'Retro Game IDE - Vue.js Edition',
    show: false
  });

  // En desarrollo, usar webpack dev server
  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar archivo compilado
    mainWindow.loadFile('dist/index.html');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

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
      label: 'Ver',
      submenu: [
        { label: 'Recargar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Forzar Recarga', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Herramientas de Desarrollador', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Zoom Real', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Acercar', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Alejar', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Pantalla Completa', accelerator: 'F11', role: 'togglefullscreen' }
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
              title: 'Acerca de Retro Game IDE Vue',
              message: 'Retro Game IDE Vue v1.0.0',
              detail: 'IDE para desarrollo de juegos retro en C\nDesarrollado con Vue.js + Electron'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Manejo de IPC - Misma funcionalidad que antes
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

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    // Crear directorio si no existe
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
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

ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-exists', async (event, filePath) => {
  try {
    return { success: true, exists: fs.existsSync(filePath) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return { success: true, ...result };
  } catch (error) {
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

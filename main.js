const { app, BrowserWindow, Menu, dialog, ipcMain, nativeTheme, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Configurar tema oscuro nativo
nativeTheme.themeSource = 'dark';

// Configuraciones específicas para Monaco Editor offline
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--allow-file-access-from-files');
app.commandLine.appendSwitch('--disable-site-isolation-trials');
app.commandLine.appendSwitch('--enable-experimental-web-platform-features');
app.commandLine.appendSwitch('--force-dark-mode'); // Forzar modo oscuro

let mainWindow;

// Función para obtener el icono correcto según la plataforma
function getAppIcon() {
  const iconPath = path.join(__dirname, 'src/assets');
  console.log('- Buscando iconos en:', iconPath);
  
  // Verificar si existe un icono específico para la plataforma
  if (process.platform === 'win32') {
    // Probar primero con PNG de alta resolución
    const png256Path = path.join(iconPath, 'icon-256.png');
    console.log('- Verificando icon-256.png:', png256Path);
    if (fs.existsSync(png256Path)) {
      console.log('- Usando icon-256.png:', png256Path);
      return png256Path;
    }
    
    // Windows prefiere ICO
    const icoPath = path.join(iconPath, 'icon.ico');
    console.log('- Verificando icon.ico:', icoPath);
    if (fs.existsSync(icoPath)) {
      console.log('- Usando icon.ico:', icoPath);
      return icoPath;
    }
  } else if (process.platform === 'darwin') {
    // macOS prefiere ICNS
    const icnsPath = path.join(iconPath, 'icon.icns');
    if (fs.existsSync(icnsPath)) {
      console.log('- Usando icon.icns:', icnsPath);
      return icnsPath;
    }
  }
  
  // Fallback universal
  const svgPath = path.join(iconPath, 'icon.svg');
  console.log('- Usando fallback SVG:', svgPath);
  return svgPath;
}

function createWindow() {
  const appIcon = getAppIcon();
  console.log('- Icono que se usará para la ventana:', appIcon);
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowFileAccessFromFiles: true,
      preload: path.join(__dirname, 'src/preload.js')
    },
    title: 'SamaruC Code - IDE para Juegos Retro',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#1e1e1e', // Fondo oscuro para evitar flashes blancos
    show: false,
    icon: appIcon, // Usar función para obtener icono correcto
    darkTheme: true, // Forzar tema oscuro en Linux
    frame: true // Mantener frame nativo para menú oscuro
  });

  console.log('- Ventana creada con icono:', appIcon);

  mainWindow.loadFile('src/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Forzar actualización del tema después de mostrar
    if (process.platform === 'win32') {
      // En Windows, asegurar que el tema oscuro se aplique
      mainWindow.setBackgroundColor('#1e1e1e');
    }
  });

  // Habilitar DevTools y debugging remoto en desarrollo
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
    
    // Habilitar debugging remoto para el renderer process
    mainWindow.webContents.debugger.attach('1.3');
    console.log('- Debugging habilitado - DevTools abierto');
  }

  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-file')
        },
        {
          label: 'Abrir',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu-open-file')
        },
        {
          label: 'Guardar',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save-file')
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Alternar Tema',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            // Alternar entre claro y oscuro
            const currentTheme = nativeTheme.themeSource;
            nativeTheme.themeSource = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Notificar al renderer process sobre el cambio
            mainWindow.webContents.send('theme-changed', nativeTheme.themeSource);
            
            console.log(`- Tema cambiado a: ${nativeTheme.themeSource}`);
          }
        },
        { type: 'separator' },
        {
          label: 'Mostrar/Ocultar DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow.webContents.isDevToolsOpened()) {
              mainWindow.webContents.closeDevTools();
            } else {
              mainWindow.webContents.openDevTools();
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SamaruC Code',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About SamaruC Code',
              message: 'SamaruC Code v0.0.1',
              detail: '🐟 IDE for retro development with Monaco Editor\nInspired by Valencia Hispanica'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Manejadores IPC básicos
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, content: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

// Manejadores IPC para el explorador de archivos
ipcMain.handle('open-folder-dialog', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Abrir Proyecto - Seleccionar Carpeta'
    });
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const result = items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      isFile: item.isFile(),
      path: path.join(dirPath, item.name)
    }));
    return { success: true, items: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-path-exists', async (event, filePath) => {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      const stats = await fs.promises.stat(filePath);
      return { 
        success: true, 
        exists: true, 
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      };
    } else {
      return { success: true, exists: false };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Manejadores IPC para compilación
ipcMain.handle('show-compile-sdk-dialog', async (event) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: 'Seleccionar SDK de Compilación',
      message: '¿Con qué SDK deseas compilar el proyecto?',
      detail: 'Selecciona el kit de desarrollo para la compilación del código C.',
      buttons: [
        '🎮 Gameboy SDK',
        '💻 ZX Spectrum SDK', 
        '💾 BASIC Compiler',
        '🔧 GCC/MinGW (Estándar)',
        '❌ Cancelar'
      ],
      defaultId: 3, // GCC por defecto
      cancelId: 4,   // Cancelar
      noLink: true,
      icon: path.join(__dirname, 'src/assets/favicon.svg')
    });
    
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

ipcMain.handle('show-compile-options-dialog', async (event, sdkName) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: `Opciones de ${sdkName}`,
      message: `Configuración para ${sdkName}`,
      detail: 'Selecciona las opciones de compilación:',
      buttons: [
        '🚀 Compilar y Ejecutar',
        '🔨 Solo Compilar',
        '🐛 Debug Mode',
        '📦 Release Mode',
        '❌ Cancelar'
      ],
      defaultId: 0, // Compilar y ejecutar
      cancelId: 4,   // Cancelar
      noLink: true
    });
    
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

app.whenReady().then(() => {
  // Asegurar tema oscuro al iniciar
  nativeTheme.themeSource = 'dark';
  
  // Log del tema para debugging
  console.log(`- Tema inicial: ${nativeTheme.themeSource}`);
  console.log(`- Tema del sistema: ${nativeTheme.shouldUseDarkColors ? 'oscuro' : 'claro'}`);
  
  createWindow();
  
  // Escuchar cambios de tema del sistema
  nativeTheme.on('updated', () => {
    console.log(`- Tema del sistema actualizado: ${nativeTheme.shouldUseDarkColors ? 'oscuro' : 'claro'}`);
    
    // Notificar al renderer process
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system-theme-changed', {
        shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
        themeSource: nativeTheme.themeSource
      });
    }
  });
});

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

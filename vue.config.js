const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configuración específica para Electron
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: false,
      mainProcessFile: 'src-vue/main-electron.js',
      rendererProcessFile: 'src-vue/main.js',
      builderOptions: {
        appId: 'com.retrogameide.app',
        productName: 'Retro Game IDE Vue',
        directories: {
          output: 'dist_electron'
        },
        files: [
          'dist/**/*',
          'examples/**/*'
        ],
        win: {
          target: 'nsis'
        }
      }
    }
  },

  // Configuración del servidor de desarrollo
  devServer: {
    port: 8080,
    host: 'localhost'
  },

  // Configuración de webpack para Monaco Editor
  configureWebpack: {
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
        "fs": false
      }
    }
  },

  // Public path para archivos estáticos
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
})

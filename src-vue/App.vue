<template>
  <div id="app" class="app-container">
    <!-- Toolbar Component -->
    <Toolbar 
      @new-file="handleNewFile"
      @open-file="handleOpenFile"
      @save-file="handleSaveFile"
      @compile="handleCompile"
      @compile-run="handleCompileRun"
      @load-template="handleLoadTemplate"
    />
    
    <!-- Main Panel -->
    <div class="main-panel">
      <!-- Sidebar Component -->
      <Sidebar 
        :width="store.sidebarWidth"
        @open-project="handleOpenProject"
        @file-click="handleFileClick"
        @resize="handleSidebarResize"
      />
      
      <!-- Editor Container -->
      <div class="editor-container">
        <!-- Editor Tabs -->
        <EditorTabs 
          :open-files="computed.openFilesList.value"
          :active-file="store.activeFile"
          @tab-click="handleTabClick"
          @tab-close="handleTabClose"
        />
        
        <!-- Main Editor -->
        <div class="editor-content">
          <MonacoEditor 
            v-if="computed.hasOpenFiles.value"
            :file-path="store.activeFile"
            :content="computed.activeFileData.value?.content || ''"
            :language="computed.activeFileData.value?.language || 'c'"
            @content-change="handleContentChange"
          />
          
          <WelcomeScreen 
            v-else
            @open-project="handleOpenProject"
            @create-project="handleCreateProject"
            @load-template="handleLoadTemplate"
          />
        </div>
      </div>
    </div>
    
    <!-- Bottom Panel -->
    <BottomPanel 
      :height="store.bottomPanelHeight"
      :active-panel="store.activePanel"
      :output-lines="computed.outputLines.value"
      :problems="store.problems"
      @panel-change="handlePanelChange"
      @resize="handleBottomPanelResize"
    />
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue'
import { store, fileActions, projectActions, compilerActions, templateActions, uiActions, computed } from './stores/appStore.js'

// Importar componentes
import Toolbar from './components/Toolbar.vue'
import Sidebar from './components/Sidebar.vue'
import EditorTabs from './components/EditorTabs.vue'
import MonacoEditor from './components/MonacoEditor.vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import BottomPanel from './components/BottomPanel.vue'

export default {
  name: 'App',
  components: {
    Toolbar,
    Sidebar,
    EditorTabs,
    MonacoEditor,
    WelcomeScreen,
    BottomPanel
  },
  setup() {
    // Setup IPC listeners
    onMounted(() => {
      if (window.electronAPI) {
        window.electronAPI.onMenuAction((event, data) => {
          switch (event.type || event) {
            case 'menu-new-project':
              handleCreateProject()
              break
            case 'menu-open-project':
              if (data) {
                projectActions.loadProject(data)
              } else {
                handleOpenProject()
              }
              break
            case 'menu-save':
              handleSaveFile()
              break
            case 'menu-compile':
              handleCompile()
              break
            case 'menu-compile-run':
              handleCompileRun()
              break
            case 'menu-template':
              templateActions.loadTemplate(data)
              break
          }
        })
      }
      
      // Setup keyboard shortcuts
      document.addEventListener('keydown', handleKeyboardShortcuts)
    })
    
    // Event handlers
    const handleNewFile = () => {
      const fileName = prompt('Nombre del archivo:', 'main.c')
      if (!fileName) return
      
      const filePath = store.currentProject 
        ? `${store.currentProject}/${fileName}` 
        : fileName
      
      const defaultContent = fileName.endsWith('.c') 
        ? `#include <stdio.h>\n\nint main() {\n    printf("Hola mundo!\\n");\n    return 0;\n}`
        : ''
      
      fileActions.openFile(filePath, defaultContent, true)
    }
    
    const handleOpenFile = async () => {
      try {
        const result = await window.electronAPI.showOpenDialog({
          filters: [
            { name: 'Archivos C', extensions: ['c', 'h'] },
            { name: 'Todos los archivos', extensions: ['*'] }
          ]
        })
        
        if (!result.canceled && result.filePaths.length > 0) {
          const filePath = result.filePaths[0]
          const content = await window.electronAPI.readFile(filePath)
          if (content.success) {
            fileActions.openFile(filePath, content.content)
          }
        }
      } catch (error) {
        console.error('Error opening file:', error)
      }
    }
    
    const handleSaveFile = () => {
      if (store.activeFile) {
        fileActions.saveFile(store.activeFile)
      }
    }
    
    const handleOpenProject = async () => {
      try {
        const result = await window.electronAPI.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Seleccionar carpeta del proyecto'
        })
        
        if (!result.canceled && result.filePaths.length > 0) {
          await projectActions.loadProject(result.filePaths[0])
        }
      } catch (error) {
        console.error('Error opening project:', error)
      }
    }
    
    const handleCreateProject = async () => {
      const projectName = prompt('Nombre del proyecto:', 'mi-juego-retro')
      if (!projectName) return
      
      try {
        const result = await window.electronAPI.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Seleccionar carpeta para el nuevo proyecto'
        })
        
        if (!result.canceled && result.filePaths.length > 0) {
          await projectActions.createProject(result.filePaths[0], projectName)
        }
      } catch (error) {
        console.error('Error creating project:', error)
      }
    }
    
    const handleCompile = () => {
      compilerActions.compile()
    }
    
    const handleCompileRun = () => {
      compilerActions.compileAndRun()
    }
    
    const handleLoadTemplate = (templateName) => {
      templateActions.loadTemplate(templateName)
    }
    
    const handleFileClick = async (filePath) => {
      try {
        const content = await window.electronAPI.readFile(filePath)
        if (content.success) {
          fileActions.openFile(filePath, content.content)
        }
      } catch (error) {
        console.error('Error opening file:', error)
      }
    }
    
    const handleTabClick = (filePath) => {
      fileActions.setActiveFile(filePath)
    }
    
    const handleTabClose = (filePath) => {
      fileActions.closeFile(filePath)
    }
    
    const handleContentChange = (content) => {
      if (store.activeFile) {
        const fileData = store.openFiles.get(store.activeFile)
        if (fileData) {
          fileData.content = content
          fileActions.markFileAsModified(store.activeFile)
        }
      }
    }
    
    const handlePanelChange = (panel) => {
      uiActions.setActivePanel(panel)
    }
    
    const handleSidebarResize = (width) => {
      uiActions.setSidebarWidth(width)
    }
    
    const handleBottomPanelResize = (height) => {
      uiActions.setBottomPanelHeight(height)
    }
    
    const handleKeyboardShortcuts = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault()
            handleSaveFile()
            break
          case 'n':
            event.preventDefault()
            handleNewFile()
            break
          case 'o':
            event.preventDefault()
            handleOpenFile()
            break
        }
      } else {
        switch (event.key) {
          case 'F5':
            event.preventDefault()
            handleCompile()
            break
          case 'F6':
            event.preventDefault()
            handleCompileRun()
            break
        }
      }
    }
    
    return {
      store,
      computed,
      handleNewFile,
      handleOpenFile,
      handleSaveFile,
      handleOpenProject,
      handleCreateProject,
      handleCompile,
      handleCompileRun,
      handleLoadTemplate,
      handleFileClick,
      handleTabClick,
      handleTabClose,
      handleContentChange,
      handlePanelChange,
      handleSidebarResize,
      handleBottomPanelResize
    }
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-panel {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>

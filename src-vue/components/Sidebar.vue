<template>
  <div class="sidebar" :style="{ width: width + 'px' }">
    <div class="sidebar-header">
      <h3><i class="fas fa-folder-tree"></i> Explorador</h3>
      <button 
        v-if="store.currentProject"
        class="btn-icon"
        title="Actualizar"
        @click="refreshProject"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
    
    <div class="file-explorer">
      <div v-if="!store.currentProject" class="no-project">
        <p>No hay proyecto abierto</p>
        <button class="btn btn-secondary" @click="$emit('open-project')">
          <i class="fas fa-folder-open"></i> Abrir Proyecto
        </button>
      </div>
      
      <div v-else class="file-tree">
        <div class="project-root">
          <div class="file-item folder" @click="toggleProjectFold">
            <i class="fas" :class="projectFolded ? 'fa-folder' : 'fa-folder-open'"></i>
            <span>{{ getProjectName(store.currentProject) }}</span>
            <i class="fas fa-chevron-right toggle-icon" :class="{ rotated: !projectFolded }"></i>
          </div>
        </div>
        
        <div v-show="!projectFolded" class="file-list">
          <div 
            v-for="item in store.projectFiles" 
            :key="item.path"
            class="file-item"
            :class="{ 
              folder: item.isDirectory,
              file: !item.isDirectory,
              'c-file': item.name.endsWith('.c') || item.name.endsWith('.h'),
              active: store.activeFile === item.path
            }"
            @click="handleItemClick(item)"
            @dblclick="handleItemDoubleClick(item)"
          >
            <i class="fas" :class="getFileIcon(item)"></i>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Resize handle -->
    <div 
      class="resize-handle"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { store, projectActions } from '../stores/appStore.js'

export default {
  name: 'Sidebar',
  props: {
    width: {
      type: Number,
      default: 250
    }
  },
  emits: ['open-project', 'file-click', 'resize'],
  setup(props, { emit }) {
    const projectFolded = ref(false)
    const isResizing = ref(false)
    
    const getProjectName = (projectPath) => {
      return projectPath.split(/[/\\]/).pop() || projectPath
    }
    
    const getFileIcon = (item) => {
      if (item.isDirectory) {
        return 'fa-folder'
      }
      
      if (item.name.endsWith('.c') || item.name.endsWith('.h')) {
        return 'fa-file-code'
      }
      
      if (item.name.endsWith('.md')) {
        return 'fa-file-alt'
      }
      
      if (item.name === 'Makefile') {
        return 'fa-cog'
      }
      
      return 'fa-file'
    }
    
    const toggleProjectFold = () => {
      projectFolded.value = !projectFolded.value
    }
    
    const handleItemClick = (item) => {
      if (!item.isDirectory) {
        emit('file-click', item.path)
      }
    }
    
    const handleItemDoubleClick = (item) => {
      if (item.isDirectory) {
        // Could implement folder expansion here
      }
    }
    
    const refreshProject = async () => {
      await projectActions.refreshFileTree()
    }
    
    const startResize = (event) => {
      isResizing.value = true
      const startX = event.clientX
      const startWidth = props.width
      
      const handleMouseMove = (e) => {
        if (isResizing.value) {
          const deltaX = e.clientX - startX
          const newWidth = Math.max(200, Math.min(600, startWidth + deltaX))
          emit('resize', newWidth)
        }
      }
      
      const handleMouseUp = () => {
        isResizing.value = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return {
      store,
      projectFolded,
      getProjectName,
      getFileIcon,
      toggleProjectFold,
      handleItemClick,
      handleItemDoubleClick,
      refreshProject,
      startResize
    }
  }
}
</script>

<style scoped>
.sidebar {
  background-color: #252526;
  border-right: 1px solid #3e3e42;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  min-width: 200px;
  max-width: 600px;
}

.sidebar-header {
  padding: 12px 16px;
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
  margin: 0;
}

.btn-icon {
  background: none;
  border: none;
  color: #8c8c8c;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s, background-color 0.2s;
}

.btn-icon:hover {
  color: #d4d4d4;
  background-color: #3e3e42;
}

.file-explorer {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.no-project {
  text-align: center;
  padding: 32px 16px;
  color: #8c8c8c;
}

.btn {
  background-color: #68217a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #7a2589;
}

.project-root {
  padding: 0 8px;
}

.file-list {
  padding-left: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  gap: 8px;
  margin: 1px 0;
  position: relative;
}

.file-item:hover {
  background-color: #2a2d2e;
}

.file-item.active {
  background-color: #094771;
  color: white;
}

.file-item.folder {
  font-weight: 500;
}

.file-item.folder .fa-folder,
.file-item.folder .fa-folder-open {
  color: #dcb67a;
}

.file-item.file .fa-file {
  color: #7b96b3;
}

.file-item.c-file .fa-file-code {
  color: #5cb85c;
}

.toggle-icon {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
}

.toggle-icon.rotated {
  transform: rotate(90deg);
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background-color: #0e639c;
}

/* Scrollbar styling */
.file-explorer::-webkit-scrollbar {
  width: 8px;
}

.file-explorer::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.file-explorer::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

.file-explorer::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}
</style>

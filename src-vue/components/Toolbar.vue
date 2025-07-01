<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <button 
        class="btn btn-primary" 
        title="Nuevo archivo"
        @click="$emit('new-file')"
      >
        <i class="fas fa-file-plus"></i>
      </button>
      <button 
        class="btn btn-primary" 
        title="Abrir archivo"
        @click="$emit('open-file')"
      >
        <i class="fas fa-folder-open"></i>
      </button>
      <button 
        class="btn btn-primary" 
        title="Guardar (Ctrl+S)"
        @click="$emit('save-file')"
      >
        <i class="fas fa-save"></i>
      </button>
    </div>
    
    <div class="toolbar-section">
      <button 
        class="btn btn-success" 
        title="Compilar (F5)"
        @click="$emit('compile')"
        :disabled="isCompiling"
      >
        <i class="fas fa-hammer"></i>
        <span v-if="isCompiling">Compilando...</span>
        <span v-else>Compilar</span>
      </button>
      <button 
        class="btn btn-success" 
        title="Compilar y Ejecutar (F6)"
        @click="$emit('compile-run')"
        :disabled="isCompiling"
      >
        <i class="fas fa-play"></i>
        Ejecutar
      </button>
    </div>
    
    <div class="toolbar-section">
      <select 
        v-model="selectedTemplate" 
        class="form-control"
        @change="handleTemplateChange"
      >
        <option value="">Seleccionar plantilla...</option>
        <option value="basic-game">Juego Básico</option>
        <option value="platform-game">Juego de Plataformas</option>
        <option value="shooter-game">Juego de Disparos</option>
      </select>
      <button 
        class="btn btn-info" 
        title="Cargar plantilla"
        @click="loadSelectedTemplate"
        :disabled="!selectedTemplate"
      >
        <i class="fas fa-download"></i>
      </button>
    </div>
    
    <div class="toolbar-section toolbar-status">
      <span v-if="store.currentProject" class="project-info">
        <i class="fas fa-folder"></i>
        {{ getProjectName(store.currentProject) }}
      </span>
      <span v-if="store.activeFile" class="file-info">
        <i class="fas fa-file"></i>
        {{ getFileName(store.activeFile) }}
        <span v-if="isFileModified" class="modified-indicator">•</span>
      </span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { store, computed as storeComputed } from '../stores/appStore.js'

export default {
  name: 'Toolbar',
  emits: ['new-file', 'open-file', 'save-file', 'compile', 'compile-run', 'load-template'],
  setup(props, { emit }) {
    const selectedTemplate = ref('')
    
    const isCompiling = computed(() => store.isCompiling)
    
    const isFileModified = computed(() => {
      if (!store.activeFile) return false
      const fileData = store.openFiles.get(store.activeFile)
      return fileData?.modified || false
    })
    
    const handleTemplateChange = () => {
      // Template selection changed
    }
    
    const loadSelectedTemplate = () => {
      if (selectedTemplate.value) {
        emit('load-template', selectedTemplate.value)
        selectedTemplate.value = ''
      }
    }
    
    const getProjectName = (projectPath) => {
      return projectPath.split(/[/\\]/).pop() || projectPath
    }
    
    const getFileName = (filePath) => {
      return filePath.split(/[/\\]/).pop() || filePath
    }
    
    return {
      store,
      selectedTemplate,
      isCompiling,
      isFileModified,
      handleTemplateChange,
      loadSelectedTemplate,
      getProjectName,
      getFileName
    }
  }
}
</script>

<style scoped>
.toolbar {
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  min-height: 48px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-status {
  margin-left: auto;
  color: #8c8c8c;
  font-size: 13px;
}

.project-info,
.file-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.modified-indicator {
  color: #ff6b6b;
  font-weight: bold;
}

.btn {
  background-color: #0e639c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn:hover:not(:disabled) {
  background-color: #1177bb;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #0e639c;
}

.btn-success {
  background-color: #107c10;
}

.btn-success:hover:not(:disabled) {
  background-color: #0e6e0e;
}

.btn-info {
  background-color: #00bcf2;
}

.btn-info:hover:not(:disabled) {
  background-color: #0099cc;
}

.form-control {
  background-color: #3c3c3c;
  color: #d4d4d4;
  border: 1px solid #5a5a5a;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  min-width: 180px;
}

.form-control:focus {
  outline: none;
  border-color: #0e639c;
}
</style>

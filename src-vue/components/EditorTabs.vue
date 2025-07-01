<template>
  <div v-if="openFiles.length > 0" class="editor-tabs">
    <div 
      v-for="filePath in openFiles" 
      :key="filePath"
      class="editor-tab"
      :class="{ active: filePath === activeFile }"
      @click="$emit('tab-click', filePath)"
    >
      <i class="fas fa-file"></i>
      <span>{{ getFileName(filePath) }}</span>
      <span v-if="isFileModified(filePath)" class="modified-indicator">•</span>
      <button 
        class="close-btn" 
        @click.stop="$emit('tab-close', filePath)"
        title="Cerrar"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { store } from '../stores/appStore.js'

export default {
  name: 'EditorTabs',
  props: {
    openFiles: {
      type: Array,
      default: () => []
    },
    activeFile: {
      type: String,
      default: ''
    }
  },
  emits: ['tab-click', 'tab-close'],
  setup() {
    const getFileName = (filePath) => {
      return filePath.split(/[/\\]/).pop() || filePath
    }
    
    const isFileModified = (filePath) => {
      const fileData = store.openFiles.get(filePath)
      return fileData?.modified || false
    }
    
    return {
      getFileName,
      isFileModified
    }
  }
}
</script>

<style scoped>
.editor-tabs {
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  min-height: 35px;
  overflow-x: auto;
}

.editor-tab {
  background-color: #2d2d30;
  color: #969696;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-right: 1px solid #3e3e42;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  min-width: 0;
}

.editor-tab:hover {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.editor-tab.active {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.modified-indicator {
  color: #ff6b6b;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #8c8c8c;
  cursor: pointer;
  padding: 2px;
  margin-left: 8px;
  font-size: 12px;
  border-radius: 2px;
  transition: color 0.2s, background-color 0.2s;
}

.close-btn:hover {
  color: #d4d4d4;
  background-color: #3e3e42;
}
</style>

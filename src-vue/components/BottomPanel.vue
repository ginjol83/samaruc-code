<template>
  <div class="bottom-panel" :style="{ height: height + 'px' }">
    <div class="panel-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="panel-tab"
        :class="{ active: activePanel === tab.id }"
        @click="$emit('panel-change', tab.id)"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </button>
    </div>
    
    <div class="panel-content">
      <!-- Output Panel -->
      <div 
        v-show="activePanel === 'output'" 
        class="panel-section output-panel"
      >
        <div class="panel-header">
          <span>Salida de Compilación</span>
          <button class="btn-icon" @click="clearOutput" title="Limpiar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="console-output" ref="outputContainer">
          <div 
            v-for="(line, index) in outputLines" 
            :key="index"
            class="output-line"
            :class="line.type"
          >
            [{{ line.timestamp }}] {{ line.message }}
          </div>
          <div v-if="outputLines.length === 0" class="no-output">
            Listo para compilar...
          </div>
        </div>
      </div>
      
      <!-- Terminal Panel -->
      <div 
        v-show="activePanel === 'terminal'" 
        class="panel-section terminal-panel"
      >
        <div class="panel-header">
          <span>Terminal</span>
        </div>
        <div class="terminal-output">
          <div class="terminal-placeholder">
            Terminal integrada (próximamente)
          </div>
        </div>
      </div>
      
      <!-- Problems Panel -->
      <div 
        v-show="activePanel === 'problems'" 
        class="panel-section problems-panel"
      >
        <div class="panel-header">
          <span>Problemas</span>
          <span v-if="problems.length > 0" class="problem-count">
            {{ problems.length }}
          </span>
        </div>
        <div class="problems-list">
          <div 
            v-for="(problem, index) in problems" 
            :key="index"
            class="problem-item"
          >
            <div class="problem-icon" :class="problem.type">
              <i class="fas" :class="problem.type === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle'"></i>
            </div>
            <div class="problem-details">
              <div class="problem-message">{{ problem.message }}</div>
              <div class="problem-location">{{ problem.file }}:{{ problem.line }}:{{ problem.column }}</div>
            </div>
          </div>
          <div v-if="problems.length === 0" class="no-problems">
            No hay problemas detectados
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
import { ref, computed, nextTick, watch } from 'vue'
import { outputActions } from '../stores/appStore.js'

export default {
  name: 'BottomPanel',
  props: {
    height: {
      type: Number,
      default: 200
    },
    activePanel: {
      type: String,
      default: 'output'
    },
    outputLines: {
      type: Array,
      default: () => []
    },
    problems: {
      type: Array,
      default: () => []
    }
  },
  emits: ['panel-change', 'resize'],
  setup(props, { emit }) {
    const outputContainer = ref(null)
    const isResizing = ref(false)
    
    const tabs = computed(() => [
      {
        id: 'output',
        label: 'Salida',
        icon: 'fas fa-terminal',
        badge: null
      },
      {
        id: 'terminal',
        label: 'Terminal',
        icon: 'fas fa-code',
        badge: null
      },
      {
        id: 'problems',
        label: 'Problemas',
        icon: 'fas fa-exclamation-triangle',
        badge: props.problems.length > 0 ? props.problems.length : null
      }
    ])
    
    // Auto-scroll output to bottom when new lines are added
    watch(() => props.outputLines.length, async () => {
      if (props.activePanel === 'output') {
        await nextTick()
        if (outputContainer.value) {
          outputContainer.value.scrollTop = outputContainer.value.scrollHeight
        }
      }
    })
    
    const clearOutput = () => {
      outputActions.clear()
    }
    
    const startResize = (event) => {
      isResizing.value = true
      const startY = event.clientY
      const startHeight = props.height
      
      const handleMouseMove = (e) => {
        if (isResizing.value) {
          const deltaY = startY - e.clientY
          const newHeight = Math.max(150, Math.min(400, startHeight + deltaY))
          emit('resize', newHeight)
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
      outputContainer,
      tabs,
      clearOutput,
      startResize
    }
  }
}
</script>

<style scoped>
.bottom-panel {
  background-color: #252526;
  border-top: 1px solid #3e3e42;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  min-height: 150px;
  max-height: 400px;
}

.panel-tabs {
  background-color: #2d2d30;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #3e3e42;
  min-height: 35px;
}

.panel-tab {
  background-color: transparent;
  color: #969696;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s, color 0.2s;
  position: relative;
}

.panel-tab:hover {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.panel-tab.active {
  background-color: #1e1e1e;
  color: #d4d4d4;
  border-bottom: 2px solid #0e639c;
}

.badge {
  background-color: #ff6b6b;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  min-width: 16px;
  text-align: center;
}

.panel-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.panel-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background-color: #2d2d30;
  padding: 8px 16px;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #d4d4d4;
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

.problem-count {
  background-color: #ff6b6b;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  min-width: 16px;
  text-align: center;
}

/* Output Panel */
.console-output {
  flex: 1;
  padding: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  background-color: #1e1e1e;
  overflow-y: auto;
  color: #d4d4d4;
}

.output-line {
  margin-bottom: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}

.output-line.error {
  color: #f48771;
}

.output-line.warning {
  color: #dcdcaa;
}

.output-line.success {
  color: #4ec9b0;
}

.output-line.info {
  color: #d4d4d4;
}

.no-output {
  color: #8c8c8c;
  font-style: italic;
}

/* Terminal Panel */
.terminal-output {
  flex: 1;
  background-color: #0c0c0c;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  padding: 8px;
  overflow-y: auto;
}

.terminal-placeholder {
  color: #8c8c8c;
  font-style: italic;
  text-align: center;
  padding: 32px;
}

/* Problems Panel */
.problems-list {
  flex: 1;
  overflow-y: auto;
}

.problem-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 16px;
  border-bottom: 1px solid #3e3e42;
  gap: 12px;
}

.problem-item:last-child {
  border-bottom: none;
}

.problem-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.problem-icon.error {
  color: #f48771;
}

.problem-icon.warning {
  color: #dcdcaa;
}

.problem-details {
  flex: 1;
  min-width: 0;
}

.problem-message {
  font-size: 14px;
  margin-bottom: 4px;
  word-break: break-word;
}

.problem-location {
  font-size: 12px;
  color: #8c8c8c;
}

.no-problems {
  text-align: center;
  color: #8c8c8c;
  font-style: italic;
  padding: 32px;
}

.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: row-resize;
  background-color: transparent;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background-color: #0e639c;
}

/* Scrollbar styling */
.console-output::-webkit-scrollbar,
.problems-list::-webkit-scrollbar,
.terminal-output::-webkit-scrollbar {
  width: 8px;
}

.console-output::-webkit-scrollbar-track,
.problems-list::-webkit-scrollbar-track,
.terminal-output::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.console-output::-webkit-scrollbar-thumb,
.problems-list::-webkit-scrollbar-thumb,
.terminal-output::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

.console-output::-webkit-scrollbar-thumb:hover,
.problems-list::-webkit-scrollbar-thumb:hover,
.terminal-output::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}
</style>

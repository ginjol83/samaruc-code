<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <h1><i class="fas fa-gamepad"></i> Retro Game IDE</h1>
      <p>IDE para desarrollo de juegos retro en C con Vue.js</p>
      
      <div class="welcome-actions">
        <button class="btn btn-primary btn-large" @click="$emit('open-project')">
          <i class="fas fa-folder-open"></i> Abrir Proyecto
        </button>
        <button class="btn btn-secondary btn-large" @click="$emit('create-project')">
          <i class="fas fa-plus"></i> Nuevo Proyecto
        </button>
      </div>
      
      <div class="templates-section">
        <h3>Plantillas de Juegos</h3>
        <div class="template-grid">
          <div class="template-card" @click="$emit('load-template', 'basic-game')">
            <i class="fas fa-cube"></i>
            <h4>Juego Básico</h4>
            <p>Estructura básica para un juego simple</p>
          </div>
          <div class="template-card" @click="$emit('load-template', 'platform-game')">
            <i class="fas fa-running"></i>
            <h4>Plataformas</h4>
            <p>Juego de plataformas estilo Mario</p>
          </div>
          <div class="template-card" @click="$emit('load-template', 'shooter-game')">
            <i class="fas fa-crosshairs"></i>
            <h4>Disparos</h4>
            <p>Juego de disparos estilo Space Invaders</p>
          </div>
        </div>
      </div>
      
      <div class="features-section">
        <h3>Características</h3>
        <div class="features-grid">
          <div class="feature-item">
            <i class="fas fa-code"></i>
            <span>Editor Monaco</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-hammer"></i>
            <span>Compilador GCC</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-play"></i>
            <span>Ejecución Directa</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-bug"></i>
            <span>Detección de Errores</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeScreen',
  emits: ['open-project', 'create-project', 'load-template']
}
</script>

<style scoped>
.welcome-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1e1e1e;
  overflow-y: auto;
}

.welcome-content {
  text-align: center;
  max-width: 800px;
  padding: 32px;
}

.welcome-content h1 {
  font-size: 36px;
  margin-bottom: 16px;
  color: #0e639c;
}

.welcome-content p {
  font-size: 18px;
  color: #8c8c8c;
  margin-bottom: 32px;
}

.welcome-actions {
  margin-bottom: 48px;
}

.btn {
  background-color: #0e639c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 8px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #1177bb;
}

.btn-secondary {
  background-color: #68217a;
}

.btn-secondary:hover {
  background-color: #7a2589;
}

.templates-section h3,
.features-section h3 {
  font-size: 24px;
  margin-bottom: 24px;
  color: #d4d4d4;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.template-card {
  background-color: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.template-card:hover {
  background-color: #3e3e42;
  border-color: #0e639c;
  transform: translateY(-2px);
}

.template-card i {
  font-size: 32px;
  color: #0e639c;
  margin-bottom: 16px;
}

.template-card h4 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #d4d4d4;
}

.template-card p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: #252526;
  border-radius: 8px;
  border: 1px solid #3e3e42;
}

.feature-item i {
  font-size: 24px;
  color: #0e639c;
  margin-bottom: 8px;
}

.feature-item span {
  font-size: 14px;
  color: #d4d4d4;
}
</style>

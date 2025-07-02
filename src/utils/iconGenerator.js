const { nativeImage } = require('electron');

// Función para crear icono programáticamente
function createAppIcon() {
  // Crear un canvas de 256x256
  const canvas = require('canvas').createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  
  // Fondo circular oscuro
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, 256, 256);
  
  // Círculo de fondo
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, 2 * Math.PI);
  ctx.fillStyle = '#2d2d30';
  ctx.fill();
  ctx.strokeStyle = '#4EC9B0';
  ctx.lineWidth = 8;
  ctx.stroke();
  
  // Cuerpo del pez
  ctx.beginPath();
  ctx.ellipse(128, 128, 80, 40, -Math.PI/18, 0, 2 * Math.PI);
  ctx.fillStyle = '#4EC9B0';
  ctx.fill();
  
  // Cabeza
  ctx.beginPath();
  ctx.ellipse(90, 118, 25, 20, 0, 0, 2 * Math.PI);
  ctx.fillStyle = '#0E639C';
  ctx.fill();
  
  // Ojo
  ctx.beginPath();
  ctx.arc(85, 115, 8, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(87, 113, 4, 0, 2 * Math.PI);
  ctx.fillStyle = '#000000';
  ctx.fill();
  
  // Cola
  ctx.beginPath();
  ctx.moveTo(180, 125);
  ctx.quadraticCurveTo(220, 110, 230, 128);
  ctx.quadraticCurveTo(220, 146, 180, 131);
  ctx.closePath();
  ctx.fillStyle = '#0E639C';
  ctx.fill();
  
  // Texto
  ctx.font = 'bold 18px Segoe UI';
  ctx.fillStyle = '#4EC9B0';
  ctx.textAlign = 'center';
  ctx.fillText('SamaruC', 128, 200);
  
  ctx.font = '12px Segoe UI';
  ctx.fillStyle = '#CCCCCC';
  ctx.fillText('Code', 128, 220);
  
  return nativeImage.createFromDataURL(canvas.toDataURL());
}

module.exports = { createAppIcon };

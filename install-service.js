const Service = require('node-windows').Service;
const path = require('path');

// Crear un nuevo servicio
const svc = new Service({
  name: 'Rust Discord Bot',
  description: 'Bot de Discord para verificación de perfiles de Rust',
  script: path.join(__dirname, 'index.js'),
  env: [{
    name: "NODE_ENV",
    value: "production"
  }],
  wait: 2,
  grow: 0.25,
  maxRestarts: 3
});

// Eventos del servicio
svc.on('install', function(){
  console.log('✅ Servicio instalado exitosamente!');
  console.log('🚀 Iniciando servicio...');
  svc.start();
});

svc.on('start', function(){
  console.log('✅ Servicio iniciado!');
  console.log('🤖 El bot ahora se ejecuta como servicio de Windows');
});

svc.on('stop', function(){
  console.log('🛑 Servicio detenido');
});

svc.on('error', function(err){
  console.log('❌ Error en el servicio:', err);
});

// Instalar el servicio
console.log('📦 Instalando servicio de Windows...');
svc.install();

const Service = require('node-windows').Service;
const path = require('path');

// Crear referencia al servicio
const svc = new Service({
  name: 'Rust Discord Bot',
  script: path.join(__dirname, 'index.js')
});

// Desinstalar el servicio
svc.on('uninstall', function(){
  console.log('✅ Servicio desinstalado exitosamente!');
});

console.log('🗑️ Desinstalando servicio de Windows...');
svc.uninstall();

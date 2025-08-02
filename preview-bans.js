// Ejemplo de cómo se vería la información de baneos en Discord

const { EmbedBuilder } = require('discord.js');

// Simular datos de una cuenta con baneos
const mockBanData = {
    hasVacBan: true,
    vacBanCount: 1,
    daysSinceLastBan: 45,
    hasGameBan: false,
    gameBanCount: 0,
    economyBan: 'none',
    communityBanned: false
};

// Simular datos de una cuenta limpia
const mockCleanData = {
    hasVacBan: false,
    vacBanCount: 0,
    daysSinceLastBan: 0,
    hasGameBan: false,
    gameBanCount: 0,
    economyBan: 'none',
    communityBanned: false
};

const EmbedUtils = require('./embedUtils');

console.log('🎨 Ejemplo de cómo se mostraría la información de baneos:\n');

console.log('📋 CUENTA CON BANEO VAC:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Simular el procesamiento de baneos
if (mockBanData.hasVacBan) {
    const timeSince = EmbedUtils.getTimeSinceLastBan(mockBanData.daysSinceLastBan);
    console.log(`⚠️ ESTADO DE BANEOS VAC:`);
    console.log(`🚫 **1 BANEO VAC**`);
    console.log(`⏰ Hace: ${timeSince}`);
}

const trustLevel1 = EmbedUtils.calculateTrustLevel(mockBanData);
console.log(`\n🛡️ NIVEL DE CONFIANZA:`);
console.log(trustLevel1);

console.log('\n\n📋 CUENTA LIMPIA:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log(`✅ ESTADO VAC:`);
console.log(`🟢 **SIN BANEOS VAC**`);
console.log(`Cuenta limpia`);

console.log(`\n✅ ESTADO DE JUEGO:`);
console.log(`🟢 **SIN BANEOS**`);
console.log(`Cuenta limpia`);

const trustLevel2 = EmbedUtils.calculateTrustLevel(mockCleanData);
console.log(`\n🛡️ NIVEL DE CONFIANZA:`);
console.log(trustLevel2);

console.log('\n\n🎯 EJEMPLOS DE DIFERENTES TIEMPOS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const ejemplosTiempo = [
    { dias: 1, caso: 'Baneo muy reciente' },
    { dias: 15, caso: 'Baneo reciente' },
    { dias: 90, caso: 'Baneo hace 3 meses' },
    { dias: 400, caso: 'Baneo hace más de un año' },
    { dias: 1200, caso: 'Baneo muy antiguo' }
];

ejemplosTiempo.forEach(ejemplo => {
    const tiempo = EmbedUtils.getTimeSinceLastBan(ejemplo.dias);
    const mockData = {
        hasVacBan: true,
        daysSinceLastBan: ejemplo.dias,
        hasGameBan: false,
        communityBanned: false,
        economyBan: 'none'
    };
    const trust = EmbedUtils.calculateTrustLevel(mockData);
    
    console.log(`\n${ejemplo.caso}:`);
    console.log(`   Tiempo: ${tiempo}`);
    console.log(`   Confianza: ${trust.split('\n')[0]}`);
});

console.log('\n🔥 ¡El bot ahora detecta y muestra información completa de baneos!');
console.log('✅ VAC Bans - ✅ Game Bans - ✅ Community Bans - ✅ Economy Bans');
console.log('✅ Tiempo desde último baneo - ✅ Nivel de confianza calculado');
console.log('✅ Colores dinámicos (rojo para baneados, verde para limpios)');

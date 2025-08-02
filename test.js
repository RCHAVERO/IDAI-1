require('dotenv').config();
const axios = require('axios');

async function testConfiguration() {
    console.log('🧪 Iniciando pruebas de configuración...\n');

    // Verificar variables de entorno
    console.log('📋 Verificando variables de entorno:');
    
    if (!process.env.DISCORD_TOKEN) {
        console.log('❌ DISCORD_TOKEN no está configurado');
        return false;
    } else {
        console.log('✅ DISCORD_TOKEN configurado');
    }

    if (!process.env.STEAM_API_KEY) {
        console.log('❌ STEAM_API_KEY no está configurado');
        return false;
    } else {
        console.log('✅ STEAM_API_KEY configurado');
    }

    // Verificar conectividad con Steam API
    console.log('\n🌐 Verificando conectividad con Steam API:');
    try {
        const response = await axios.get('http://api.steampowered.com/ISteamWebAPIUtil/GetSupportedAPIList/v0001/', {
            params: {
                key: process.env.STEAM_API_KEY
            },
            timeout: 10000
        });

        if (response.status === 200) {
            console.log('✅ Conexión con Steam API exitosa');
            console.log(`✅ Steam API Key válida`);
        }
    } catch (error) {
        console.log('❌ Error conectando con Steam API:', error.message);
        if (error.response && error.response.status === 401) {
            console.log('❌ Steam API Key inválida');
        }
        return false;
    }

    // Probar una consulta real con un Steam ID público conocido
    console.log('\n🔍 Probando consulta de perfil de Steam:');
    try {
        // Steam ID público de ejemplo (Valve - Gabe Newell)
        const testSteamId = '76561197960287930';
        const response = await axios.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', {
            params: {
                key: process.env.STEAM_API_KEY,
                steamids: testSteamId
            },
            timeout: 10000
        });

        if (response.data.response.players.length > 0) {
            const player = response.data.response.players[0];
            console.log('✅ Consulta de perfil exitosa');
            console.log(`✅ Perfil de prueba: ${player.personaname}`);
        }
    } catch (error) {
        console.log('❌ Error en consulta de perfil:', error.message);
        return false;
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📝 Pasos siguientes:');
    console.log('1. Ejecuta "npm start" para iniciar el bot');
    console.log('2. Invita el bot a tu servidor de Discord');
    console.log('3. Prueba los comandos slash como /rust o /steam');
    
    return true;
}

// Ejecutar pruebas
testConfiguration().catch(error => {
    console.error('\n💥 Error durante las pruebas:', error.message);
    process.exit(1);
});

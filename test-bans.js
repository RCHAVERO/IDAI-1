const SteamAPI = require('./steamAPI');
require('dotenv').config();

async function testBanDetection() {
    console.log('🧪 Probando detección de baneos VAC y de juego...\n');

    const steamAPI = new SteamAPI(process.env.STEAM_API_KEY);

    // Steam IDs de prueba (públicos y conocidos)
    const testAccounts = [
        {
            name: 'Cuenta de prueba 1',
            steamId: '76561198000000000' // ID de ejemplo
        },
        {
            name: 'Cuenta de prueba 2', 
            steamId: '76561198000000001' // Otro ID de ejemplo
        }
    ];

    for (const account of testAccounts) {
        console.log(`\n🔍 Probando: ${account.name}`);
        console.log(`Steam ID: ${account.steamId}`);
        
        try {
            // Obtener información de baneos
            const banInfo = await steamAPI.getPlayerBans(account.steamId);
            
            if (banInfo) {
                console.log('\n📊 Información de baneos:');
                console.log(`   VAC Banned: ${banInfo.VACBanned}`);
                console.log(`   Number of VAC Bans: ${banInfo.NumberOfVACBans}`);
                console.log(`   Days Since Last Ban: ${banInfo.DaysSinceLastBan}`);
                console.log(`   Number of Game Bans: ${banInfo.NumberOfGameBans}`);
                console.log(`   Economy Ban: ${banInfo.EconomyBan}`);
                console.log(`   Community Banned: ${banInfo.CommunityBanned}`);

                // Formatear información
                const formattedBans = steamAPI.formatBanInfo(banInfo);
                console.log('\n🛡️ Información formateada:');
                console.log(`   Tiene VAC Ban: ${formattedBans.hasVacBan}`);
                console.log(`   Cantidad VAC Bans: ${formattedBans.vacBanCount}`);
                console.log(`   Tiene Game Ban: ${formattedBans.hasGameBan}`);
                console.log(`   Cantidad Game Bans: ${formattedBans.gameBanCount}`);

                if (formattedBans.daysSinceLastBan > 0) {
                    const timeString = steamAPI.getTimeSinceLastBan(formattedBans.daysSinceLastBan);
                    console.log(`   Tiempo desde último ban: ${timeString}`);
                }

            } else {
                console.log('❌ No se pudo obtener información de baneos');
            }

            // También probar obtener perfil básico
            const profile = await steamAPI.getPlayerSummary(account.steamId);
            if (profile) {
                console.log(`\n👤 Perfil encontrado: ${profile.personaname || 'Sin nombre'}`);
                console.log(`   Visibilidad: ${profile.communityvisibilitystate === 3 ? 'Público' : 'Privado'}`);
            }

        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    console.log('\n🎯 Probando formateo de tiempo...');
    
    // Probar diferentes tiempos
    const testDays = [0, 1, 7, 30, 90, 365, 730, 1095];
    
    for (const days of testDays) {
        const timeString = steamAPI.getTimeSinceLastBan(days);
        console.log(`   ${days} días = "${timeString}"`);
    }

    console.log('\n🎉 Pruebas de detección de baneos completadas!');
}

// Ejecutar pruebas
testBanDetection().catch(console.error);

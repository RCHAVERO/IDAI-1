const BattlemetricsScraper = require('./battlemetrics-scraper');
const logger = require('./logger');

async function testScrapingMethods() {
    console.log('🧪 Probando métodos de scraping y estimación...\n');

    const scraper = new BattlemetricsScraper();
    const testSteamID = '76561198000000000'; // Steam ID de ejemplo

    // Test 1: Web scraping
    console.log('🕷️ Test 1: Web Scraping');
    try {
        const scrapedData = await scraper.searchPlayerBySteamID(testSteamID);
        if (scrapedData) {
            console.log('✅ Scraping exitoso!');
            console.log(`   Jugador encontrado: ${scrapedData.found}`);
            console.log(`   Nombre: ${scrapedData.name || 'N/A'}`);
            console.log(`   Servidores: ${scrapedData.servers.length}`);
        } else {
            console.log('❌ Scraping no encontró datos');
        }
    } catch (error) {
        console.log(`❌ Error en scraping: ${error.message}`);
    }

    console.log('');

    // Test 2: Obtener servidores populares
    console.log('🖥️ Test 2: Servidores Populares');
    try {
        const servers = await scraper.getPopularServers();
        if (servers.length > 0) {
            console.log(`✅ ${servers.length} servidores obtenidos!`);
            console.log('   Top 5 servidores:');
            servers.slice(0, 5).forEach((server, index) => {
                console.log(`   ${index + 1}. ${server.name} (${server.players}/${server.maxPlayers})`);
            });
        } else {
            console.log('❌ No se pudieron obtener servidores');
        }
    } catch (error) {
        console.log(`❌ Error obteniendo servidores: ${error.message}`);
    }

    console.log('');

    // Test 3: Datos estimados
    console.log('📊 Test 3: Datos Estimados');
    try {
        const mockSteamData = {
            personaname: 'TestPlayer',
            playtime_forever: 180000 // 3000 horas en minutos
        };

        const estimatedData = await scraper.createEstimatedData(testSteamID, mockSteamData);
        if (estimatedData) {
            console.log('✅ Datos estimados creados!');
            console.log(`   Jugador: ${estimatedData.name}`);
            console.log(`   Servidores estimados: ${estimatedData.servers.length}`);
            console.log('   Distribución:');
            estimatedData.servers.forEach(server => {
                console.log(`   • ${server.name}: ${server.displayTime}`);
            });
            console.log(`   Tiempo total: ${Math.floor(estimatedData.totalTime / 3600)} horas`);
        } else {
            console.log('❌ No se pudieron crear datos estimados');
        }
    } catch (error) {
        console.log(`❌ Error creando datos estimados: ${error.message}`);
    }

    console.log('\n🎉 Tests completados!');
}

// Ejecutar tests
testScrapingMethods().catch(console.error);

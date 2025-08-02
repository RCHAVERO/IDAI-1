const axios = require('axios');

class BattlemetricsResearch {
    constructor() {
        this.baseURL = 'https://api.battlemetrics.com';
        this.headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Origin': 'https://www.battlemetrics.com',
            'Referer': 'https://www.battlemetrics.com/'
        };
    }

    // Investigar diferentes métodos de autenticación y endpoints
    async investigateAPI() {
        console.log('🔍 Iniciando investigación de Battlemetrics API...\n');

        // Test 1: Probar endpoints públicos sin autenticación
        await this.testPublicEndpoints();

        // Test 2: Probar diferentes formatos de headers
        await this.testDifferentHeaders();

        // Test 3: Investigar si necesitamos API key
        await this.investigateAuthRequirement();

        // Test 4: Probar endpoints de servidores (que podrían funcionar)
        await this.testServerEndpoints();

        // Test 5: Investigar el método que usa Hexaytron
        await this.investigateHexaytronMethod();
    }

    async testPublicEndpoints() {
        console.log('📡 Probando endpoints públicos...');
        
        const endpoints = [
            '/status',
            '/servers?filter[game]=rust&page[size]=1',
            '/games',
            '/search',
            '/players?page[size]=1',
            '/players/search',
            '/rust/servers',
            '/api/status'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${this.baseURL}${endpoint}`, {
                    headers: this.headers,
                    timeout: 5000
                });

                console.log(`✅ ${endpoint} - Status: ${response.status}`);
                if (response.data) {
                    console.log(`   Data keys: ${Object.keys(response.data).join(', ')}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
            }
        }
        console.log('');
    }

    async testDifferentHeaders() {
        console.log('🔧 Probando diferentes configuraciones de headers...');

        const headerConfigs = [
            {
                name: 'Browser Standard',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            },
            {
                name: 'API Client',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'battlemetrics-client/1.0',
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'Discord Bot',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'DiscordBot (Rust Checker, 1.0)',
                    'Accept-Encoding': 'gzip, deflate'
                }
            },
            {
                name: 'Minimal',
                headers: {
                    'Accept': 'application/json'
                }
            }
        ];

        for (const config of headerConfigs) {
            try {
                const response = await axios.get(`${this.baseURL}/servers?filter[game]=rust&page[size]=1`, {
                    headers: config.headers,
                    timeout: 5000
                });

                console.log(`✅ ${config.name} - Status: ${response.status}`);
            } catch (error) {
                console.log(`❌ ${config.name} - Error: ${error.response?.status || error.message}`);
            }
        }
        console.log('');
    }

    async investigateAuthRequirement() {
        console.log('🔐 Investigando requerimientos de autenticación...');

        // Probar con token de autorización (aunque sea falso)
        const authHeaders = {
            ...this.headers,
            'Authorization': 'Bearer test-token'
        };

        try {
            const response = await axios.get(`${this.baseURL}/players?page[size]=1`, {
                headers: authHeaders,
                timeout: 5000
            });
            console.log(`✅ Con Auth Header - Status: ${response.status}`);
        } catch (error) {
            console.log(`❌ Con Auth Header - Error: ${error.response?.status || error.message}`);
            if (error.response?.status === 401) {
                console.log('   💡 La API requiere autenticación válida!');
            }
        }

        // Probar otros métodos de auth
        const apiKeyHeaders = {
            ...this.headers,
            'X-API-Key': 'test-key'
        };

        try {
            const response = await axios.get(`${this.baseURL}/players?page[size]=1`, {
                headers: apiKeyHeaders,
                timeout: 5000
            });
            console.log(`✅ Con API Key - Status: ${response.status}`);
        } catch (error) {
            console.log(`❌ Con API Key - Error: ${error.response?.status || error.message}`);
        }
        console.log('');
    }

    async testServerEndpoints() {
        console.log('🖥️ Probando endpoints de servidores (generalmente públicos)...');

        const serverEndpoints = [
            '/servers?filter[game]=rust&filter[status]=online&page[size]=5',
            '/servers?filter[game]=rust&filter[country]=US&page[size]=3',
            '/servers?filter[game]=rust&filter[region]=europe&page[size]=3',
            '/rust/servers?online=true',
            '/servers/search?game=rust'
        ];

        for (const endpoint of serverEndpoints) {
            try {
                const response = await axios.get(`${this.baseURL}${endpoint}`, {
                    headers: this.headers,
                    timeout: 8000
                });

                console.log(`✅ ${endpoint} - Status: ${response.status}`);
                if (response.data?.data) {
                    console.log(`   Servidores encontrados: ${response.data.data.length}`);
                    if (response.data.data[0]) {
                        console.log(`   Primer servidor: ${response.data.data[0].attributes?.name || 'N/A'}`);
                    }
                }
            } catch (error) {
                console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
            }
        }
        console.log('');
    }

    async investigateHexaytronMethod() {
        console.log('🤖 Investigando cómo obtiene datos Hexaytron...');

        // Teorías sobre cómo Hexaytron podría acceder a los datos:

        console.log('💭 Teorías posibles:');
        console.log('   1. Uso de API key registrada');
        console.log('   2. Web scraping de battlemetrics.com');
        console.log('   3. Cache/base de datos propia');
        console.log('   4. Partnership/acceso especial');
        console.log('   5. Uso de endpoints no documentados');
        console.log('');

        // Probar algunos endpoints que podrían ser no documentados
        const undocumentedEndpoints = [
            '/v1/players/search',
            '/public/players',
            '/open/players',
            '/free/players',
            '/search/players',
            '/lookup/steam'
        ];

        console.log('🔍 Probando endpoints no documentados...');
        for (const endpoint of undocumentedEndpoints) {
            try {
                const response = await axios.get(`${this.baseURL}${endpoint}`, {
                    headers: this.headers,
                    timeout: 5000
                });
                console.log(`✅ ENCONTRADO! ${endpoint} - Status: ${response.status}`);
            } catch (error) {
                console.log(`❌ ${endpoint} - ${error.response?.status || 'timeout'}`);
            }
        }
        console.log('');
    }

    // Probar búsqueda específica con Steam ID de ejemplo
    async testSpecificSteamID() {
        const testSteamID = '76561198000000000'; // Steam ID de ejemplo
        
        console.log(`🎯 Probando búsqueda específica con Steam ID: ${testSteamID}`);

        const searchMethods = [
            {
                name: 'Filter Identifier',
                url: `/players?filter[identifier]=${testSteamID}`
            },
            {
                name: 'Filter Search',
                url: `/players?filter[search]=${testSteamID}`
            },
            {
                name: 'Query Parameter',
                url: `/players?q=${testSteamID}`
            },
            {
                name: 'Steam Parameter',
                url: `/players?steam=${testSteamID}`
            },
            {
                name: 'Search Endpoint',
                url: `/search?query=${testSteamID}&type=player`
            }
        ];

        for (const method of searchMethods) {
            try {
                const response = await axios.get(`${this.baseURL}${method.url}`, {
                    headers: this.headers,
                    timeout: 5000
                });
                console.log(`✅ ${method.name} - Status: ${response.status}`);
                if (response.data?.data?.length > 0) {
                    console.log(`   ⭐ DATOS ENCONTRADOS! Jugadores: ${response.data.data.length}`);
                }
            } catch (error) {
                console.log(`❌ ${method.name} - Error: ${error.response?.status || error.message}`);
            }
        }
    }
}

// Ejecutar investigación
async function runResearch() {
    const research = new BattlemetricsResearch();
    
    try {
        await research.investigateAPI();
        await research.testSpecificSteamID();
        
        console.log('🎉 Investigación completada!');
        console.log('📋 Revisa los resultados para encontrar métodos funcionales.');
        
    } catch (error) {
        console.error('💥 Error durante la investigación:', error.message);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runResearch();
}

module.exports = BattlemetricsResearch;

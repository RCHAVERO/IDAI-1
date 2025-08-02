const axios = require('axios');
const logger = require('./logger');

class BattlemetricsScraper {
    constructor() {
        this.baseURL = 'https://www.battlemetrics.com';
        this.apiURL = 'https://api.battlemetrics.com';
        this.headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'sec-ch-ua': '"Chromium";v="91", " Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        };
    }

    // Método principal: buscar jugador por Steam ID
    async searchPlayerBySteamID(steamId) {
        try {
            logger.debug(`Buscando jugador via web scraping: ${steamId}`);

            // Construir URL de búsqueda
            const searchUrl = `${this.baseURL}/players?filter[search]=${steamId}&filter[game]=rust`;
            
            logger.debug(`URL de búsqueda: ${searchUrl}`);

            const response = await axios.get(searchUrl, {
                headers: this.headers,
                timeout: 15000,
                maxRedirects: 5
            });

            if (response.status === 200) {
                return this.parsePlayerPage(response.data, steamId);
            }

            return null;

        } catch (error) {
            logger.error(`Error en web scraping: ${error.message}`);
            return null;
        }
    }

    // Parsear la página HTML para extraer datos del jugador
    parsePlayerPage(html, steamId) {
        try {
            // Buscar patrones específicos en el HTML
            const playerData = {
                found: false,
                steamId: steamId,
                battlemetricsId: null,
                name: null,
                servers: [],
                totalTime: 0
            };

            // Patrón 1: Buscar datos del jugador en script tags
            const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs);
            if (scriptMatches) {
                for (const script of scriptMatches) {
                    // Buscar JSON data
                    const jsonMatch = script.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/);
                    if (jsonMatch) {
                        try {
                            const data = JSON.parse(jsonMatch[1]);
                            if (data.players && data.players.data) {
                                return this.extractPlayerFromJSON(data, steamId);
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }

            // Patrón 2: Buscar en el HTML directo
            const nameMatch = html.match(/<h1[^>]*class="[^"]*player-name[^"]*"[^>]*>([^<]+)<\/h1>/i);
            if (nameMatch) {
                playerData.found = true;
                playerData.name = nameMatch[1].trim();
            }

            // Patrón 3: Buscar ID de Battlemetrics
            const idMatch = html.match(/players\/(\d+)/);
            if (idMatch) {
                playerData.battlemetricsId = idMatch[1];
                playerData.found = true;
            }

            // Patrón 4: Buscar servidores en tablas
            const serverMatches = html.match(/<tr[^>]*class="[^"]*server-row[^"]*"[^>]*>.*?<\/tr>/gs);
            if (serverMatches) {
                playerData.servers = this.parseServerRows(serverMatches);
            }

            return playerData.found ? playerData : null;

        } catch (error) {
            logger.error(`Error parseando HTML: ${error.message}`);
            return null;
        }
    }

    // Extraer datos del jugador desde JSON embebido
    extractPlayerFromJSON(data, steamId) {
        try {
            const playerData = {
                found: true,
                steamId: steamId,
                battlemetricsId: null,
                name: null,
                servers: [],
                totalTime: 0
            };

            // Buscar en diferentes estructuras de datos
            if (data.players?.data) {
                for (const player of data.players.data) {
                    if (player.id) {
                        playerData.battlemetricsId = player.id;
                        playerData.name = player.attributes?.name || 'Jugador';
                        break;
                    }
                }
            }

            // Buscar datos de servidores
            if (data.servers?.data) {
                playerData.servers = this.extractServerData(data.servers.data);
            }

            // Buscar sessions si están disponibles
            if (data.sessions?.data) {
                const sessionStats = this.calculateSessionStats(data.sessions.data);
                playerData.servers = sessionStats.servers;
                playerData.totalTime = sessionStats.totalTime;
            }

            return playerData;

        } catch (error) {
            logger.error(`Error extrayendo JSON: ${error.message}`);
            return null;
        }
    }

    // Parsear filas de servidores desde HTML
    parseServerRows(serverMatches) {
        const servers = [];

        for (const row of serverMatches) {
            try {
                const serverName = this.extractTextBetween(row, 'server-name', '<', '>');
                const timePlayed = this.extractTextBetween(row, 'time-played', '<', '>');
                const lastSeen = this.extractTextBetween(row, 'last-seen', '<', '>');

                if (serverName) {
                    servers.push({
                        name: serverName.trim(),
                        timePlayed: this.parseTimeToSeconds(timePlayed),
                        lastSeen: lastSeen?.trim(),
                        displayTime: timePlayed?.trim()
                    });
                }
            } catch (e) {
                continue;
            }
        }

        return servers.sort((a, b) => b.timePlayed - a.timePlayed);
    }

    // Extraer texto entre patrones
    extractTextBetween(text, pattern, before, after) {
        const regex = new RegExp(`${pattern}[^${before}]*${after}([^${before}]+)${before}`, 'i');
        const match = text.match(regex);
        return match ? match[1] : null;
    }

    // Convertir tiempo en texto a segundos
    parseTimeToSeconds(timeText) {
        if (!timeText) return 0;

        let total = 0;
        const patterns = [
            { regex: /(\d+)\s*d/i, multiplier: 86400 }, // días
            { regex: /(\d+)\s*h/i, multiplier: 3600 },  // horas
            { regex: /(\d+)\s*m/i, multiplier: 60 },    // minutos
            { regex: /(\d+)\s*s/i, multiplier: 1 }      // segundos
        ];

        for (const pattern of patterns) {
            const match = timeText.match(pattern.regex);
            if (match) {
                total += parseInt(match[1]) * pattern.multiplier;
            }
        }

        return total;
    }

    // Método de fallback: usar API de servidores para obtener información
    async getPopularServers() {
        try {
            logger.debug('Obteniendo lista de servidores populares...');

            const response = await axios.get(`${this.apiURL}/servers`, {
                params: {
                    'filter[game]': 'rust',
                    'filter[status]': 'online',
                    'sort': '-players',
                    'page[size]': 50
                },
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            if (response.data?.data) {
                return response.data.data.map(server => ({
                    id: server.id,
                    name: server.attributes?.name || 'Servidor',
                    players: server.attributes?.players || 0,
                    maxPlayers: server.attributes?.maxPlayers || 0,
                    country: server.attributes?.country || 'Unknown',
                    rank: server.attributes?.rank || null
                }));
            }

            return [];

        } catch (error) {
            logger.error('Error obteniendo servidores populares:', error.message);
            return [];
        }
    }

    // Crear datos simulados basados en servidores populares
    async createEstimatedData(steamId, steamData) {
        try {
            const servers = await this.getPopularServers();
            const totalHours = steamData?.playtime_forever ? Math.floor(steamData.playtime_forever / 60) : 0;

            if (servers.length === 0 || totalHours === 0) {
                return null;
            }

            // Crear distribución estimada de tiempo en servidores populares
            const estimatedServers = [];
            const popularServerNames = [
                'UKN', 'Vital', 'Moose', 'Rustopia', 'Facepunch', 
                'Stevious', 'Rusticated', 'Rustafied'
            ];

            let remainingHours = totalHours;
            
            for (const serverType of popularServerNames.slice(0, 5)) {
                if (remainingHours <= 0) break;

                const percentage = Math.random() * 0.3 + 0.1; // 10-40% del tiempo
                const hoursOnServer = Math.floor(remainingHours * percentage);
                
                if (hoursOnServer > 0) {
                    estimatedServers.push({
                        name: `${serverType} (Estimado)`,
                        timePlayed: hoursOnServer * 3600,
                        displayTime: `${hoursOnServer}h`,
                        estimated: true
                    });
                    remainingHours -= hoursOnServer;
                }
            }

            return {
                found: true,
                steamId: steamId,
                battlemetricsId: null,
                name: steamData?.personaname || 'Jugador',
                servers: estimatedServers,
                totalTime: totalHours * 3600,
                estimated: true,
                message: 'Datos estimados basados en servidores populares'
            };

        } catch (error) {
            logger.error('Error creando datos estimados:', error.message);
            return null;
        }
    }
}

module.exports = BattlemetricsScraper;

const axios = require('axios');
const config = require('./config');
const logger = require('./logger');

class BattlemetricsAPI {
    constructor() {
        this.baseURL = config.APIS.BATTLEMETRICS_BASE;
        this.headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };
    }

    // Método 1: Buscar por Steam ID con múltiples enfoques
    async searchPlayerBySteamId(steamId) {
        const methods = [
            () => this.searchByIdentifier(steamId),
            () => this.searchByPlayerEndpoint(steamId),
            () => this.searchByQuery(steamId),
            () => this.searchByPartialSteamId(steamId)
        ];

        for (const method of methods) {
            try {
                const result = await method();
                if (result) {
                    logger.debug(`Jugador encontrado con método: ${method.name}`);
                    return result;
                }
            } catch (error) {
                logger.debug(`Método ${method.name} falló: ${error.message}`);
                continue;
            }
        }

        logger.warn(`No se encontró jugador en Battlemetrics para Steam ID: ${steamId}`);
        return null;
    }

    // Método específico: Buscar por identificador directo
    async searchByIdentifier(steamId) {
        logger.debug(`Método 1: Búsqueda por identificador directo`);
        
        const response = await axios.get(`${this.baseURL}/players`, {
            params: {
                'filter[search]': steamId,
                'include': 'identifier'
            },
            headers: this.headers,
            timeout: 15000
        });

        if (response.data.data && response.data.data.length > 0) {
            return response.data.data[0];
        }
        return null;
    }

    // Método específico: Endpoint de jugadores sin filtros complejos
    async searchByPlayerEndpoint(steamId) {
        logger.debug(`Método 2: Búsqueda por endpoint simplificado`);
        
        const response = await axios.get(`${this.baseURL}/players`, {
            params: {
                'search': steamId
            },
            headers: this.headers,
            timeout: 15000
        });

        if (response.data.data && response.data.data.length > 0) {
            return response.data.data[0];
        }
        return null;
    }

    // Método específico: Búsqueda por query general
    async searchByQuery(steamId) {
        logger.debug(`Método 3: Búsqueda por query general`);
        
        const response = await axios.get(`${this.baseURL}/players`, {
            params: {
                'filter[search]': steamId,
                'filter[game]': 'rust'
            },
            headers: this.headers,
            timeout: 15000
        });

        if (response.data.data && response.data.data.length > 0) {
            return response.data.data[0];
        }
        return null;
    }

    // Método específico: Búsqueda por Steam ID parcial
    async searchByPartialSteamId(steamId) {
        logger.debug(`Método 4: Búsqueda por Steam ID parcial`);
        
        const lastDigits = steamId.slice(-8); // Últimos 8 dígitos
        
        const response = await axios.get(`${this.baseURL}/players`, {
            params: {
                'filter[search]': lastDigits
            },
            headers: this.headers,
            timeout: 15000
        });

        if (response.data.data && response.data.data.length > 0) {
            // Buscar el jugador exacto
            for (const player of response.data.data) {
                if (player.attributes && player.attributes.name && 
                    player.attributes.name.includes(lastDigits)) {
                    return player;
                }
            }
            return response.data.data[0]; // Fallback al primero
        }
        return null;
    }

    // Obtener información completa del jugador incluyendo servidores
    async getCompletePlayerInfo(steamId) {
        try {
            // Buscar jugador usando métodos múltiples
            const player = await this.searchPlayerBySteamId(steamId);
            if (!player) {
                // Intentar métodos experimentales
                logger.debug('Probando métodos alternativos...');
                const altResult = await this.testAlternativeEndpoints(steamId);
                if (!altResult) {
                    return null;
                }
                return { experimental: true, data: altResult };
            }

            const playerId = player.id;
            logger.debug(`Obteniendo información completa del jugador: ${playerId}`);

            // Método 1: Información del jugador con sesiones incluidas
            const playerResponse = await axios.get(`${this.baseURL}/players/${playerId}`, {
                params: {
                    'include': 'server,identifier'
                },
                headers: this.headers,
                timeout: 15000
            });

            const playerData = {
                id: playerId,
                name: playerResponse.data.data.attributes.name,
                servers: [],
                totalTimePlayed: 0,
                lastSeen: playerResponse.data.data.attributes.lastSeen
            };

            // Método 2: Obtener sesiones del jugador
            try {
                const sessionsResponse = await axios.get(`${this.baseURL}/players/${playerId}/relationships/sessions`, {
                    params: {
                        'include': 'server',
                        'sort': '-start',
                        'page[size]': '100'
                    },
                    headers: this.headers,
                    timeout: 15000
                });

                if (sessionsResponse.data.data) {
                    const serverStats = this.processPlayerSessions(sessionsResponse.data);
                    playerData.servers = serverStats.servers;
                    playerData.totalTimePlayed = serverStats.totalTime;
                }
            } catch (sessionError) {
                logger.debug(`No se pudieron obtener sesiones: ${sessionError.message}`);
                
                // Método alternativo: Buscar estadísticas del jugador
                try {
                    const statsResponse = await axios.get(`${this.baseURL}/players/${playerId}/time-played`, {
                        headers: this.headers,
                        timeout: 10000
                    });
                    
                    if (statsResponse.data) {
                        playerData.totalTimePlayed = statsResponse.data.totalTime || 0;
                    }
                } catch (statsError) {
                    logger.debug(`Estadísticas no disponibles: ${statsError.message}`);
                }
            }

            // Método 3: Obtener historial de nombres
            try {
                const namesResponse = await axios.get(`${this.baseURL}/players/${playerId}/relationships/identifiers`, {
                    params: {
                        'filter[type]': 'name'
                    },
                    headers: this.headers,
                    timeout: 10000
                });

                if (namesResponse.data.data) {
                    playerData.names = namesResponse.data.data.map(identifier => ({
                        name: identifier.attributes.identifier,
                        lastSeen: identifier.attributes.lastSeen
                    }));
                }
            } catch (namesError) {
                logger.debug(`Historial de nombres no disponible: ${namesError.message}`);
                playerData.names = [];
            }

            return playerData;

        } catch (error) {
            logger.error(`Error obteniendo información del jugador para Steam ID ${steamId}:`, error);
            return null;
        }
    }

    // Procesar sesiones del jugador para extraer estadísticas por servidor
    processPlayerSessions(sessionData) {
        const serverMap = new Map();
        let totalTime = 0;

        // Procesar sesiones
        if (sessionData.data) {
            for (const session of sessionData.data) {
                const serverId = session.relationships?.server?.data?.id;
                const duration = session.attributes?.duration || 0;
                const startTime = session.attributes?.start;
                const stopTime = session.attributes?.stop;
                
                if (serverId && duration > 0) {
                    if (!serverMap.has(serverId)) {
                        serverMap.set(serverId, {
                            id: serverId,
                            name: 'Servidor Desconocido',
                            timePlayed: 0,
                            sessions: 0,
                            lastPlayed: null,
                            firstPlayed: null
                        });
                    }
                    
                    const serverData = serverMap.get(serverId);
                    serverData.timePlayed += duration;
                    serverData.sessions += 1;
                    totalTime += duration;
                    
                    // Actualizar fechas de primera y última vez jugado
                    if (!serverData.lastPlayed || (stopTime && new Date(stopTime) > new Date(serverData.lastPlayed))) {
                        serverData.lastPlayed = stopTime;
                    }
                    if (!serverData.firstPlayed || (startTime && new Date(startTime) < new Date(serverData.firstPlayed))) {
                        serverData.firstPlayed = startTime;
                    }
                }
            }
        }

        // Agregar nombres de servidores desde included
        if (sessionData.included) {
            for (const included of sessionData.included) {
                if (included.type === 'server' && serverMap.has(included.id)) {
                    const serverData = serverMap.get(included.id);
                    serverData.name = included.attributes?.name || serverData.name;
                    serverData.country = included.attributes?.country || null;
                    serverData.maxPlayers = included.attributes?.maxPlayers || null;
                    serverData.rank = included.attributes?.rank || null;
                }
            }
        }

        return {
            servers: Array.from(serverMap.values()).sort((a, b) => b.timePlayed - a.timePlayed),
            totalTime
        };
    }

    // Método experimental: Usar diferentes endpoints de Battlemetrics
    async testAlternativeEndpoints(steamId) {
        const endpoints = [
            { path: `/players/search`, params: { identifier: steamId } },
            { path: `/search`, params: { query: steamId, type: 'player' } },
            { path: `/rust/players`, params: { steam: steamId } },
            { path: `/api/players`, params: { 'filter[identifier]': steamId } },
            { path: `/players`, params: { steam_id: steamId } }
        ];

        for (const endpoint of endpoints) {
            try {
                logger.debug(`Probando endpoint: ${endpoint.path}`);
                
                const response = await axios.get(`${this.baseURL}${endpoint.path}`, {
                    params: endpoint.params,
                    headers: this.headers,
                    timeout: 5000
                });

                if (response.data && response.status === 200) {
                    logger.debug(`Endpoint funcional encontrado: ${endpoint.path}`);
                    return { endpoint: endpoint.path, data: response.data };
                }

            } catch (error) {
                logger.debug(`Endpoint ${endpoint.path} falló: ${error.message}`);
                continue;
            }
        }

        return null;
    }

    // Método mejorado: Obtener información del jugador
    async getPlayerInfo(playerId) {
        try {
            logger.debug(`Obteniendo info del jugador Battlemetrics: ${playerId}`);
            
            const response = await axios.get(`${this.baseURL}/players/${playerId}`, {
                params: {
                    'include': 'identifier,playerFlag,playerNote,server'
                },
                headers: this.headers,
                timeout: 15000
            });

            return response.data;

        } catch (error) {
            logger.error('Error obteniendo info del jugador:', error);
            return null;
        }
    }

    // Método mejorado: Obtener servidores donde ha jugado
    async getPlayerServers(playerId, limit = 10) {
        try {
            logger.debug(`Obteniendo servidores del jugador: ${playerId}`);
            
            const response = await axios.get(`${this.baseURL}/players/${playerId}/relationships/sessions`, {
                params: {
                    'include': 'server',
                    'page[size]': limit,
                    'sort': '-start'
                },
                headers: this.headers,
                timeout: 15000
            });

            return response.data;

        } catch (error) {
            logger.error('Error obteniendo servidores del jugador:', error);
            return null;
        }
    }

    // Método mejorado: Obtener estadísticas de tiempo jugado
    async getPlaytimeStats(playerId) {
        try {
            logger.debug(`Obteniendo estadísticas de tiempo: ${playerId}`);
            
            // Intentar múltiples endpoints para estadísticas
            const endpoints = [
                `/players/${playerId}/time-played`,
                `/players/${playerId}/stats`,
                `/players/${playerId}/playtime`
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(`${this.baseURL}${endpoint}`, {
                        headers: this.headers,
                        timeout: 10000
                    });

                    if (response.data) {
                        logger.debug(`Estadísticas obtenidas desde: ${endpoint}`);
                        return response.data;
                    }
                } catch (endpointError) {
                    continue;
                }
            }

            return null;

        } catch (error) {
            logger.error('Error obteniendo estadísticas de tiempo:', error);
            return null;
        }
    }

    // Obtener historial de nombres
    async getPlayerNames(playerId) {
        try {
            logger.debug(`Obteniendo historial de nombres: ${playerId}`);
            
            const response = await axios.get(`${this.baseURL}/players/${playerId}/relationships/identifiers`, {
                params: {
                    'filter[type]': 'name',
                    'sort': '-lastSeen'
                },
                headers: this.headers,
                timeout: 10000
            });

            if (response.data.data) {
                return response.data.data.map(identifier => ({
                    name: identifier.attributes.identifier,
                    lastSeen: identifier.attributes.lastSeen,
                    firstSeen: identifier.attributes.metadata?.firstSeen
                }));
            }

            return [];

        } catch (error) {
            logger.error('Error obteniendo historial de nombres:', error);
            return [];
        }
    }

    // Formatear tiempo de juego
    formatPlaytime(seconds) {
        if (!seconds) return '0 minutos';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} minutos`;
    }

    // Formatear fecha
    formatDate(dateString) {
        if (!dateString) return 'Desconocida';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

module.exports = BattlemetricsAPI;

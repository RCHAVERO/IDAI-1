const axios = require('axios');

class SteamAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'http://api.steampowered.com';
    }

    // Convertir diferentes formatos de Steam ID a Steam ID64
    async resolveSteamId(input) {
        // Si ya es un Steam ID64
        if (/^\d{17}$/.test(input)) {
            return input;
        }

        // Si es una URL de perfil
        if (input.includes('steamcommunity.com')) {
            // URL directa con Steam ID64
            const profileMatch = input.match(/\/profiles\/(\d+)/);
            if (profileMatch) {
                return profileMatch[1];
            }

            // URL personalizada
            const customMatch = input.match(/\/id\/([^/]+)/);
            if (customMatch) {
                const vanityUrl = customMatch[1];
                try {
                    const response = await axios.get(`${this.baseURL}/ISteamUser/ResolveVanityURL/v0001/`, {
                        params: {
                            key: this.apiKey,
                            vanityurl: vanityUrl,
                            url_type: 1
                        }
                    });

                    if (response.data.response.success === 1) {
                        return response.data.response.steamid;
                    }
                } catch (error) {
                    throw new Error('Error resolviendo URL personalizada');
                }
            }
        }

        // Si es solo un nombre personalizado
        try {
            const response = await axios.get(`${this.baseURL}/ISteamUser/ResolveVanityURL/v0001/`, {
                params: {
                    key: this.apiKey,
                    vanityurl: input,
                    url_type: 1
                }
            });

            if (response.data.response.success === 1) {
                return response.data.response.steamid;
            }
        } catch (error) {
            // Continúa con otros métodos
        }

        return null;
    }

    // Obtener información básica del jugador
    async getPlayerSummary(steamId) {
        try {
            const response = await axios.get(`${this.baseURL}/ISteamUser/GetPlayerSummaries/v0002/`, {
                params: {
                    key: this.apiKey,
                    steamids: steamId
                }
            });

            const players = response.data.response.players;
            return players.length > 0 ? players[0] : null;

        } catch (error) {
            throw new Error('Error obteniendo información del jugador');
        }
    }

    // Obtener información de baneos VAC y de juego
    async getPlayerBans(steamId) {
        try {
            const response = await axios.get(`${this.baseURL}/ISteamUser/GetPlayerBans/v1/`, {
                params: {
                    key: this.apiKey,
                    steamids: steamId
                }
            });

            const bans = response.data.players;
            return bans.length > 0 ? bans[0] : null;

        } catch (error) {
            throw new Error('Error obteniendo información de baneos');
        }
    }

    // Obtener juegos que posee el jugador
    async getOwnedGames(steamId) {
        try {
            const response = await axios.get(`${this.baseURL}/IPlayerService/GetOwnedGames/v0001/`, {
                params: {
                    key: this.apiKey,
                    steamid: steamId,
                    include_appinfo: true,
                    include_played_free_games: true
                }
            });

            return response.data.response.games || [];

        } catch (error) {
            throw new Error('Error obteniendo lista de juegos');
        }
    }

    // Obtener estadísticas de un juego específico
    async getGameStats(steamId, appId) {
        try {
            const response = await axios.get(`${this.baseURL}/ISteamUserStats/GetUserStatsForGame/v0002/`, {
                params: {
                    key: this.apiKey,
                    steamid: steamId,
                    appid: appId
                }
            });

            return response.data.playerstats;

        } catch (error) {
            return null; // Las estadísticas pueden estar privadas
        }
    }

    // Obtener logros de un juego específico
    async getPlayerAchievements(steamId, appId) {
        try {
            const response = await axios.get(`${this.baseURL}/ISteamUserStats/GetPlayerAchievements/v0001/`, {
                params: {
                    key: this.apiKey,
                    steamid: steamId,
                    appid: appId
                }
            });

            return response.data.playerstats;

        } catch (error) {
            return null; // Los logros pueden estar privados
        }
    }

    // Obtener lista de amigos
    async getFriendList(steamId) {
        try {
            const response = await axios.get(`${this.baseURL}/ISteamUser/GetFriendList/v0001/`, {
                params: {
                    key: this.apiKey,
                    steamid: steamId,
                    relationship: 'friend'
                }
            });

            return response.data.friendslist.friends || [];

        } catch (error) {
            return []; // Lista de amigos puede estar privada
        }
    }

    // Obtener juegos jugados recientemente
    async getRecentlyPlayedGames(steamId) {
        try {
            const response = await axios.get(`${this.baseURL}/IPlayerService/GetRecentlyPlayedGames/v0001/`, {
                params: {
                    key: this.apiKey,
                    steamid: steamId,
                    count: 10
                }
            });

            return response.data.response.games || [];

        } catch (error) {
            return [];
        }
    }

    // Formatear información de baneos
    formatBanInfo(banData) {
        if (!banData) return null;

        const info = {
            hasVacBan: banData.VACBanned,
            vacBanCount: banData.NumberOfVACBans,
            daysSinceLastBan: banData.DaysSinceLastBan,
            hasGameBan: banData.NumberOfGameBans > 0,
            gameBanCount: banData.NumberOfGameBans,
            economyBan: banData.EconomyBan,
            communityBanned: banData.CommunityBanned
        };

        return info;
    }

    // Calcular hace cuánto fue el último baneo
    getTimeSinceLastBan(daysSinceLastBan) {
        if (!daysSinceLastBan || daysSinceLastBan === 0) {
            return 'Hoy';
        }

        if (daysSinceLastBan === 1) {
            return 'Ayer';
        }

        if (daysSinceLastBan < 30) {
            return `${daysSinceLastBan} días`;
        }

        if (daysSinceLastBan < 365) {
            const months = Math.floor(daysSinceLastBan / 30);
            return months === 1 ? '1 mes' : `${months} meses`;
        }

        const years = Math.floor(daysSinceLastBan / 365);
        const remainingMonths = Math.floor((daysSinceLastBan % 365) / 30);
        
        let timeString = years === 1 ? '1 año' : `${years} años`;
        if (remainingMonths > 0) {
            timeString += remainingMonths === 1 ? ' y 1 mes' : ` y ${remainingMonths} meses`;
        }

        return timeString;
    }

    // Obtener información completa del jugador incluyendo baneos
    async getCompletePlayerInfo(steamId) {
        try {
            const [profile, bans, games] = await Promise.all([
                this.getPlayerSummary(steamId),
                this.getPlayerBans(steamId),
                this.getOwnedGames(steamId)
            ]);

            return {
                profile,
                bans: this.formatBanInfo(bans),
                games,
                rawBanData: bans
            };

        } catch (error) {
            throw new Error(`Error obteniendo información completa: ${error.message}`);
        }
    }
}

module.exports = SteamAPI;

const { EmbedBuilder } = require('discord.js');

class EmbedUtils {
    static createAdvancedRustEmbed(profile, rustData, battlemetricsData) {
        const hoursPlayed = Math.round(rustData.playtime_forever / 60 * 10) / 10;
        const recentHours = rustData.playtime_2weeks ? Math.round(rustData.playtime_2weeks / 60 * 10) / 10 : 0;

        const embed = new EmbedBuilder()
            .setTitle(`🦀 Perfil Completo de Rust - ${profile.personaname}`)
            .setThumbnail(profile.avatarfull)
            .setColor(0xCD412B)
            .addFields(
                { name: '🎮 Nombre', value: profile.personaname, inline: true },
                { name: '🆔 Steam ID', value: profile.steamid, inline: true },
                { name: '🌐 Estado', value: this.getPlayerStatus(profile.personastate), inline: true },
                { name: '⏰ Horas totales', value: `${hoursPlayed}h`, inline: true },
                { name: '📅 Últimas 2 semanas', value: `${recentHours}h`, inline: true },
                { name: '🏆 Experiencia', value: this.getExperienceLevel(hoursPlayed), inline: true }
            );

        // Información de Battlemetrics mejorada con soporte para múltiples fuentes
        if (battlemetricsData) {
            if (battlemetricsData.estimated) {
                // Datos estimados
                embed.addFields({
                    name: '📊 Análisis Estimado de Servidores',
                    value: '```yaml\n' +
                           'Fuente: Estimación basada en horas totales\n' +
                           'Método: Distribución en servidores populares\n' +
                           'Precisión: Aproximada\n' +
                           '```',
                    inline: false
                });

                if (battlemetricsData.servers && battlemetricsData.servers.length > 0) {
                    const serverList = battlemetricsData.servers
                        .map(server => `• **${server.name}**: ${server.displayTime}`)
                        .join('\n');

                    embed.addFields({
                        name: '🎯 Distribución Estimada por Servidores',
                        value: serverList,
                        inline: false
                    });
                }

                embed.addFields({
                    name: '💡 Nota Importante',
                    value: 'Estos datos son estimaciones basadas en servidores populares de Rust. Para datos precisos, el jugador debe tener un perfil público en Battlemetrics.',
                    inline: false
                });

            } else if (battlemetricsData.experimental) {
                // Datos experimentales
                embed.addFields({
                    name: '🔬 Datos Experimentales de Battlemetrics',
                    value: '```yaml\n' +
                           'Estado: Datos parciales obtenidos\n' +
                           'Método: Endpoint alternativo\n' +
                           'Info: Algunos datos pueden estar limitados\n' +
                           '```',
                    inline: false
                });

            } else if (battlemetricsData.found) {
                // Datos obtenidos via scraping o API
                embed.addFields({
                    name: '🎮 Información de Battlemetrics',
                    value: '```yaml\n' +
                           `Jugador: ${battlemetricsData.name || 'Desconocido'}\n` +
                           `ID Battlemetrics: ${battlemetricsData.battlemetricsId || 'N/A'}\n` +
                           `Servidores registrados: ${battlemetricsData.servers?.length || 0}\n` +
                           '```',
                    inline: false
                });

                // Mostrar servidores donde ha jugado
                if (battlemetricsData.servers && battlemetricsData.servers.length > 0) {
                    const serverList = battlemetricsData.servers
                        .slice(0, 8)
                        .map(server => {
                            const timeStr = server.displayTime || 
                                          (server.timePlayed ? this.formatPlaytime(server.timePlayed) : 'N/A');
                            
                            // Detectar servidores populares para agregar emojis
                            const serverName = server.name;
                            let displayName = serverName;
                            
                            if (serverName.toLowerCase().includes('ukn')) displayName = '🔥 UKN';
                            else if (serverName.toLowerCase().includes('vital')) displayName = '⚡ Vital';
                            else if (serverName.toLowerCase().includes('moose')) displayName = '🦌 Moose';
                            else if (serverName.toLowerCase().includes('rustopia')) displayName = '🏰 Rustopia';
                            else if (serverName.toLowerCase().includes('facepunch')) displayName = '🎯 Facepunch';
                            else if (serverName.toLowerCase().includes('reddit')) displayName = '📱 Reddit';
                            else if (serverName.toLowerCase().includes('rustafied')) displayName = '🏭 Rustafied';
                            else if (serverName.toLowerCase().includes('stevious')) displayName = '🌟 Stevious';
                            else if (serverName.length > 25) displayName = serverName.substring(0, 22) + '...';
                            
                            return `• **${displayName}**: ${timeStr}`;
                        })
                        .join('\n');

                    embed.addFields({
                        name: '🏗️ Servidores Jugados (Ordenados por tiempo)',
                        value: serverList,
                        inline: false
                    });

                    // Mostrar tiempo total si está disponible
                    if (battlemetricsData.totalTime > 0) {
                        const totalHours = Math.floor(battlemetricsData.totalTime / 3600);
                        const totalDays = Math.floor(totalHours / 24);
                        
                        let timeDisplay = totalDays > 0 ? 
                            `${totalDays} días, ${totalHours % 24} horas` : 
                            `${totalHours} horas`;

                        embed.addFields({
                            name: '⏱️ Tiempo Total Registrado',
                            value: `\`${timeDisplay}\``,
                            inline: true
                        });
                    }

                    // Servidor favorito
                    const favoriteServer = battlemetricsData.servers[0];
                    if (favoriteServer) {
                        embed.addFields({
                            name: '💎 Servidor Más Jugado',
                            value: `**${favoriteServer.name}**\n${favoriteServer.displayTime}`,
                            inline: true
                        });
                    }
                }

                // Link a Battlemetrics si tenemos ID
                if (battlemetricsData.battlemetricsId) {
                    embed.addFields({ 
                        name: '🔗 Battlemetrics', 
                        value: `[Ver perfil completo](https://www.battlemetrics.com/players/${battlemetricsData.battlemetricsId})`, 
                        inline: true 
                    });
                }
            }
        } else {
            // Si no hay datos de Battlemetrics, mostrar mensaje explicativo
            embed.addFields({
                name: '⚠️ Información de Battlemetrics',
                value: '❌ **No se encontraron datos en Battlemetrics**\n\n' +
                       '**Posibles razones:**\n' +
                       '• Nunca jugó en servidores monitoreados\n' +
                       '• Solo jugó en servidores oficiales\n' +
                       '• Perfil no sincronizado\n' +
                       '• Restricciones de API\n\n' +
                       '💡 **Nota:** La información de Steam sigue siendo precisa.',
                inline: false
            });
        }

        // Información adicional de Steam
        if (profile.timecreated) {
            const accountCreated = new Date(profile.timecreated * 1000);
            embed.addFields({ name: '📅 Cuenta creada', value: accountCreated.toLocaleDateString('es-ES'), inline: true });
        }

        if (profile.lastlogoff) {
            const lastSeen = new Date(profile.lastlogoff * 1000);
            embed.addFields({ name: '🕐 Última vez visto', value: lastSeen.toLocaleDateString('es-ES'), inline: true });
        }

        embed.setFooter({ text: 'Rust Profile Verifier • Steam + Battlemetrics • Información detallada' })
            .setTimestamp();

        return embed;
    }

    static createErrorEmbed(message, title = 'Error') {
        return new EmbedBuilder()
            .setTitle(`❌ ${title}`)
            .setDescription(message)
            .setColor(0xFF0000)
            .setTimestamp();
    }

    static createInfoEmbed(message, title = 'Información') {
        return new EmbedBuilder()
            .setTitle(`ℹ️ ${title}`)
            .setDescription(message)
            .setColor(0x00FF00)
            .setTimestamp();
    }

    static getPlayerStatus(state) {
        switch (state) {
            case 0: return '⚫ Desconectado';
            case 1: return '🟢 En línea';
            case 2: return '🔵 Ocupado';
            case 3: return '🟡 Ausente';
            case 4: return '😴 Dormido';
            case 5: return '👀 Buscando intercambiar';
            case 6: return '👥 Buscando jugar';
            default: return '❓ Desconocido';
        }
    }

    static getExperienceLevel(hours) {
        if (hours < 50) return '🌱 Novato';
        if (hours < 200) return '🎯 Principiante';
        if (hours < 500) return '⚔️ Intermedio';
        if (hours < 1000) return '🏆 Avanzado';
        if (hours < 2000) return '👑 Experto';
        if (hours < 5000) return '🔥 Maestro';
        return '💎 Leyenda';
    }

    static formatPlaytime(seconds) {
        if (!seconds) return '0 min';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} min`;
    }

    static formatDate(dateString) {
        if (!dateString) return 'Desconocida';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

module.exports = EmbedUtils;

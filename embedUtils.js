const { EmbedBuilder } = require('discord.js');

class EmbedUtils {
    static createAdvancedRustEmbed(profile, rustData, battlemetricsData, banInfo = null) {
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

        // Información de baneos VAC y de juego
        if (banInfo) {
            this.addBanInformation(embed, banInfo);
        }

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

    // Agregar información de baneos al embed
    static addBanInformation(embed, banInfo) {
        if (!banInfo) return;

        // Determinar el color del embed basado en baneos
        if (banInfo.hasVacBan || banInfo.hasGameBan) {
            embed.setColor(0xFF4444); // Rojo para jugadores baneados
        }

        // Información de baneos VAC
        if (banInfo.hasVacBan) {
            const timeSinceBan = this.getTimeSinceLastBan(banInfo.daysSinceLastBan);
            const banText = banInfo.vacBanCount === 1 ? 
                `🚫 **1 BANEO VAC**\n⏰ Hace: ${timeSinceBan}` :
                `🚫 **${banInfo.vacBanCount} BANEOS VAC**\n⏰ Último: Hace ${timeSinceBan}`;

            embed.addFields({
                name: '⚠️ ESTADO DE BANEOS VAC',
                value: banText,
                inline: true
            });
        } else {
            embed.addFields({
                name: '✅ ESTADO VAC',
                value: '🟢 **SIN BANEOS VAC**\nCuenta limpia',
                inline: true
            });
        }

        // Información de baneos de juego
        if (banInfo.hasGameBan) {
            const timeSinceBan = this.getTimeSinceLastBan(banInfo.daysSinceLastBan);
            const banText = banInfo.gameBanCount === 1 ? 
                `🎮 **1 BANEO DE JUEGO**\n⏰ Hace: ${timeSinceBan}` :
                `🎮 **${banInfo.gameBanCount} BANEOS DE JUEGO**\n⏰ Último: Hace ${timeSinceBan}`;

            embed.addFields({
                name: '🎯 BANEOS DE JUEGO',
                value: banText,
                inline: true
            });
        } else {
            embed.addFields({
                name: '✅ ESTADO DE JUEGO',
                value: '🟢 **SIN BANEOS**\nCuenta limpia',
                inline: true
            });
        }

        // Información de baneo económico/mercado
        if (banInfo.economyBan && banInfo.economyBan !== 'none') {
            embed.addFields({
                name: '💰 ESTADO ECONÓMICO',
                value: `🔒 **BANEO ECONÓMICO**\nTipo: ${banInfo.economyBan}`,
                inline: true
            });
        }

        // Información de baneo de comunidad
        if (banInfo.communityBanned) {
            embed.addFields({
                name: '👥 ESTADO COMUNIDAD',
                value: '🔇 **BANEADO DE COMUNIDAD**\nNo puede usar funciones sociales',
                inline: true
            });
        }

        // Resumen de confiabilidad
        const trustLevel = this.calculateTrustLevel(banInfo);
        embed.addFields({
            name: '🛡️ NIVEL DE CONFIANZA',
            value: trustLevel,
            inline: false
        });
    }

    // Calcular tiempo desde último baneo
    static getTimeSinceLastBan(daysSinceLastBan) {
        if (!daysSinceLastBan || daysSinceLastBan === 0) {
            return 'hoy';
        }

        if (daysSinceLastBan === 1) {
            return '1 día';
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

    // Calcular nivel de confianza basado en baneos
    static calculateTrustLevel(banInfo) {
        if (!banInfo.hasVacBan && !banInfo.hasGameBan && !banInfo.communityBanned && banInfo.economyBan === 'none') {
            return '🟢 **ALTA CONFIANZA**\n✅ Sin baneos registrados\n✅ Cuenta limpia';
        }

        if (banInfo.hasVacBan || banInfo.hasGameBan) {
            const daysSince = banInfo.daysSinceLastBan;
            
            if (daysSince < 30) {
                return '🔴 **RIESGO ALTO**\n⚠️ Baneos recientes\n❌ Cuenta no confiable';
            } else if (daysSince < 365) {
                return '🟡 **RIESGO MEDIO**\n⚠️ Baneos en el último año\n⚠️ Precaución recomendada';
            } else {
                return '🟠 **RIESGO BAJO**\n⚠️ Baneos antiguos\n⚠️ Historial mejorado';
            }
        }

        if (banInfo.communityBanned || banInfo.economyBan !== 'none') {
            return '🟡 **CONFIANZA LIMITADA**\n⚠️ Restricciones menores\n⚠️ Sin baneos de anti-cheat';
        }

        return '🟢 **CONFIANZA NORMAL**\n✅ Sin problemas mayores';
    }
}

module.exports = EmbedUtils;

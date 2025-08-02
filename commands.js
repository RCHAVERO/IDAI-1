const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('check')
        .setDescription('Verificar perfil completo de Rust (Steam + Battlemetrics)')
        .addStringOption(option =>
            option.setName('steamid')
                .setDescription('Steam ID64, URL del perfil de Steam o nombre personalizado')
                .setRequired(true))
].map(command => command.toJSON());

async function deployCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Registrando comandos slash...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('✅ Comandos registrados exitosamente!');
    } catch (error) {
        console.error('❌ Error registrando comandos:', error);
    }
}

module.exports = { deployCommands };

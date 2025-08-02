require('dotenv').config();
const { REST, Routes } = require('discord.js');

async function clearAndSetCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🧹 Limpiando comandos antiguos...');
        
        // Limpiar comandos globales
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] },
        );
        
        console.log('⏳ Esperando 5 segundos...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('🔄 Registrando solo comando /check...');
        
        // Registrar solo el comando check
        const { SlashCommandBuilder } = require('discord.js');
        const commands = [
            new SlashCommandBuilder()
                .setName('check')
                .setDescription('Verificar perfil completo de Rust (Steam + Battlemetrics)')
                .addStringOption(option =>
                    option.setName('steamid')
                        .setDescription('Steam ID64, URL del perfil de Steam o nombre personalizado')
                        .setRequired(true))
        ].map(command => command.toJSON());

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('✅ Solo comando /check registrado exitosamente!');
        console.log('💡 Los comandos antiguos deberían desaparecer en unos minutos.');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

clearAndSetCommands();

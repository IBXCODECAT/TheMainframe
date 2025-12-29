require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`[SYSTEM] Syncing ${commands.length} slash commands...`);
        
        // Routes.applicationCommands(CLIENT_ID) makes it GLOBAL
        // Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) makes it SERVER-SPECIFIC
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('[SUCCESS] Commands registered globally.');
    } catch (error) {
        console.error(error);
    }
})();

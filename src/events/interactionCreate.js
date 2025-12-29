const { Events, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        // Ensure the commands collection exists on the client - THIS CODE SHOULD ONLY RUN ONCE PER SESSION
        if (!client.commands) {
            client.commands = new Collection();

            const commandsPath = path.join(__dirname, '../commands'); 
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                // Set the command in the collection
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                }
            }
        }

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
            return;
        }

        const authServers = command.authorizedServers || []; 

        if (authServers.length > 0 && !authServers.includes(interaction.guildId)) {
            return interaction.reply({ 
                content: "[RESTRICED] This sub-routine is not authorized for this server ID.", 
                ephemeral: true 
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`[CRITICAL] Error executing ${interaction.commandName}:`, error);
            await interaction.reply({ content: '[SYSTEM ERROR] Execution failed.', ephemeral: true });
        }
    },
};

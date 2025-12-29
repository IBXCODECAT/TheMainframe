require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { Client, GatewayIntentBits, Partials, Events } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,                    // Basic Guild Access
    GatewayIntentBits.GuildMembers,              // [Priviledged] For Welcome DMs
    GatewayIntentBits.GuildMessages,             // For counting/story messages
    GatewayIntentBits.MessageContent,            // [Priviledged] to read messages for chat games
    GatewayIntentBits.DirectMessages,            // For DM Forwarding
    GatewayIntentBits.GuildVoiceStates,          // For "join-to-create" voice channels
  ],
  partials: [Partials.Channel, Partials.Message] // Critical for DMs
});

const AUTHORIZED_ID = process.env.AUTHORIZED_GUILD_ID;

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    // Log each event as it is loaded
    console.log(`[MODULE LOADED] Event: ${event.name} | Source: ${file}`);

    // If the event is meant to run only once (ex; ready)
    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);

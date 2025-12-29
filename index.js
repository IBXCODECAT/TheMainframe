require('dotenv').config()

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

// --- SECURITY LOGIC: AUTO-LEAVE ---

client.on(Events.GuildCreate, async (guild) => {
    if (guild.id !== AUTHORIZED_ID) {
        console.log(`[SECURITY] Unauthorized join attempt: ${guild.name} (${guild.id}). Leaving...`);
        await guild.leave();
    }
});

// --- INITIALIZATION ---

client.once(Events.ClientReady, async (c) => {
    console.log(`[SYSTEM ONLINE] Mainframe Unit ${c.user.tag} operational.`);

    // Startup Sweep: Ensure we aren't in unauthorized guilds from downtime
    client.guilds.cache.forEach(async (guild) => {
        if (guild.id !== AUTHORIZED_ID) {
            console.log(`[CLEANUP] Leaving unauthorized guild: ${guild.name}`);
            await guild.leave();
        }
    });
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);

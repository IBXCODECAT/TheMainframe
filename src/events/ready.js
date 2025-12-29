const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[SYSTEM ONLINE] Mainframe ${client.user.tag} verified and active.`);
        
    // Auto-leave unauthorized guilds on startup
    const authId = process.env.AUTHORIZED_GUILD_ID;
    client.guilds.cache.forEach(async (guild) => {
        if (guild.id !== authId) {
            console.log(`[SECURITY] Purging unauthorized guild: ${guild.name}`);
            await guild.leave();
        }
    });
  }
}

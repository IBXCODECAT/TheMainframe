const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    const authorizedId = process.env.AUTHORIZED_GUILD_ID;

    if(guild.id !== authorizedId) {
      console.log("Leaving unauthorized GUILD");
      await guild.leave();
    }
  }
}

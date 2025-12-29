const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Leave this empty for global, or add server ID's to restrict access
  authorizedGuilds: [],

  data: new SlashCommandBuilder()
    .setName('diagnostics')
    .setDescription('Checks the Mainframe uplink latency and system status.'),

  async execute(interaction) {
    const ping = interaction.client.ws.ping;
    await interaction.reply({
      content: `**[SYSTEM DIAGNOSTICS]**\n> **Uplink Latency:** ${ping}ms\n> **Status:** Operational\n> **Security:** 1 Authorized Server`,
      ephemeral: true // Only the user who typed it sees this
    })
  }
}

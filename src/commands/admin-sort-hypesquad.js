require('dotenv').config;
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder , UserFlags } = require('discord.js');

module.exports = {
  authorizedServers: [process.env.AUTHORIZED_GUILD_ID],
  data: new SlashCommandBuilder()
    .setName('admin-sort-hypesquad')
    .setDescription('Identifies all server members who are part of HypeSquad Online and assigns the Hypesquad Games role.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageEvents)
    .addRoleOption(option => option.setName('bravery-role').setDescription('Role for House of Bravery').setRequired(true))
    .addRoleOption(option => option.setName('brilliance-role').setDescription('Role for House of Brilliance').setRequired(true))
    .addRoleOption(option => option.setName('balance-role').setDescription('Role for House of Balance').setRequired(true)),

  async execute(interaction) {

    // Defer the interaction because fetching server members and rate limits take time
    await interaction.deferReply();

    const roles = {
      Bravery: interaction.options.getRole('bravery-role'),
      Brilliance: interaction.options.getRole('brilliance-role'),
      Balance: interaction.options.getRole('balance-role')
    };

    const houseFlags = [
      { flag: UserFlags.HypeSquadOnlineHouse1, key: 'Bravery' },
      { flag: UserFlags.HypeSquadOnlineHouse2, key: 'Brilliance' },
      { flag: UserFlags.HypeSquadOnlineHouse3, key: 'Balance' }
    ];

    // --- SECURITY CHECK: ZERO PERMISSIONS ---
    for (const role of Object.values(roles)) {
      if (role.permissions.bitfield !== 0n) {
        return interaction.editReply({
          content: `**[CRITICAL SECURITY ERROR]**\n> Role \`${role.name}\` possesses active permissions. The Mainframe requires Zero-Access roles.`
        });
      }
    }
    
    const members = await interaction.guild.members.fetch();

    let counts = { Bravery: 0, Brilliance: 0, Balance: 0, Total: 0 };

    for (const [id, member] of members) {
      // Check flags against the bitwise UserFlags
      const houseMatch = houseFlags.find(h => member.user.flags.has(h.flag));

      if (houseMatch) {
          const targetRole = roles[houseMatch.key];
        
          // Only add if they don't have it to save on API calls
          if (!member.roles.cache.has(targetRole.id)) {
            try {
              await member.roles.add(targetRole.id);
              counts[houseMatch.key]++;
              counts.Total++;
            } catch (err) {
              console.error(`[UPLINK ERROR] Failed to sort ${member.user.tag}:`, err.message);
            }
          }
        }
      }

      const embed = new EmbedBuilder()
          .setTitle('📡 [MAINFRAME BITWISE SORTING COMPLETE]')
          .setColor(0x2b2d31)
          .setDescription('System has analyzed member bitfields and assigned legacy house protocols.')
          .addFields(
              { name: '🔴 Bravery', value: `${counts.Bravery} units`, inline: true },
              { name: '🔵 Brilliance', value: `${counts.Brilliance} units`, inline: true },
              { name: '🟢 Balance', value: `${counts.Balance} units`, inline: true }
          )
          .setFooter({ text: 'Mainframe | Legacy Signature Detection Active' });
    
    await interaction.editReply({ embeds: [embed] });
  } 
}

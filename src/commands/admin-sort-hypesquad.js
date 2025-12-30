require('dotenv').config;
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder , UserFlags } = require('discord.js');

module.exports = {
  authorizedServers: [process.env.AUTHORIZED_GUILD_ID],
  data: new SlashCommandBuilder()
    .setName('admin-sort-hypesquad')
    .setDescription('Identifies all server members who are part of HypeSquad Online and assigns the Hypesquad Games role.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageEvents)
    .addRoleOption(option =>
      option.setName('target-role')
        .setDescription('The role to assign (Must have zero permissions for security)')
        .setRequired(true)
    ),

  async execute(interaction) {

    // Defer the interaction because fetching server members and rate limits take time
    await interaction.deferReply();

    const targetRole = interaction.options.getRole('target-role');

    // --- SAFETY CHECK: Permission Bitfield ---
    // Permissions.bitfield returns 0n if the role has "None" (grayed out) permissions.
    if (targetRole.permissions.bitfield !== 0n) {
        return interaction.editReply({
            content: `**[CRITICAL SECURITY ERROR]**\n> Selected role \`${targetRole.name}\` has active permissions. The Mainframe will not assign roles that grant server access. Please use a "cosmetic-only" role.`
        });
    }

    const members = await interaction.guild.members.fetch();
    let sortedCount = 0;

    const houseFlags = [
      UserFlags.HypeSquadOnlineHouse1, // Bravery
      UserFlags.HypeSquadOnlineHouse2, // Brilliance
      UserFlags.HypeSquadOnlineHouse3  // Balance
    ];

    for (const [id, member] of members) {
        const hasHouse = houseFlags.some(flag => member.user.flags.has(flag));
        
        if (hasHouse && !member.roles.cache.has(targetRole.id)) {
            try {
                await member.roles.add(targetRole);
                sortedCount++;
            } catch (err) {
                console.error(`[ERROR] Failed to assign role to ${member.user.tag}:`, err.message);
            }
        }
    }

    const embed = new EmbedBuilder()
        .setTitle('[HYPESQUAD SYNCHRONIZATION]')
        .setColor(targetRole.color || 0x5865F2)
        .setDescription(`Analysis complete. **${sortedCount}** HypeSquad units have been granted the <@&${targetRole.id}> protocol.`)
        .addFields({ name: 'Security Check', value: '✅ Role permissions verified as Zero-Access.' })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } 
}

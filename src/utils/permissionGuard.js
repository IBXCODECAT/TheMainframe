const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

/**
 * Validates permissions using a combined bitfield and reports diagnostics.
 * @param {Object} context - Message or Interaction.
 * @param {bigint} requiredBitfield - The combined PermissionFlagsBits (e.g., P1 | P2).
 * @returns {boolean}
 */
async function permissionGuard(context, requiredBitfield) {
    const channel = context.channel;
    const botMember = context.guild.members.me;

    if (!channel || !botMember) return false;

    const currentPerms = channel.permissionsFor(botMember);
    const currentBitfield = currentPerms.bitfield;

    // Bitwise check: Does currentBitfield contain ALL bits from requiredBitfield?
    // Formula: (current & required) === required
    const hasAll = (currentBitfield & requiredBitfield) === requiredBitfield;

    if (!hasAll) {
        // Log the error to the VPS console
        console.error(`[MAINFRAME_AUTH_FAILURE] Channel: ${channel.id} | Required: ${requiredBitfield} | Current: ${currentBitfield}`);

        // Check if we have BOTH SendMessages AND EmbedLinks
        const canEmbed = currentPerms.has(PermissionFlagsBits.EmbedLinks);
        
        // Check if we have AT LEAST SendMessages
        const canText = currentPerms.has(PermissionFlagsBits.SendMessages);

        // If we have permission to talk, explain the failure
        if (canText && canEmbed) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("🚨 [DISCORD_PERMISSION_DENIED]")
                .setDescription("The Mainframe requires specific permission bits to execute this protocol.")
                .addFields(
                    { name: "Required Permission Bits", value: `\`${requiredBitfield.toString()}\``, inline: true },
                    { name: "Current Permission Bits", value: `\`${currentBitfield.toString()}\``, inline: true }
                )
                .setColor(0xff0000)
                .setFooter({ text: "If required, contact <@611649234848186388> for assistance." });

            await channel.send({ embeds: [errorEmbed] }).catch(() => {});
        } 
        else if (canText) {
            // FALLBACK: Send as plain text if Embeds are blocked
            await channel.send(
                `🚨 **[DISCORD_PERMISSION_DENIED]**\n` +
                `The Mainframe requires more power. Required permission bits: \`${requiredBitfield}\` | Current permission bits: \`${currentBitfield}\`\n` +
                `Contact <@611649234848186388> for assistance.`
            ).catch(() => {});
        }

        return false;
    }

    return true;
}

module.exports = { permissionGuard };

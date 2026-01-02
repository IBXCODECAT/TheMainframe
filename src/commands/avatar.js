const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Retrieve the biometric visual of a specific unit.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The unit to scan')
        .setRequired(false)),

  async execute(interaction) {
        // 1. Identify the target (default to the person running the command)
        const user = interaction.options.getUser('target') || interaction.user;
        
        // 2. Fetch the highest resolution image
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        // 3. Construct the Mainframe UI
        const embed = new EmbedBuilder()
            .setTitle(`👤 [DATA_SCAN]: ${user.tag}`)
            .setDescription(`**UID:** \`${user.id}\`\n**Status:** Uplink Established`)
            .setImage(avatarURL)
            .setColor(0x2b2d31) // Sleek dark theme
            .setFooter({ text: "Source: Mainframe Biometric Database" })
            .setTimestamp();

        // 4. Send the scan result
        await interaction.reply({ embeds: [embed] });
    },
}

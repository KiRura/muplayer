/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function inGuild (interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({ content: 'サーバー内でのみ実行できます！', ephemeral: true })
    return false
  }
  return true
}

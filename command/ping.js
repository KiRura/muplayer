import { SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong!'),
  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    await interaction.reply('pong! エラーを生成したよ！')
  }
}

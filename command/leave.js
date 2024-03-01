import { useMainPlayer } from 'discord-player'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { inGuild } from '../config/in-guild.js'
import data from '../data.js'
import { Logger } from 'tslog'

const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('キューを削除してVCから退出'),
  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    if (!await inGuild(interaction)) return

    const player = useMainPlayer()
    if (!player.queues.has(interaction.guildId)) {
      logger.debug('キューが見当たらない')
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('キューが見当たりませんでした')
            .setDescription(
              '以下の原因が考えられます\n' +
              '- キューに曲が追加されていない(接続中でない)\n' +
              '- 再生中にBOTが再起動した\n' +
              '- discord-playerのよく分からないバグ'
            )
            .setColor(data.redColor)
        ]
      })
    }

    const res = player.queues.delete(interaction.guildId)
    if (!res) {
      await interaction.reply({ content: 'よく分かんないけどキューの削除に失敗しました。', ephemeral: true })
      logger.debug('キューの削除に失敗したサーバーがあります。')
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('またね！')
          .setColor(data.mutaoColor)
      ]
    })
  }
}

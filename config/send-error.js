import { EmbedBuilder } from 'discord.js'
import { Logger } from 'tslog'

const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  /**
   *
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async sendError (event, client, interaction, error) {
    const embed = new EmbedBuilder()
    if (!error.name || !error.message) {
      embed
        .setTitle('Errorじゃないっぽいエラー・例外')
        .setDescription(String(error))
    } else {
      embed
        .setTitle(error.name)
        .setDescription(error.message + error.stack ? '```\n' + error.stack + '\n```' : '')
    }

    if (interaction) {
      if (interaction.user.id === '606093171151208448') return

      try {
        await interaction.user.send({
          content: '開発者に以下のエラーメッセージを送信しました。',
          embeds: [embed]
        })
      } catch (error) {
        logger.debug('エラーメッセージを実行者に送信できませんでした。')
      }
    }

    const user = await client.users.fetch('606093171151208448')
    await user.send({ embeds: [embed] })

    logger.error('エラー:', event.name)
    console.error(error)
  }
}

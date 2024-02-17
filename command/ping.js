import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import data from '../data.js'
import { Logger } from 'tslog'

const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong!'),
  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    const wsping = interaction.client.ws.ping

    const embed = new EmbedBuilder()
    await interaction.reply({
      embeds: [
        embed
          .setTitle('Pong!')
          .setFields(
            {
              name: 'WebSocket',
              value: wsping === -1 ? 'None' : `${wsping} ms`,
              inline: true
            },
            {
              name: 'API Endpoint',
              value: 'waiting...',
              inline: true
            }
          )
          .setColor(data.mutaoColor)
      ]
    })

    try {
      const reply = await interaction.fetchReply()
      embed.data.fields[1].value = `${reply.createdTimestamp - interaction.createdTimestamp} ms`
      await reply.edit({ embeds: [embed] })
    } catch (error) {
      logger.debug('/pingでapi endpointの編集ができませんでした')
    }
  }
}

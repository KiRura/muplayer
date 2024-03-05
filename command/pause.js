/* eslint-disable no-unused-vars */
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import functions from '../functions.js'
import data from '../data.js'
import { useQueue } from 'discord-player'

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('一時停止'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    if (!functions.isGuild(interaction)) return
    const queue = useQueue(interaction.guild.id)
    if (!functions.isCorrectQueue(queue, interaction)) return

    if (queue.node.isPaused()) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('既に一時停止中です。')
          .setDescription('一時停止の解除は /unpause')
          .setColor(data.redColor)
        ],
        ephemeral: true
      })
    } else {
      queue.node.setPaused(true)
        ? interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('一時停止が完了しました。')
            .setColor(data.greenColor)
          ]
        })
        : interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('何かしらの理由で一時停止できませんでした。')
            .setColor(data.redColor)
          ],
          ephemeral: true
        })
    }
  }
}

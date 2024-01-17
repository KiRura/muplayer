/* eslint-disable no-unused-vars */
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import functions from '../functions.js'
import data from '../data.js'
import { useQueue } from 'discord-player'

export default {
  data: new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('一時停止を解除'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    if (!functions.isGuild(interaction)) return
    const queue = useQueue(interaction.guild.id)
    if (!functions.isCorrectQueue(queue, interaction)) return

    if (!queue.node.isPaused()) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('一時停止されていません')
          .setDescription('一時停止は /pause')
          .setColor(data.redColor)
        ],
        ephemeral: true
      })
    } else {
      queue.node.setPaused(false)
        ? interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('一時停止が解除されました。')
            .setColor(data.greenColor)
          ]
        })
        : interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('何かしらの理由で一時停止が解除できませんでした。')
            .setColor(data.redColor)
          ],
          ephemeral: true
        })
    }
  }
}

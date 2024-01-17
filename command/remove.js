import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import functions from '../functions.js'
import { useQueue } from 'discord-player'
import data from '../data.js'

export default {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('キュー内の指定された曲を削除')
    .addIntegerOption(option => option
      .setName('number')
      .setDescription('/queueで表示される番号')
      .setMinValue(1)
      .setRequired(true)
    ),
  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    if (!functions.isGuild(interaction)) return
    let queue = useQueue(interaction.guild.id)
    if (!functions.isCorrectQueue(queue, interaction)) return

    const number = interaction.options.getInteger('number', true)
    if (functions.isAtaokaNumber(number > queue.getSize(), interaction)) return

    const lostTrack = queue.node.remove(queue.tracks.toArray()[number - 1])
    if (!lostTrack) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('何かしらの理由により削除できませんでした。')
          .setColor(data.redColor)
        ],
        ephemeral: true
      })
    }

    queue = useQueue(interaction.guild.id)
    interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('削除が完了しました。')
        .setDescription(`:placard: [${lostTrack.title}](${lostTrack.url})`)
        .setFooter({
          text: `キュー: ${queue.getSize()}曲 | ${functions.times((queue.estimatedDuration + (queue.node.getTimestamp().total.value - queue.node.getTimestamp().current.value)) / 1000)}`
        })
        .setColor(data.greenColor)
      ]
    })
  }
}

/* eslint-disable no-unused-vars */
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import functions from '../functions.js'
import data from '../data.js'
import { useQueue } from 'discord-player'

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('キュー')
    .addIntegerOption(option => option
      .setName('page')
      .setDescription('ページ数 10個刻みで表示されます')
      .setMinValue(1)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    if (!functions.isGuild(interaction)) return
    const queue = useQueue(interaction.guild.id)
    if (!functions.isCorrectQueue(queue, interaction)) return
    const page = interaction.options.getInteger('page') || 1
    const maxPages = (Math.floor(queue.getSize() / 10)) + 1
    if (functions.isAtaokaNumber(page > maxPages, interaction)) return

    const pageStart = 10 * (page - 1)
    const pageEnd = pageStart + 10
    const tracks = queue.tracks.toArray().slice(pageStart, pageEnd).map((m, i) => {
      return `**${i + pageStart + 1}.** (${m.durationMS === 0 ? 'LIVE' : m.duration}) [${m.title.length <= 20 ? m.title : `${m.title.substring(0, 20)}...`}](${m.url})`
    })

    const length = (queue.estimatedDuration + (queue.currentTrack.durationMS - queue.node.streamTime)) / 1000
    const queueLength = (queue.estimatedDuration + queue.currentTrack.durationMS === 0) ? ':satellite: LIVE ONLY' : `:file_cabinet: ${functions.times(length)}`
    const streamTime = queue.currentTrack.durationMS === 0 ? 'LIVE' : `${queue.node.getTimestamp().current.label} / ${queue.currentTrack.duration}`

    interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle(`${queueLength} / ${queue.getSize()}曲`)
        .setDescription(`${tracks.join('\n')}${queue.getSize() > pageEnd ? `\n**...**\n**他:** ${queue.getSize() - pageEnd}曲` : ''}`)
        .setColor(data.mutaoColor)
        .setAuthor({ iconURL: queue.currentTrack.thumbnail, name: `再生中: (${streamTime}) ${queue.currentTrack.title.length <= 20 ? queue.currentTrack.title : `${queue.currentTrack.title.substring(0, 20)}...`}`, url: queue.currentTrack.url })
        .setFooter({ text: `ページ: ${page}/${maxPages}` })
      ]
    })
  }
}

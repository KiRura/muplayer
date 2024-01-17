/* eslint-disable no-unused-vars */
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import functions from '../functions.js'
import data from '../data.js'
import { useQueue } from 'discord-player'
import { joinVoiceChannel } from 'discord-voip'

export default {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('キューを削除してVCから切断'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    if (!functions.isGuild(interaction)) return
    const queue = useQueue(interaction.guild.id)
    if (!queue && interaction.guild.members.me.voice.channel) {
      joinVoiceChannel({
        channelId: interaction.guild.members.me.voice.channel.id,
        guildId: interaction.guild.id,
        selfDeaf: true,
        adapterCreator: interaction.guild.voiceAdapterCreator
      }).destroy()
      interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('またね！')
          .setDescription('コマンド実行時に以下のいずれかの理由でキューが存在していませんでした。\n- 再生中にBOTが再起動した\n- バグでキューが消えた')
          .setColor(data.greenColor)
        ]
      })
    } else if (queue && interaction.guild.members.me.voice.channel) {
      queue.delete()
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('またね！')
          .setDescription(interaction.command.name === 'skip' ? 'キュー内が空っぽのため切断しました' : null)
          .setColor(data.greenColor)
        ]
      })
      await functions.wait(5)
      interaction.deleteReply()
    } else {
      interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('キューも無いしVCにも接続されてないよ！')
          .setColor(data.redColor)
        ],
        ephemeral: true
      })
    }
  }
}

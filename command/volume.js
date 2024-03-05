import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import functions from '../functions.js'
import { useQueue } from 'discord-player'
import data from '../data.js'

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('音量をいじる')
    .addIntegerOption(option => option
      .setName('vol')
      .setDescription('デフォルト: 30%・最大: 50% (管理者権限なし) | 100% (管理者権限あり)')
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true)
    ),
  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute (interaction) {
    if (!functions.isGuild(interaction)) return
    const queue = useQueue(interaction.guild.id)
    if (!functions.isCorrectQueue(queue, interaction)) return

    const prev = queue.node.volume
    let vol = interaction.options.getInteger('vol', true)
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && vol > 50) vol = 50

    queue.node.setVolume(vol)
      ? interaction.reply({
        embeds: [new EmbedBuilder()
          .setDescription('`' + prev + '%` から ' + '`' + vol + '%` に設定されました。')
          .setColor(data.greenColor)
        ]
      })
      : interaction.reply({
        embeds: [new EmbedBuilder()
          .setDescription('何故かできませんでした。')
          .setColor(data.redColor)
        ]
      })
  }
}

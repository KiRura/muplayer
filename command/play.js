import { useMainPlayer } from 'discord-player'
import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { inGuild } from '../config/in-guild.js'
import data from '../data.js'

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('再生')
    .addStringOption(option => option
      .setName('query')
      .setDescription('URL or 検索ワード')
      .setRequired(true)
    )
    .addIntegerOption(option => option
      .setName('volume')
      .setDescription('音量')
      .setMaxValue(100)
      .setMinValue(1)
    )
    .addChannelOption(option => option
      .setName('channel')
      .setDescription('再生先のVC')
      .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
    ),
  /**
     *
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     */
  async execute (interaction) {
    if (!await inGuild(interaction)) return
    const player = useMainPlayer()

    const channel = interaction.options.getChannel(
      'channel',
      false,
      [ChannelType.GuildVoice, ChannelType.GuildStageVoice]
    ) ||
      interaction.member.voice.channel ||
      interaction.member.guild.members.me.voice.channel
    if (!channel) return await noChannel(interaction)
    const query = interaction.options.getString('query', true)
    const vol = volume(interaction.options.getInteger('number'))

    const res = await player.play(channel, query, {
      nodeOptions: {
        volume: vol
      }
    })
    await interaction.reply('```json\n' + JSON.stringify(res.searchResult.toJSON(), undefined, 2) + '\n```')
  }
}

function volume (number) {
  if (typeof number === 'number') {
    return number
  }
  return 30
}

/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function noChannel (interaction) {
  return await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle('接続先のチャンネルが見つかりません')
        .setDescription(
          '以下のいずれかの状態である必要があります\n' +
          '1. BOTをVCに接続したままにする(再生中に再起動したとき用)\n' +
          '2. 実行時に実行者がVCに入っている\n' +
          '3. スラコマでVCが指定されている'
        )
        .setColor(data.redColor)
    ]
  })
}

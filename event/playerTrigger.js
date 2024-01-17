/* eslint-disable no-unused-vars */
import { PermissionFlagsBits } from 'discord.js'
import { GuildQueue } from 'discord-player'

export default {
  name: 'playerTrigger',
  /**
   * @param {GuildQueue} queue
   */
  execute (queue) {
    if (!queue.guild.members.me.permissions.has(PermissionFlagsBits.ChangeNickname)) return
    queue.guild.members.me.setNickname(`${queue.currentTrack.title.substring(0, 29)}${queue.currentTrack.title.length > 29 ? '...' : ''}`)
  }
}

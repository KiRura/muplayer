/* eslint-disable no-unused-vars */
import { Logger } from 'tslog'
import functions from '../functions.js'
import { ActivityType, Client, EmbedBuilder, Events } from 'discord.js'
import data from '../data.js'
import fs from 'fs'
const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  name: Events.ClientReady,
  /**
   * @param {Client<true>} client
   * @param {*} registCommands
   */
  async execute (client, registCommands) {
    setInterval(async () => {
      client.user.setActivity({ name: `${(await client.guilds.fetch()).size} servers・${client.users.cache.size} users・${await functions.googlePing()} ms`, type: ActivityType.Custom })
    }, 30000)

    // logger.info('finding no data generated guild...')
    // for (const guild of (await client.guilds.fetch()).toJSON()) {
    //   const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
    //   if (!guildsData.find(guildData => guildData.id === guild.id)) {
    //     await (await import('../event/GuildCreate.js')).default.execute(client, guild)
    //     logger.info(`success: ${guild.name} | ${guild.id}`)
    //   }
    // }

    logger.info('cleaning nickname data...')
    const json = JSON.parse(fs.readFileSync('./data/nickname.json'))
    for (const guild of json) {
      client.guilds.fetch(guild.id)
        .then(async fetchGuild => {
          await fetchGuild.members.me.setNickname(guild.nickname)
        })
        .catch(_error => {})
    }
    functions.writeFile('./data/nickname.json', [])
    logger.info('cleaned nickname data')

    logger.info('setting commands...')
    await client.application.commands.set(registCommands)

    await (await (await client.guilds.fetch('1099309562781245440')).channels.fetch('1146562994688503999')).send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${client.user.displayName}が起動しました。`)
          .setFooter({ text: functions.dateToString(new Date(), true) })
          .setColor(data.mutaoColor)
      ]
    })

    logger.info(`${client.user.displayName} ALL READY`)
  }
}

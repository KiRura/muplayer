import { useMainPlayer } from 'discord-player'
import { ActivityType, Events } from 'discord.js'
import { Logger } from 'tslog'

const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  name: Events.ClientReady,
  async execute (args) {
    const client = kataClient(args)
    const player = useMainPlayer()

    setInterval(async () => {
      client.user.setActivity({ name: `${player.queues.cache.size} / ${(await client.guilds.fetch()).size} servers`, type: ActivityType.Custom })
    }, 30000)

    await client.application.commands.set(args[1][1])

    logger.info(`${client.user.displayName} all ready`)
  }
}

/**
 *
 * @returns {import('discord.js').Client}
 */
function kataClient (args) {
  return args[0]
}

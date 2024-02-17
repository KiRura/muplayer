import { Events } from 'discord.js'
import { Logger } from 'tslog'

const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  name: Events.ClientReady,
  async execute (args) {
    const client = kataClient(args)

    await client.application.commands.set(args[1][1])

    logger.info('all ready')
  }
}

/**
 *
 * @returns {import('discord.js').Client}
 */
function kataClient (args) {
  return args[0]
}

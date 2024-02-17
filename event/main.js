import { Events } from 'discord.js'
import sendError from '../config/send-error.js'

export default {
  name: 'main',
  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').Collection} events
   */
  async execute (client, events, commands) {
    client.once(Events.ClientReady, async client => {
      await execute(events.get(Events.ClientReady), client, null, client, commands)
    })

    client.on(Events.InteractionCreate, async interaction => {
      await execute(events.get(Events.InteractionCreate), interaction.client, interaction, interaction, commands)
    })
  }
}

async function execute (event, client, interaction, ...args) {
  if (!event) return false
  try {
    await event.execute(args)
  } catch (error) {
    await sendError.sendError(event, client, interaction, error)
  }
}

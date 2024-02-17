import { Events } from 'discord.js'

export default {
  name: Events.InteractionCreate,
  async execute (args) {
    const command = args[1][0].get(args[0].commandName)

    if (!command) return

    await command.execute(args[0])
  }
}

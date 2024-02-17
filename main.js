import { Client, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import load from './config/load.js'
import { Player } from 'discord-player'
import { Logger } from 'tslog'

const logger = new Logger({ hideLogPositionForProduction: true })

config()

const client = new Client({ intents: Object.values(GatewayIntentBits) })
const player = new Player(client)

await player.extractors.loadDefault()

const events = (await load.load('./event', false))[0]
const commands = await load.load('./command', true)
await events.get('main').execute(client, events, commands)

process.on('uncaughtException', (error, origin) => {
  logger.error('ガチでやばいエラー')
  console.error(error)
})

client.login(process.env.DISCORD_TOKEN)

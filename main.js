import { Client, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import load from './config/load.js'

config()

const client = new Client({ intents: Object.values(GatewayIntentBits) })

const events = (await load.load('./event', false))[0]
const commands = await load.load('./command', true)
await events.get('main').execute(client, events, commands)

client.login(process.env.DISCORD_TOKEN)

import { AttachmentBuilder, EmbedBuilder } from 'discord.js'
import data from '../data.js'
import { shortNumber } from './shortNumber.js'
import { fetch } from 'undici'
import { writeFileSync } from 'fs'
import sharp from 'sharp'

/**
 *
 * @param {import('discord-player').PlayerNodeInitializationResult<unknown>} res
 */
export async function playEmbed (res) {
  const result = res.searchResult
  const embed = new EmbedBuilder()
    .setColor(data.mutaoColor)

  let cropedImagePath; let attachment

  if (!res.searchResult.hasPlaylist()) {
    const track = result.tracks[0]
    cropedImagePath = await image(track.thumbnail)
    attachment = new AttachmentBuilder()
      .setName('output.jpg')
      .setFile(cropedImagePath[1])

    embed
      .setTitle(track.title)
      .setAuthor({
        name: track.author
      })
      .setURL(track.url)
      .setImage(`attachment://${attachment.name}`)
      .setFooter({ text: `${track.views ? `${shortNumber(track.views)}回再生 / ` : ''}${track.durationMS ? `${track.duration} - ` : '配信中 - '}` })
  } else {
    cropedImagePath = await image(result.tracks[0].thumbnail)
    attachment = new AttachmentBuilder()
      .setName('output.jpg')
      .setFile(cropedImagePath[1])

    embed
      .setTitle(result.playlist.title)
      .setAuthor({ name: result.playlist.author.name || null, url: result.playlist.author.url || null })
      .setURL(result.playlist.url)
      .setImage(`attachment://${attachment.name}`)
      .setFooter({ text: `${result.playlist.estimatedDuration ? result.playlist.durationFormatted : '配信中のみ'}` })
  }

  embed
    .setFooter({ text: `${embed.data.footer?.text ? embed.data.footer.text : ''}${queue(res.queue)}` })

  return [embed, cropedImagePath, attachment]
}

/**
 *
 * @param {import('discord-player').GuildQueue<unknown>} queue
 */
function queue (queue) {
  const size = queue.getSize()
  if (!size) return '再生開始'
  return `キュー内: ${queue.estimatedDuration ? queue.durationFormatted : '配信のみ'} / ${size}曲`
}

async function image (url) {
  const res = await fetch(url)

  const random = Math.random()
  const filePath = `./config/image/${random}.jpg`
  writeFileSync(filePath, Buffer.from(await res.arrayBuffer()), 'binary')

  const outputPath = filePath.replace(random, `${random}_output`)
  await sharp(filePath).resize(1500, 500, { fit: 'cover' }).toFile(outputPath)
  return [filePath, outputPath]
}

import { Collection } from 'discord.js'
import { readdirSync } from 'fs'
import { Logger } from 'tslog'

const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  /**
   * イベント系・スラコマ系読み込み
   * @param {string} path
   * @param {boolean} command
   */
  async load (path, command) {
    let success = 0; let failed = 0

    const collection = new Collection()
    const files = readdirSync(path).filter(file => file.endsWith('.js'))
    const commands = []
    for (const file of files) {
      const res = await import(`.${path}/${file}`)

      if (command) {
        if (!res.default.data) {
          failed++
          return
        }
        commands.push(res.default.data.toJSON())
      } else {
        if (!res.default.name) {
          failed++
          return
        }
      }

      collection.set(command ? file.slice(0, -3) : res.default.name, res.default)

      success++
    }

    logger.info(`${command ? 'スラコマのロード' : 'イベント系のロード'}:`, `ロード成功: ${success}`, `ロード失敗: ${failed}`)

    return [collection, commands]
  }
}

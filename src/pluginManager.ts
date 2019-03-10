import { dirname } from 'path'
import logger from './logger'

interface Plugin extends PluginMetadata {
  onLoad?: () => Promise<void>
  onUnload?: () => Promise<void>
}

interface PluginMetadata {
  name?: string,
  author?: string,
  description?: string
}

const metadatas = new Map<string, PluginMetadata>()

export default class PluginManager {
  /**
   * 플러그인을 불러옵니다.
   * @param pluginName 이름
   */
  static async load (pluginName: string) {
    const path = './plugins/' + pluginName
    const plugin: Plugin = require(path)

    if (plugin.onLoad) {
      await plugin.onLoad()
    }

    metadatas.set(pluginName, {
      name: plugin.name || pluginName,
      author: plugin.author,
      description: plugin.description
    })

    logger.info(pluginName + ' 플러그인을 불러왔습니다.')
  }

  /**
   * 플러그인을 해제합니다.
   * @param pluginName 이름
   */
  static async unload (pluginName: string) {
    if (!metadatas.has(pluginName)) {
      throw new Error(pluginName + ' 플러그인이 존재하지 않습니다.')
    }

    const path = './plugins/' + pluginName
    const pathDir = dirname(require.resolve(path))
    const plugin: Plugin = require(path)

    if (plugin.onUnload) {
      await plugin.onUnload()
    }

    metadatas.delete(pluginName)

    // 캐시 지우기
    for (let cachePath in require.cache) {
      if (cachePath.startsWith(pathDir)) {
        delete require.cache[cachePath]
      }
    }

    logger.info(pluginName + ' 플러그인을 해제했습니다.')
  }

  /**
   * 모든 플러그인을 해제합니다.
   */
  static async unloadAll () {
    for (let plugin in metadatas) {
      if (metadatas.hasOwnProperty(plugin)) {
        await this.unload(plugin)
      }
    }
  }

  /**
   * 플러그인이 불러와졌는지 확인합니다.
   * @param pluginName 이름
   */
  static isLoaded (pluginName: string) {
    return metadatas.has(pluginName)
  }

  /**
   * 불러온 플러그인 수를 가져옵니다.
   */
  static get size () {
    return metadatas.size
  }
}

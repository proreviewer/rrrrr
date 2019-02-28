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

  static async unload (pluginName: string) {
    if (!metadatas.has(pluginName)) {
      throw new Error(pluginName + ' 플러그인이 존재하지 않습니다.')
    }

    const path = './plugins/' + pluginName
    const plugin: Plugin = require(path)

    if (plugin.onUnload) {
      await plugin.onUnload()
    }

    delete require.cache[require.resolve(path)]
    metadatas.delete(pluginName)

    logger.info(pluginName + ' 플러그인을 해제했습니다.')
  }

  static async unloadAll () {
    for (let plugin in metadatas) {
      if (metadatas.hasOwnProperty(plugin)) {
        await this.unload(plugin)
      }
    }
  }

  static get (pluginName: string): Plugin {
    if (!metadatas.has(pluginName)) {
      throw new Error(pluginName + ' 플러그인이 존재하지 않거나 불러오지 않았습니다.')
    }

    return require('./plugins/' + pluginName)
  }
}

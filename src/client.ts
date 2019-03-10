import { Client } from 'discord.js'
import { sync as glob } from 'glob'
import { errorHandler } from './handler'
import logger from './logger'
import PluginManager from './pluginManager'
import CommandManager from './commandManager'

const client = new Client()

async function onMessage (message) {
  const prefix = '>' // 이후에 길드 또는 채널 별로 바뀔 수 있으니 미리 빼둠
  
  if (message.content.startsWith(prefix)) {
    const content = message.content.replace(new RegExp('^' + prefix), '')
    const command = content.split(' ', 1)[0]

    try {
      await CommandManager.execute(command, content, message)
    } catch (e) {
      logger.error(errorHandler(e))
      await message.reply(e.message)
    }
  }
}

client.on('ready', async () => {
  logger.info(`Hello, ${client.user.username}#${client.user.discriminator} (${client.user.id})`)

  // 플러그인 불러오기
  const paths = glob('*', { cwd: './src/plugins/' })

  for (let i = 0, len = paths.length; i < len; i++) {
    const plugin = paths[i].replace(/\.js$/, '')
    try {
      await PluginManager.load(plugin)
    } catch (e) {
      logger.error(plugin + ' 플러그인을 불러오는 중 오류가 발생했습니다: ' + errorHandler(e))
    }
  }
  
  client.on('message', onMessage)
})

export default client
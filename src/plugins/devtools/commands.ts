import PluginManager from '../../pluginManager'
import { ComamndCallback } from '../../commandManager'
import { isOwner } from '../../utils'

export const commandLoad: ComamndCallback = async (cmd, args, executor, message) => {
  const name: string = args.name || args._.join(' ')

  if (!isOwner(executor)) {
    return false
  }

  try {
    await PluginManager.load(name)
  } catch (e) {
    await message.reply(e.message)
    return false
  }

  return true
}

export const commandUnload: ComamndCallback = async (cmd, args, executor, message) => {
  const name: string = args.name || args._.join(' ')

  if (!isOwner(executor)) {
    return false
  }

  try {
    await PluginManager.unload(name)
  } catch (e) {
    await message.reply(e.message)
    return false
  }

  return true
}

import CommandManager from '../../commandManager'
import { commandLoad, commandUnload, commandReload, commandWhois, commandBot } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('load', commandLoad)
  CommandManager.registerCommand('reload', commandReload)
  CommandManager.registerCommand('unload', commandUnload)
  CommandManager.registerCommand('whois', commandWhois)
  CommandManager.registerCommand('bot', commandBot)
}

export async function onUnload () {
  CommandManager.unregisterCommand('load')
  CommandManager.unregisterCommand('reload')
  CommandManager.unregisterCommand('unload')
  CommandManager.unregisterCommand('whois')
  CommandManager.unregisterCommand('bot')
}

import CommandManager from '../../commandManager'
import { commandLoad, commandUnload, commandReload } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('load', commandLoad)
  CommandManager.registerCommand('reload', commandReload)
  CommandManager.registerCommand('unload', commandUnload)
}

export async function onUnload () {
  CommandManager.unregisterCommand('load')
  CommandManager.unregisterCommand('reload')
  CommandManager.unregisterCommand('unload')
}

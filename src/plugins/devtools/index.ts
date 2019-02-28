import CommandManager from '../../commandManager'
import { commandLoad, commandUnload } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('load', commandLoad)
  CommandManager.registerCommand('unload', commandUnload)
}

export async function onUnload () {
  CommandManager.unregisterCommand('load')
  CommandManager.unregisterCommand('unload')
}

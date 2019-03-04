import CommandManager from '../../commandManager'
import { commandSetPrefix } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('setprefix', commandSetPrefix)
}

export async function onUnload () {
  CommandManager.unregisterCommand('setprefix')
}
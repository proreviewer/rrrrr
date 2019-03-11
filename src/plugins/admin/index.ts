import CommandManager from '../../commandManager'
import { commandSetPrefix, commandAddRole, commandDeleteRole } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('addrole', commandAddRole, { aliases: ['role'] })
  CommandManager.registerCommand('deleterole', commandDeleteRole, { aliases: ['drole'] })
  CommandManager.registerCommand('setprefix', commandSetPrefix)
}

export async function onUnload () {
  CommandManager.unregisterCommand('addrole')
  CommandManager.unregisterCommand('deleterole')
  CommandManager.unregisterCommand('setprefix')
}
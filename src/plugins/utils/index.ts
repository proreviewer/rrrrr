import CommandManager from '../../commandManager'
import { commandSay, commandRoles, commandPermissions, commandWhois, commandBot } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('say', commandSay, { aliases: ['>'] })
  CommandManager.registerCommand('roles', commandRoles)
  CommandManager.registerCommand('permissions', commandPermissions, { aliases: ['perms'] })
  CommandManager.registerCommand('whois', commandWhois)
  CommandManager.registerCommand('bot', commandBot)
}

export async function onUnload () {
  CommandManager.unregisterCommand('say')
  CommandManager.unregisterCommand('roles')
  CommandManager.unregisterCommand('permissions')
  CommandManager.unregisterCommand('whois')
  CommandManager.unregisterCommand('bot')
}

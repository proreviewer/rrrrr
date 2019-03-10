import { ComamndCallback } from '../../commandManager'
import { isOwner } from '../../utils'
import { setMetadata } from '../metadata'

export const commandSetPrefix: ComamndCallback = async function (cmd, args, executor, message) {
  if (!isOwner(executor) && !executor.hasPermission('ADMINISTRATOR')) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const prefix: string = args._[0] || process.env.PREFIX
  setMetadata(message.guild.id, 'prefix', prefix)
  await message.reply(`명령어 접두사를 \`${prefix}\` 값으로 변경했습니다.`)
  return true
}

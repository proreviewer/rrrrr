import { ComamndCallback } from '../../commandManager'
import { isOwner, resolveMembers, resolveRoles } from '../../utils'
import { setMetadata } from '../metadata'
import client from '../../client'

export const commandAddRole: ComamndCallback = async (cmd, args, executor, message) => {
  if (!isOwner(executor) && !executor.hasPermission('MANAGE_ROLES')) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const guild = message.guild
  const members = resolveMembers(args._[0], guild)

  if (members.length < 1) {
    await message.reply('사용자를 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    await message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  }

  const roles = resolveRoles(args._[1], guild)
  const rolePosition = guild.member(client.user).highestRole.calculatedPosition

  if (roles.length < 1) {
    await message.reply('역할을 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    await message.reply('여러 역할이 존재합니다, 정확히 선택해주세요.')
    return false
  } else if (roles[0].calculatedPosition >= rolePosition) {
    await message.reply('선택한 역할이 봇보다 더 높거나 같습니다.')
    return false
  }

  const member = members[0]
  const role = roles[0]

  await member.addRole(role, `Executed by ${executor.displayName}`)
  await message.reply(`${member.displayName} 님에게 \`${role.name}\` 역할을 추가했습니다.`)

  return true
}

export const commandDeleteRole: ComamndCallback = async (cmd, args, executor, message) => {
  if (!isOwner(executor) && !executor.hasPermission('ADMINISTRATOR')) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const guild = message.guild
  const members = resolveMembers(args._[0], guild)
  const rolePosition = guild.member(client.user).highestRole.calculatedPosition

  if (members.length < 1) {
    await message.reply('사용자를 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    await message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  } else if (members[0].highestRole.calculatedPosition >= rolePosition) {
    await message.reply('선택한 사용자의 역할이 봇보다 더 높거나 같습니다.')
  }

  const roles = resolveRoles(args._[1], guild)

  if (roles.length < 1) {
    await message.reply('역할을 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    await message.reply('여러 역할이 존재합니다, 정확히 선택해주세요.')
    return false
  }

  const member = members[0]
  const role = roles[0]

  if (!member.roles.has(role.id)) {
    await message.reply(`${member.displayName} 님은 \`${role.name}\` 역할을 가지고 있지 않습니다.`)
    return false
  }

  await member.removeRole(role, `Executed by ${executor.displayName}`)
  await message.reply(`${member.displayName} 님에게서 \`${role.name}\` 역할을 철회했습니다.`)

  return true
}

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

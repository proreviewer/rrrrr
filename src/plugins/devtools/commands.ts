import * as numeral from 'numeral'
import * as moment from 'moment'
import { RichEmbed } from 'discord.js'
import PluginManager from '../../pluginManager'
import { ComamndCallback } from '../../commandManager'
import { resolveUser, isOwner } from '../../utils'
import { getBalance } from '../economy'

moment.locale('ko')

export const commandLoad: ComamndCallback = async (cmd, args, executor, message) => {
  const name: string = args.name || args._.slice(1).join(' ')

  if (!isOwner(executor)) {
    message.reply('권한이 없습니다.')
    return false
  }

  try {
    await PluginManager.load(name)
  } catch (e) {
    await message.reply(e.message)
    return false
  }

  await message.reply(`${name} 플러그인을 불러왔습니다.`)
  return true
}

export const commandReload: ComamndCallback = async (cmd, args, executor, message) => {
  const name: string = args.name || args._.slice(1).join(' ')

  if (!isOwner(executor)) {
    message.reply('권한이 없습니다.')
    return false
  }

  try {
    await PluginManager.unload(name)
    await PluginManager.load(name)
  } catch (e) {
    await message.reply(e.message)
    return false
  }

  await message.reply(`${name} 플러그인을 다시 불러왔습니다.`)
  return true
}

export const commandUnload: ComamndCallback = async (cmd, args, executor, message) => {
  const name: string = args.name || args._.slice(1).join(' ')

  if (!isOwner(executor)) {
    message.reply('권한이 없습니다.')
    return false
  }

  try {
    await PluginManager.unload(name)
  } catch (e) {
    await message.reply(e.message)
    return false
  }

  await message.reply(`${name} 플러그인을 해제했습니다.`)
  return true
}

export const commandWhois: ComamndCallback = async (cmd, args, executor, message) => {
  const name: string = args.name || args._.slice(1).join(' ') || executor
  const user = resolveUser(name, message.guild)

  if (!user) {
    message.reply('사용자를 찾을 수 없습니다.')
    return false
  }

  const member = message.guild.member(user)
  const embed = new RichEmbed()

  embed.setTitle(`${user.username}#${user.discriminator}`)
  embed.setDescription(member.displayName)
  embed.setColor(member.displayHexColor)
  embed.setThumbnail(user.displayAvatarURL)

  const createdAt = moment(user.createdTimestamp)
  embed.addField('가입일', `${createdAt.fromNow()} (${createdAt.format('llll')})`)

  const joinedAt = moment(member.joinedTimestamp)
  embed.addField('가입일 (길드)', `${joinedAt.fromNow()} (${joinedAt.format('llll')})`)

  embed.addField('역할', member.roles.map(role => role.name).join(', '))

  if (PluginManager.get('economy')) {
    const balance = numeral(await getBalance(member))
    embed.addField('잔액', balance.format('0,0') + '원')
  }

  await message.channel.send(embed)
  return true
}

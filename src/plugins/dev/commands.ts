import * as numeral from 'numeral'
import * as moment from 'moment'
import { RichEmbed } from 'discord.js'
import client from '../../client'
import PluginManager from '../../pluginManager'
import { ComamndCallback } from '../../commandManager'
import { isOwner, resolveMembers } from '../../utils'
import { getBalance } from '../economy'

moment.locale('ko')

export const commandLoad: ComamndCallback = async (cmd, args, executor, message) => {
  if (!isOwner(executor)) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const name: string = args._.join(' ')

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
  if (!isOwner(executor)) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const name: string = args._.join(' ')

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
  if (!isOwner(executor)) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const name: string = args._.join(' ')

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
  const name: string = args._.join(' ') || executor
  const members = resolveMembers(name, message.guild)

  if (members.length === 0) {
    await message.reply('사용자를 찾을 수 없습니다.')
    return false
  }

  if (members.length > 1) {
    await message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  }

  if (members[0].id === client.user.id) {
    const result = await commandBot(cmd, args, executor, message)
    return result
  }

  const member = members[0]
  const user = member.user
  const embed = new RichEmbed()
    .setAuthor(`${user.username}#${user.discriminator}`, user.displayAvatarURL)
    .setThumbnail(user.displayAvatarURL)
    .setColor(member.displayHexColor)

  embed.addField('역할', member.roles.map(role => role.name).join(', '))

  const createdAt = moment(user.createdTimestamp)
  embed.addField('가입일', `${createdAt.fromNow()} (${createdAt.format('llll')})`)

  const joinedAt = moment(member.joinedTimestamp)
  embed.addField('가입일 (길드)', `${joinedAt.fromNow()} (${joinedAt.format('llll')})`)

  if (!user.bot && PluginManager.isLoaded('economy')) {
    const balance = numeral(await getBalance(member))
    embed.addField('소지금', balance.format('0,0') + '원', true)
  }

  await message.channel.send(embed)
  return true
}

export const commandBot: ComamndCallback = async (cmd, args, executor, message) => {
  const user = client.user
  const embed = new RichEmbed()
    .setAuthor(user.username, user.displayAvatarURL)
    .setColor(0xacff28)
    .addField('버전', process.version, true)
    .addField('라이브러리', '[discord.js](https://discord.js.org/)', true)
    .addField('플러그인', numeral(PluginManager.size).format('0,0') + '개', true)
    .addField('길드', numeral(client.guilds.size).format('0,0') + '개', true)
    .addField('채널', numeral(client.channels.size).format('0,0') + '개', true)
    .addField('사용자', numeral(client.users.size).format('0,0') + '명', true)
    .addField('개발자', 'alien#0001', true)
    .setFooter('Made with ❤ in South Korea', 'https://i.imgur.com/9k3CFRp.png')

  await message.channel.send(embed)
  return true
}

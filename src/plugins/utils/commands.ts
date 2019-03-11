import * as numeral from 'numeral'
import * as moment from 'moment'
import { sample } from 'lodash'
import { RichEmbed } from 'discord.js'
import { getBalance } from '../economy'
import PluginManager from '../../pluginManager'
import { ComamndCallback } from '../../commandManager'
import client from '../../client'
import { isOwner, resolveMembers } from '../../utils'

const thanks: {lang: string, text: string}[] = require('./thanks.json')

export const commandSay: ComamndCallback = async (cmd, args, executor, message) => {
  const text = args._.join(' ')

  if (text === '') {
    await message.reply('내용이 비어있습니다.')
    return false
  } else if (text.length > 2000) {
    await message.reply('내용이 너무 깁니다.')
    return false
  }

  if (isOwner(executor)) {
    await message.delete()
    await message.channel.send(text)
  } else {
    const embed = new RichEmbed()
      .setAuthor(executor.displayName, executor.user.displayAvatarURL)
      .setDescription(text)
      .setFooter('This is user-generated content. we are not responsible for the content.')
    await message.delete()
    await message.channel.send(embed)
  }

  return true
}

export const commandRoles: ComamndCallback = async (cmd, args, executor, message) => {
  if (!isOwner(executor) && !executor.hasPermission('ADMINISTRATOR')) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const roles = message.guild.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition)
    .map(role => `* ${role.name} (${role.id})`)

  await message.channel.send('```markdown\n' + roles.join('\n') + '```')
  return true
}

export const commandPermissions: ComamndCallback = async (cmd, args, executor, message) => {
  if (!isOwner(executor) && !executor.hasPermission('ADMINISTRATOR')) {
    await message.reply('권한이 없습니다.')
    return false
  }

  const query = args._.join(' ')
  const members = resolveMembers(query || executor, message.guild)

  if (members.length === 0) {
    await message.reply('사용자를 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    await message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  }

  const member = members[0]
  const embed = new RichEmbed()
    .setAuthor(member.displayName, member.user.displayAvatarURL)
    .setDescription('`' + member.permissions.toArray().join(', ') + '`')

  await message.channel.send(embed)

  return true
}

export const commandWhois: ComamndCallback = async (cmd, args, executor, message) => {
  const name: string = args._.join(' ') || executor
  const members = resolveMembers(name, message.guild)

  if (members.length === 0) {
    await message.reply('사용자를 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    await message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  } else if (members[0].id === client.user.id) {
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
    .setAuthor('Otterobo', 'https://i.imgur.com/9k3CFRp.png')
    .setColor(0xacff28)
    .addField('Version', process.version, true)
    .addField('Library', '[discord.js](https://discord.js.org/)', true)
    .addField('Plugin', numeral(PluginManager.size).format('0,0') + '개', true)
    .addField('Guild', numeral(client.guilds.size).format('0,0') + '개', true)
    .addField('Channel', numeral(client.channels.size).format('0,0') + '개', true)
    .addField('User', numeral(client.users.size).format('0,0') + '명', true)
    .addField('Developer', 'alien#0001', true)
    .setFooter(`${sample(thanks).text}, ${executor.displayName} for use Otterobo ❤`)

  await message.channel.send(embed)
  return true
}

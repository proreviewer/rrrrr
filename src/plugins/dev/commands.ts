import * as moment from 'moment'
import PluginManager from '../../pluginManager'
import { ComamndCallback } from '../../commandManager'
import { isOwner } from '../../utils'

const thanks: {lang: string, text: string}[] = require('./thanks.json')

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
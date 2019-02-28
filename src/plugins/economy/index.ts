import { GuildMember } from 'discord.js'
import CommandManager from '../../commandManager'
import { getDatabase } from '../mongo'

import { commandEconomy } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('economy', commandEconomy)
}

export async function onUnload () {
  CommandManager.unregisterCommand('economy')
}

/**
 * 멤버의 잔액을 가져옵니다.
 * @param member 멤버 객체
 */
export async function getBalance (member: GuildMember): Promise<number> {
  const collection = getDatabase().collection('economy')
  const data = await collection.findOne({
    guild: member.guild.id,
    member: member.id
  })

  return data ? data.balance : 0
}

/**
 * 멤버의 잔액을 설정합니다.
 * @param member 멤버 객체
 * @param balance 새 잔액
 */
export async function setBalance (member: GuildMember, balance: number) {
  const collection = getDatabase().collection('economy')
  const result = await collection.findOneAndUpdate({
    guild: member.guild.id,
    member: member.id
  }, { '$set': { balance } }, { upsert: true })

  if (result.ok !== 1) {
    throw new Error(result.lastErrorObject)
  }
}

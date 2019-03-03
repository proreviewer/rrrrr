import { GuildMember, Snowflake, Guild } from 'discord.js'
import CommandManager from '../../commandManager'
import { getDatabase } from '../mongo'

import { commandSetMoney, commandAddMoney, commandMoney, commandPay, commandTop } from './commands'

export async function onLoad () {
  CommandManager.registerCommand('setmoney', commandSetMoney)
  CommandManager.registerCommand('addmoney', commandAddMoney)
  CommandManager.registerCommand('money', commandMoney)
  CommandManager.registerCommand('pay', commandPay)
  CommandManager.registerCommand('top', commandTop)
}

export async function onUnload () {
  CommandManager.unregisterCommand('setmoney')
  CommandManager.unregisterCommand('addmoney')
  CommandManager.unregisterCommand('money')
  CommandManager.unregisterCommand('pay')
  CommandManager.unregisterCommand('top')
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
  await collection.updateOne({
    guild: member.guild.id,
    member: member.id
  }, { '$set': { balance } }, { upsert: true })
}

/**
 * 멤버의 잔액을 추가합니다.
 * @param member 멤버 객체
 * @param balance 추가할 잔액
 */
export async function increaseBalance (member: GuildMember, balance: number) {
  const collection = getDatabase().collection('economy')
  await collection.updateOne({
    guild: member.guild.id,
    member: member.id
  }, { '$inc': { balance } }, { upsert: true })
}

/**
 * 멤버 잔액을 줄입니다.
 * @param member 멤버 객체
 * @param balance 뺄 객체
 */
export async function decreaseBalance (member: GuildMember, balance: number) {
  await increaseBalance(member, -balance)
}

/**
 * 멤버로부터 다른 멤버에게 돈을 전달합니다.
 * @param fromMember 보낼 멤버 객체
 * @param toMember 받을 멤버 객체
 * @param amount 양
 */
export async function pay (fromMember: GuildMember, toMember: GuildMember, amount: number) {
  const fromBalance = await getBalance(fromMember)
  const toBalance = await getBalance(toMember)

  if (fromBalance < amount) {
    throw new Error('보내는 사람의 잔액이 부족합니다.')
  }

  await decreaseBalance(fromMember, amount)
  await increaseBalance(toMember, amount)
}
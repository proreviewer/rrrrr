import * as numeral from 'numeral'
import { resolveUser, isOwner } from '../../utils'
import { ComamndCallback } from '../../commandManager'
import { getBalance, setBalance, pay } from './'

export const commandSetMoney: ComamndCallback = async function (cmd, args, executor, message) {
  if (!isOwner(executor)) {
    message.reply('권한이 없습니다.')
    return false
  }

  const name = args.to || args._[1]
  const amount = numeral(args.amount || args._[2])

  const user = resolveUser(name, message.guild)

  if (!user) {
    message.reply('사용자를 찾을 수 없습니다.')
    return false
  }

  const member = message.guild.member(user)
  await setBalance(member, amount.value())
  await message.reply(`${member.displayName} 님의 잔액을 ${amount.format('0,0')}원으로 설정했습니다 :money_mouth:`)
  return true
}

export const commandEconomy: ComamndCallback = async function (command, args, executor, message) {
  let target = executor
  const name = args.to || args._[1]

  if (name) {
    if (!isOwner(executor)) {
      message.reply('권한이 없습니다')
      return false
    }

    const user = resolveUser(name, message.guild)
    
    if (!user) {
      message.reply('사용자를 찾을 수 없습니다.')
      return false
    }

    target = message.guild.member(user)
  }

  const balance = numeral(await getBalance(target))
  await message.channel.send(`${target.displayName} 님은 ${balance.format('0,0')}원을 소유하고 있습니다 :money_bag:`)
  return true
}

export const commandPay: ComamndCallback = async function (cmd, args, executor, message) {
  const name = args.to || args._[1]
  const amount = numeral(args.amount || args._[2])
  const user = resolveUser(name, message.guild)

  if (!user) {
    message.reply('사용자를 찾을 수 없습니다.')
    return false
  }

  if (executor.id === user.id) {
    message.reply('자신에게 보낼 수 없습니다.')
    return false
  }

  const member = message.guild.member(user)

  await pay(executor, member, Math.abs(amount.value()))
  await message.channel.send(`${member.displayName} 님에게 ${amount.format('0,0')}원을 전달했습니다 :money_bag:`)
  return true
}
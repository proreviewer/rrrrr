import * as numeral from 'numeral'
import { resolveUser, isOwner, resolveMembers } from '../../utils'
import { ComamndCallback } from '../../commandManager'
import { getDatabase } from '../mongo'
import { getBalance, setBalance, pay, increaseBalance } from './'

export const commandSetMoney: ComamndCallback = async function (cmd, args, executor, message) {
  if (!isOwner(executor)) {
    message.reply('권한이 없습니다.')
    return false
  }

  const name = args.to || args._[1]
  const amount = numeral(args.amount || args._[2])

  const members = resolveMembers(name, message.guild)

  if (members.length === 0) {
    message.reply('사용자를 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  } else if (members[0].user.bot) {
    message.reply('봇은 선택할 수 없습니다.')
    return false
  }

  const member = members[0]
  await setBalance(member, amount.value())
  await message.reply(`${member.displayName} 님의 잔액을 ${amount.format('0,0')}원으로 설정했습니다 🤑`)
  return true
}

export const commandAddMoney: ComamndCallback = async function (cmd, args, executor, message) {
  if (!isOwner(executor)) {
    message.reply('권한이 없습니다.')
    return false
  }

  const name = args.to || args._[1]
  const amount = numeral(args.amount || args._[2])

  const members = resolveMembers(name, message.guild)

  if (members.length === 0) {
    message.reply('사용자를 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  } else if (members[0].user.bot) {
    message.reply('봇은 선택할 수 없습니다.')
    return false
  }

  const member = members[0]
  await increaseBalance(member, amount.value())
  await message.reply(`${member.displayName} 님의 잔액에 ${amount.format('0,0')}원을 추가했습니다 🤑`)
  return true
}

export const commandMoney: ComamndCallback = async function (command, args, executor, message) {
  let target = executor
  const name = args.to || args._[1]

  if (name) {
    const members = resolveMembers(name, message.guild)
    
    if (members.length === 0) {
      message.reply('사용자를 찾을 수 없습니다.')
      return false
    } else if (members.length > 1) {
      message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
      return false
    } else if (members[0].user.bot) {
      message.reply('봇은 선택할 수 없습니다.')
      return false
    }

    target = members[0]
  }

  const balance = numeral(await getBalance(target))
  await message.channel.send(`${target.displayName} 님은 ${balance.format('0,0')}원을 소유하고 있습니다 💰`)
  return true
}

export const commandPay: ComamndCallback = async function (cmd, args, executor, message) {
  const name = args.to || args._[1]
  const amount = numeral(args.amount || args._[2])

  if (amount.value() <= 0) {
    message.reply('보낼 금액이 너무 적습니다.')
    return false
  }

  const members = resolveMembers(name, message.guild)

  if (members.length === 0) {
    message.reply('사용자를 찾을 수 없습니다.')
    return false
  } else if (members.length > 1) {
    message.reply('여러 사용자가 존재합니다, 정확히 선택해주세요.')
    return false
  } else if (members[0].user.bot) {
    message.reply('봇은 선택할 수 없습니다.')
    return false
  } else if (members[0].id === executor.id) {
    message.reply('자신에게 보낼 수 없습니다.')
    return false
  }

  const member = members[0]
  await pay(executor, member, amount.value())
  await message.channel.send(`${member.displayName} 님에게 ${amount.format('0,0')}원을 전달했습니다 💸`)
  return true
}

export const commandTop: ComamndCallback = async function (command, args, executor, message) {
  const collection = getDatabase().collection('economy')
  const data = await collection.find({ guild: message.guild.id }).sort({ balance: -1 })

  if (data) {
    const text = []
    let serverBalance = numeral(0)

    await data.forEach(item => {
      const member = resolveMembers(item.member, message.guild)[0]
      const balance = numeral(item.balance)

      if (text.length <= 10) {
        const rank = numeral(text.length + 1).format('00')
        if (member) {
          text.push(`${rank}. ${member.user.username}#${member.user.discriminator} - ${balance.format('0,0')}원`)
        } else {
          text.push(`${rank}. ${item.member} - ${balance.format('0,0')}원`)
        }
      }

      serverBalance.add(balance.value())
    })

    text.unshift('---')
    text.unshift(message.guild.name + ' 길드 가치: ' + serverBalance.format('0,0'))
  
    await message.channel.send('```markdown\n' + text.join('\n') + '```')
    return true
  }

  await message.reply('표시할 사용자가 없습니다.')
  return false
}

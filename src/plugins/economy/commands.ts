import * as numeral from 'numeral'
import { ComamndCallback } from '../../commandManager'
import { getBalance } from './'

export const commandEconomy: ComamndCallback = async function (command, args, executor, message) {
  const balance = numeral(await getBalance(executor))
  await message.channel.send(`:moneybag: ${executor.displayName} 님은 ${balance.format('0,0')}원을 소유하고 있습니다.`)
  return true
}

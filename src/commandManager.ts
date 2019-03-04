import { GuildMember, Message } from 'discord.js'
import { split as shlex } from 'shlex'
import * as minimist from 'minimist'
import logger from './logger'

export type ComamndCallback = (command: string, args: any, executor: GuildMember, message: Message) =>
  Promise<boolean>

interface CommandOptions {
  aliases?: string[],
  parser?: (raw: string) => any
}

interface CommandMetadata {
  options: CommandOptions,
  callback: ComamndCallback
}

const commands = new Map<string, CommandMetadata>()
const aliases = new Map<string, string>()

class CommandManager {
  /**
   * 명령어를 등록합니다.
   * @param name 명령어
   * @param options 옵션
   * @param command 실행 콜백
   */
  static registerCommand (name: string, callback: ComamndCallback, options?: CommandOptions) {
    if (commands.has(name)) {
      throw new Error(`${name} 명령어는 이미 등록되어 있습니다.`)
    }

    // 명령어 옵션이 있다면
    if (options) {
      // 별명 추가하기
      if (options.aliases) {
        const filtedAliases = options.aliases.filter(alias => {
          if (aliases.has(alias)) {
            logger.warn(`${alias} 별명은 이미 ${aliases.get(alias)} 명령어에 의해 선언되어 있습니다.`)
            return false
          }
          return true
        })

        for (let i = 0, len = filtedAliases.length; i < len; i++) {
          const alias = filtedAliases[i]
          aliases.set(alias, name)
          logger.verbose(`${alias} 별명을 ${name} 명령어로 지정했습니다.`)
        }
      }
    }

    // 명령어 추가하기
    commands.set(name, {
      options: options || {},
      callback
    })

    logger.verbose(`${name} 명령어를 등록했습니다.`)
  }

  /**
   * 명령어를 등록 해제합니다.
   * @param name 명령어
   */
  static unregisterCommand (name: string) {
    const cmd = this.resolve(name)

    if (!cmd) {
      throw new Error(`${name} 명령어는 등록되지 않았습니다.`)
    }

    // 별명 제거하기
    if (cmd.options.aliases) {
      for (let i = 0, len = cmd.options.aliases.length; i < len; i++) {
        const alias = cmd.options.aliases[i]
        if (aliases.has(alias)) {
          aliases.delete(alias)
          logger.verbose(`${alias} 별명을 제거했습니다.`)
        }
      }
    }

    commands.delete(name)

    logger.verbose(`${name} 명령어를 제거했습니다.`)
  }

  /**
   * 명령어를 찾습니다.
   * @param name 명령어
   */
  static resolve (name: string): CommandMetadata {
    if (commands.has(name)) return commands.get(name)
    else return commands.get(aliases.get(name))
  }

  /**
   * 명령어를 실행합니다.
   * @param name 명령어
   * @param content 실행 접두사를 제외한 내용
   * @param message 객체
   */
  static async execute (name: string, content: string, message: Message): Promise<boolean> {
    const cmd = this.resolve(name)
    const executor = message.guild.member(message.author)

    if (!cmd) {
      return false
    }

    logger.info(`<${executor.id}(${executor.displayName})> ${content}`)

    let args

    if (typeof cmd.options.parser === 'function') {
      args = cmd.options.parser(content)
    } else {
      args = minimist(shlex(content))
      args._ = args._.slice(1)
    }

    const result = await cmd.callback(name, args, executor, message)
    return result
  }
}

export default CommandManager

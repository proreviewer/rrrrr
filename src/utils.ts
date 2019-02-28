import { User, Snowflake, Message, Guild, GuildMember } from 'discord.js'
import client from './client'

type UserResolvable = User | Snowflake | Message | Guild | GuildMember | string

export function resolveUser (query: UserResolvable): User {
  if (query instanceof User) return query
  else if (query instanceof Guild) return query.owner.user
  else if (query instanceof GuildMember) return query.user
  else if (query instanceof Message) return query.author
}

export function resolveMember (query: string, guild: Guild) {
  if (query.match(/<@!?\d{18}>/)) {
    // 아이디가 일치하는 멤버 리턴하기
    const id = query.replace(/[^\d]/g, '')
    if (guild.members.has(id)) {
      return guild.members.get(id)
    }
  } else {
    // 닉네임이 일치하는 멤버 리턴하기
    for (let id in guild.members) {
      if (guild.members.hasOwnProperty(id)) {
        const member = guild.members.get(id)
        if (query === member.displayName) {
          return member
        }
      }
    }
  }
}

export function isOwner (target: UserResolvable) {
  const user = resolveUser(target)

  if (user) {
    return user.id === process.env.OWNER
  }

  return false
}

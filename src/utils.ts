import { User, Snowflake, Guild, GuildMember, Message } from 'discord.js'
import client from './client'

type UserResolvable = User | Snowflake  | Guild | GuildMember | Message | string

export function resolveUser (query: UserResolvable, guild?: Guild): User {
  if (query instanceof User) return query
  else if (query instanceof Guild) return query.owner.user
  else if (query instanceof GuildMember) return query.user
  else if (query instanceof Message) return query.author
  else if (guild && typeof query === 'string') {
    if (query.match(/<@!?\d{18}>/)) {
      // 아이디가 일치하는 멤버 리턴하기
      const id = query.replace(/[^\d]/g, '')
      return guild.members.has(id) ? guild.members.get(id).user : null
    } else {
      // 닉네임이 일치하는 멤버 리턴하기
      const members = guild.members.array()
      for (let i = 0, len = members.length; i < len; i++) {
        const member = members[i]
        if (query === member.displayName) {
          return member.user
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

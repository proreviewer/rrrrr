import { User, Snowflake, Guild, GuildMember, Message, Role } from 'discord.js'

type UserResolvable = User | Snowflake | GuildMember | Message
type GuildMemberResolvable = UserResolvable | string
type RoleResolvable = Snowflake

export function resolveUser (query: UserResolvable): User {
  if (query instanceof User) return query
  else if (query instanceof Guild) return query.owner.user
  else if (query instanceof GuildMember) return query.user
  else if (query instanceof Message) return query.author
}

export function resolveMembers (query: GuildMemberResolvable, guild: Guild): GuildMember[] {
  const user = resolveUser(query)
  const members = guild.members
  let result = []

  if (user) {
    result.push(guild.member(user))
  } else if (typeof query === 'string') {
    if (members.has(query)) {
      // 아이디
      result.push(members.get(query))
    } else if (query.match(/<@!?\d{18}>/)) {
      // 맨션
      const id = query.replace(/[^\d]/g, '')
      result.push(members.get(id))
    } else {
      // 닉네임
      const membersArray = members.array()
      for (let i = 0, len = membersArray.length; i < len; i++) {
        const member = membersArray[i]
        if (member.displayName === query) {
          result.push(member)
        }
      }
    }
  }

  return result
}

export function resolveRoles (query: RoleResolvable, guild: Guild): Role[] {
  const roles = guild.roles
  const result = []

  if (roles.has(query)) {
    result.push(roles.get(query))
  } else {
    const rolesArray = roles.array()
    for (let i = 0, len = rolesArray.length; i < len; i++) {
      const role = rolesArray[i]
      if (role.name === query) {
        result.push(role)
      }
    }
  }

  return result
}

export function isOwner (target: UserResolvable) {
  const user = resolveUser(target)

  if (user) {
    return user.id === process.env.OWNER
  }

  return false
}

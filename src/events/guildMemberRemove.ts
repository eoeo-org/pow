import type { GuildMember, PartialGuildMember } from 'discord.js'
import { guildCtxManager, workerClientMap } from '../index.js'

export const guildMemberRemoveEvent = (
  member: GuildMember | PartialGuildMember,
) => {
  if (workerClientMap.has(member.id)) {
    guildCtxManager.get(member.guild).resetBots(workerClientMap)
  }
}

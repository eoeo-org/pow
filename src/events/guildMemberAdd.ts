import type { GuildMember } from 'discord.js'
import { guildCtxManager, workerClientMap } from '../index.js'

export const guildMemberAddEvent = async (member: GuildMember) => {
  if (workerClientMap.has(member.id)) {
    await guildCtxManager.get(member.guild).addBot(member.id)
  }
}

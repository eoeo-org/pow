import type { GuildMember, PartialGuildMember } from 'discord.js'
import { guildCtxManager, workerClientMap } from '../index.js'
import { Listener } from '@sapphire/framework'

export class GuildMemberRemoveListener extends Listener {
  public override run(member: GuildMember | PartialGuildMember) {
    if (workerClientMap.has(member.id)) {
      void guildCtxManager.deleteAsync(member.guild)
    }
  }
}

import type { GuildMember } from 'discord.js'
import { guildCtxManager, workerClientMap } from '../index.js'
import { Listener } from '@sapphire/framework'

export class GuildMemberAddListener extends Listener {
  public override async run(member: GuildMember) {
    if (workerClientMap.has(member.id)) {
      await guildCtxManager.get(member.guild).addBot(member.id)
    }
  }
}

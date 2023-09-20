import {
  ChannelType,
  type DMChannel,
  type NonThreadGuildBasedChannel,
  PermissionFlagsBits,
} from 'discord.js'
import { guildCtxManager, workerClientMap } from '../index.js'
import { Listener } from '@sapphire/framework'
import { newVoiceBasedChannelId } from '../id.js'

export class ChannelUpdateListener extends Listener {
  public override run(
    oldChannel: DMChannel | NonThreadGuildBasedChannel,
    newChannel: DMChannel | NonThreadGuildBasedChannel,
  ) {
    const clientId = newChannel.client.user.id
    if (
      oldChannel.type === ChannelType.GuildStageVoice &&
      newChannel.type === ChannelType.GuildStageVoice &&
      oldChannel
        .permissionsFor(clientId)
        ?.missing(PermissionFlagsBits.RequestToSpeak) &&
      newChannel
        .permissionsFor(clientId)
        ?.has(PermissionFlagsBits.RequestToSpeak)
    ) {
      const connectionManager = guildCtxManager.get(
        newChannel.guild,
      ).connectionManager
      const readChannelId = connectionManager.channelMap.get(
        newVoiceBasedChannelId(newChannel),
      )

      if (readChannelId === undefined) return
      const workerId =
        connectionManager.get(readChannelId)?.connection.joinConfig.group
      if (workerId === undefined) return
      workerClientMap
        .get(workerId)
        ?.guilds.cache.get(newChannel.guildId)
        ?.members.me?.voice.setRequestToSpeak(true)
    }
  }
}

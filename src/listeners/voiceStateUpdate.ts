import {
  ChannelType,
  VoiceState,
  type VoiceBasedChannel,
  DiscordAPIError,
} from 'discord.js'
import { guildCtxManager } from '../index.js'
import debug from 'debug'
const debug__ErrorHandler = debug('events/voiceStateUpdate.js:ErrorHandler')
import { Listener } from '@sapphire/framework'
import { deleteUserCache } from '../db.js'
import { LeaveCause } from '../connectionCtx.js'

export class VoiceStateUpdateListener extends Listener {
  public override async run(oldState: VoiceState, newState: VoiceState) {
    if (
      newState.channel?.type === ChannelType.GuildStageVoice &&
      newState.member?.id === newState.client.user?.id &&
      newState.suppress
    ) {
      try {
        await newState.setSuppressed(false)
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          if (error.code !== 50001) throw error
          try {
            if (newState.requestToSpeakTimestamp) return
            await newState.setRequestToSpeak(true)
          } catch (err) {
            debug__ErrorHandler(err)
          }
        }
      }
      return
    }
    if (oldState.channel === null) return
    const guildCtx = guildCtxManager.get(newState.guild)
    if (
      newState.channelId == null &&
      (await guildCtx.bots).includes(newState.id) &&
      [...guildCtx.connectionManager.values()].find(
        (connectionCtx) =>
          connectionCtx.connection.joinConfig.channelId ===
            oldState.channelId &&
          connectionCtx.connection.joinConfig.group === oldState.id,
      )
    ) {
      guildCtx.leave({
        voiceChannel: oldState.channel as VoiceBasedChannel,
        cause: LeaveCause.disconnected,
      })
    } else if (
      guildCtx.connectionManager.channelMap.has(oldState.channel) &&
      oldState.channel.members.size === 1 &&
      oldState.channel.members.every((member) =>
        [...guildCtx.connectionManager.values()].find(
          (connectionCtx) =>
            connectionCtx.connection.joinConfig.channelId ===
              oldState.channelId &&
            connectionCtx.connection.joinConfig.group === member.id,
        ),
      )
    ) {
      guildCtx.leave({
        voiceChannel: oldState.channel as VoiceBasedChannel,
        cause: LeaveCause.noUser,
      })
    } else if (
      oldState.channel !== newState.channel &&
      guildCtx.connectionManager.channelMap.has(oldState.channel)
    ) {
      deleteUserCache(oldState.id)
    }
  }
}

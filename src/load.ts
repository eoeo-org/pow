import type { SapphireClient } from '@sapphire/framework'
import { loadStates, deleteState } from './db.js'
import { type connectionStates } from '@prisma/client'
import type { GuildCtxManager } from './guildCtx.js'
import type { Client, VoiceBasedChannel } from 'discord.js'
import type {
  GuildTextBasedChannelId,
  UserId,
  VoiceBasedChannelId,
} from './id.js'

const rejoin = async ({
  connectionState,
  client,
  guildCtxManager,
}: {
  connectionState: connectionStates
  client: SapphireClient
  guildCtxManager: GuildCtxManager
}) => {
  try {
    const guild = await client.guilds.fetch(connectionState.guild.toString())

    const guildCtx = guildCtxManager.get(guild)
    const voiceChannel = (await client.channels.fetch(
      connectionState.voiceChannel.toString(),
    )) as VoiceBasedChannel | null
    if (voiceChannel === null || voiceChannel.members.size === 0) throw Error()

    const voiceChannelId =
      connectionState.voiceChannel.toString() as VoiceBasedChannelId
    const readChannelId =
      connectionState.readChannel.toString() as GuildTextBasedChannelId
    const skipUser = new Set(connectionState.skipUser.split(',') as UserId[])

    return guildCtx.join({ voiceChannelId, readChannelId, skipUser })
  } catch {
    return deleteState({
      voiceChannelId: connectionState.voiceChannel,
    })
  }
}

export const load = async ({
  client,
  guildCtxManager,
}: {
  client: SapphireClient
  guildCtxManager: GuildCtxManager
}) => {
  const rows = await loadStates()
  const promises: Promise<void | Client>[] = []
  rows.forEach((row) => {
    const promise = rejoin({ connectionState: row, client, guildCtxManager })

    promises.push(promise)
  })
  await Promise.allSettled(promises)
}

import {
  Client,
  type Guild,
  type VoiceBasedChannel,
  type GuildTextBasedChannel,
  ChannelType,
} from 'discord.js'
import { WorkerClientMap } from './worker.js'
import { workerClientMap, workerReady } from './index.js'
import { ConnectionCtxManager, LeaveCause } from './connectionCtx.js'
import {
  AlreadyJoinedError,
  NoWorkerError,
  NotReadyWorkerError,
} from './errors/index.js'

const getBots = async (guild: Guild, worker: WorkerClientMap) => {
  const results = await Promise.allSettled(
    Array.from(worker.keys()).map((id) => guild.members.fetch(id)),
  )
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value.id : []))
    .sort((a, b) => Number(BigInt(a) - BigInt(b)))
}

export class GuildContext {
  guild: Guild
  bots: Promise<string[]>
  connectionManager: ConnectionCtxManager

  constructor(guild: Guild, worker: WorkerClientMap) {
    this.guild = guild
    this.bots = getBots(guild, worker)
    this.connectionManager = new ConnectionCtxManager()
  }

  async join(
    voiceChannel: VoiceBasedChannel,
    readChannel: GuildTextBasedChannel,
  ) {
    if (this.connectionManager.channelMap.has(voiceChannel))
      throw new AlreadyJoinedError()

    const vcArray = (await voiceChannel.guild.channels.fetch())
      .map((v) => {
        if (
          (v?.type === ChannelType.GuildVoice ||
            v?.type === ChannelType.GuildStageVoice) &&
          v.joinable
        ) {
          return v
        } else {
          return null
        }
      })
      .flatMap((data) => {
        return data ?? []
      })
      .sort((a, b) => a.rawPosition - b.rawPosition)

    let workerId = (await this.bots)[vcArray.indexOf(voiceChannel)]

    if (workerId === undefined) {
      workerId = (await this.bots).find(
        (botId) =>
          ![...this.connectionManager.values()]
            .map((connectionCtx) => connectionCtx.connection.joinConfig.group)
            .includes(botId),
      )
    } else {
      const oldConnectionCtx = [...this.connectionManager.values()].find(
        (v) => v.connection.joinConfig.group === workerId,
      )
      if (oldConnectionCtx !== undefined) {
        const oldVoiceChannel = await voiceChannel.client.channels
          .fetch(oldConnectionCtx.connection.joinConfig.channelId!)
          .then((channels) => {
            return channels?.type === ChannelType.GuildVoice ? channels : null
          })
        const forOldCtxWorkerId = (await this.bots).find(
          (botId) =>
            ![...this.connectionManager.values()]
              .map((connectionCtx) => connectionCtx.connection.joinConfig.group)
              .includes(botId) && botId !== workerId,
        )
        if (forOldCtxWorkerId === undefined) {
          throw new NoWorkerError()
        }
        this.leave({ voiceChannel: oldVoiceChannel! })
        this.connectionManager.connectionJoin(
          oldVoiceChannel!,
          this.guild.id,
          oldConnectionCtx.readChannel,
          workerClientMap.get(forOldCtxWorkerId)!,
        )
      }
    }
    if (workerId === undefined) {
      throw new NoWorkerError()
    }
    const worker = workerClientMap.get(workerId)!
    this.connectionManager.connectionJoin(
      voiceChannel,
      this.guild.id,
      readChannel,
      worker,
    )
    return worker
  }
  leave({
    voiceChannel,
    cause,
  }: {
    voiceChannel: VoiceBasedChannel
    cause?: LeaveCause | undefined
  }) {
    const workerId = this.connectionManager.connectionLeave({
      voiceChannel: voiceChannel,
      cause,
    })
    return workerId
  }
  async addBot(workerId: string) {
    ;(await this.bots).push(workerId)
  }
  leaveAll({ cause }: { cause: LeaveCause }) {
    for (const voiceChannel of this.connectionManager.channelMap.keys()) {
      this.leave({ voiceChannel, cause })
    }
  }
}

export class GuildCtxManager extends Map<Guild, GuildContext> {
  client: Client
  constructor(client: Client) {
    super()
    this.client = client
  }
  override get(guild: Guild) {
    if (this.has(guild)) return super.get(guild)!
    if (!workerReady) throw new NotReadyWorkerError()
    const guildContext = new GuildContext(guild, workerClientMap)
    this.set(guild, guildContext)
    return guildContext
  }
  override delete(guild: Guild) {
    this.get(guild).leaveAll({ cause: LeaveCause.reset })
    return super.delete(guild)
  }
}

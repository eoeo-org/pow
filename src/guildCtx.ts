import {
  Client,
  type Guild,
  VoiceChannel,
  type GuildTextBasedChannel,
} from 'discord.js'
import { WorkerClientMap } from './worker.js'
import { workerClientMap } from './index.js'
import { ConnectionCtxManager } from './connectionCtx.js'

const getBots = async (guild: Guild, worker: WorkerClientMap) => {
  const results = await Promise.allSettled(
    Array.from(worker.keys()).map((id) => guild.members.fetch(id)),
  )
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value.id : []))
}

class GuildContext {
  guild: Guild
  bots: Promise<string[]>
  standbyBots: Promise<string[]>
  connectionManager: ConnectionCtxManager

  constructor(guild: Guild, worker: WorkerClientMap) {
    this.guild = guild
    this.bots = getBots(guild, worker)
    this.standbyBots = this.bots
    this.connectionManager = new ConnectionCtxManager()
  }

  async join(voiceChannel: VoiceChannel, readChannel: GuildTextBasedChannel) {
    const workerId = (await this.standbyBots).sort()[0]
    if (workerId === undefined) {
      throw Error('No worker')
    }
    const worker = workerClientMap.get(workerId)!
    try {
      this.connectionManager.connectionJoin(
        voiceChannel,
        this.guild.id,
        readChannel,
        worker,
      )
      ;(await this.standbyBots).shift()
    } catch {}
    return worker
  }
  async leave(voiceChannel: VoiceChannel) {
    if (!this.connectionManager.channelMap.has(voiceChannel)) throw Error()
    const workerId = this.connectionManager.connectionLeave(voiceChannel)
    ;(await this.standbyBots).push(workerId)
    return workerId
  }
  async addBot(workerId: string) {
    ;(await this.bots).push(workerId)
    ;(await this.standbyBots).push(workerId)
  }
  async resetBots(workerClientMap: WorkerClientMap) {
    for (const voiceChannel of this.connectionManager.channelMap.keys()) {
      try {
        await this.leave(voiceChannel)
      } catch {}
    }
    this.bots = getBots(this.guild, workerClientMap)
    this.standbyBots = this.bots
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
    const guildContext = new GuildContext(guild, workerClientMap)
    this.set(guild, guildContext)
    return guildContext
  }
}

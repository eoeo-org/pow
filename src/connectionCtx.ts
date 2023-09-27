import debug from 'debug'
const debug__ConnectionContext = debug('connectionCtx.js:ConnectionContext')
const debug__ErrorHandler = debug('connectionCtx.js:ErrorHandler')

import {
  joinVoiceChannel,
  entersState,
  createAudioResource,
  StreamType,
  createAudioPlayer,
  AudioPlayerStatus,
  AudioPlayer,
  VoiceConnection,
} from '@discordjs/voice'

import {
  Client,
  Message,
  ChatInputCommandInteraction,
  type DiscordErrorData,
  User,
  Routes,
} from 'discord.js'
import { Queue } from './utils.js'
import { fetchAudioStream } from './voiceRead.js'
import { deleteState, getUserSetting, setState } from './db.js'
import { Readable } from 'node:stream'
import {
  AlreadyJoinedError,
  AlreadyUsedChannelError,
  DBError,
  FetchResponseError,
  HandleInteractionError,
  HandleInteractionErrorType,
} from './errors/index.js'
import {
  newUserId,
  type GuildTextBasedChannelId,
  type UserId,
  type VoiceBasedChannelId,
} from './id.js'

export const LeaveCause = {
  command: 'leaveコマンドが実行されました。',
  disconnected: 'BOTがVCから切断されました。',
  noUser: 'ユーザーがVCから居なくなりました。',
  rejoin: 'rejoinコマンドが実行されました。',
  reset: 'resetコマンドが実行されました。',
} as const

export type LeaveCause = (typeof LeaveCause)[keyof typeof LeaveCause]

export class ConnectionContext {
  readChannelId: GuildTextBasedChannelId
  readQueue: Queue<{ audio: Readable }>
  player: AudioPlayer | null = null
  connection: VoiceConnection
  skipUser: Set<UserId>
  readonly client: Client

  constructor({
    readChannelId,
    connection,
    client,
    skipUser = new Set(),
  }: {
    readChannelId: GuildTextBasedChannelId
    connection: VoiceConnection
    client: Client
    skipUser?: Set<UserId>
  }) {
    this.readChannelId = readChannelId
    this.readQueue = new Queue(this.#readMessage.bind(this))
    this.connection = connection
    this.client = client
    this.skipUser = skipUser

    setState(this)
  }

  async #readMessage({ audio }: { audio: Readable }) {
    this.player = createAudioPlayer()
    const resource = createAudioResource(audio, {
      inputType: StreamType.Arbitrary,
    })
    this.connection.subscribe(this.player)
    this.player.play(resource)
    await entersState(this.player, AudioPlayerStatus.Playing, 5e3)
    debug__ConnectionContext('read started')
    await entersState(this.player, AudioPlayerStatus.Idle, 2 ** 31 - 1)
    debug__ConnectionContext('read finished')
  }

  async addMessage(
    text: string,
    ctx: Message | ChatInputCommandInteraction<'cached'>,
    setting: {
      speaker?: string | null
      pitch?: number | null
      speed?: number | null
    } = {},
  ) {
    try {
      const userSetting = await getUserSetting(
        ctx instanceof Message ? ctx.author.id : ctx.user.id,
      )
      debug__ConnectionContext('fetching audio')
      const audioStream = await fetchAudioStream(
        text,
        setting.speaker ?? userSetting.speaker,
        setting.pitch ?? userSetting.pitch,
        setting.speed ?? userSetting.speed,
      )
      if (audioStream === null) return
      const audio = Readable.fromWeb(audioStream)
      debug__ConnectionContext('got response, adding to queue')
      this.readQueue.add({ audio })
    } catch (error) {
      console.error(error)
      const message =
        error instanceof FetchResponseError
          ? { embeds: [FetchResponseError.getEmbed(error)] }
          : error instanceof DBError
          ? { embeds: [DBError.getEmbed(error)] }
          : {
              embeds: [
                {
                  color: 0xff0000,
                  title: 'リクエストエラー',
                  description: `${error}`,
                },
              ],
            }

      if (ctx instanceof ChatInputCommandInteraction) {
        return await ctx.followUp(message)
      } else {
        return await ctx.reply(message).catch((err: DiscordErrorData) => {
          if (err.code !== 50013) throw err
          debug__ErrorHandler(
            `Error code ${err.code}: Missing send messages permission.`,
          )
        })
      }
    }
  }

  async updateSkipUser(user: User, isSkip: boolean) {
    if (isSkip) {
      this.skipUser.add(newUserId(user))
    } else {
      this.skipUser.delete(newUserId(user))
    }
    await setState(this)
  }
}

export class ConnectionCtxManager extends Map<
  GuildTextBasedChannelId,
  ConnectionContext
> {
  channelMap: Map<VoiceBasedChannelId, GuildTextBasedChannelId>
  constructor() {
    super()
    this.channelMap = new Map()
  }
  override get(channelId: GuildTextBasedChannelId | undefined) {
    if (channelId === undefined) return undefined
    return super.get(channelId)
  }
  getWithVoiceChannelId(voiceChannelId: VoiceBasedChannelId) {
    return this.get(this.channelMap.get(voiceChannelId))
  }

  connectionJoin({
    voiceChannelId,
    guildId,
    readChannelId,
    worker,
    client,
    skipUser = new Set(),
  }: {
    voiceChannelId: VoiceBasedChannelId
    guildId: string
    readChannelId: GuildTextBasedChannelId
    worker: Client
    client: Client
    skipUser?: Set<UserId>
  }) {
    if (this.channelMap.has(voiceChannelId)) throw new AlreadyJoinedError()
    const existingJoinConfig = this.get(readChannelId)?.connection.joinConfig
    if (existingJoinConfig !== undefined)
      throw new AlreadyUsedChannelError(
        existingJoinConfig.guildId,
        existingJoinConfig.channelId ?? '',
      )
    this.channelMap.set(voiceChannelId, readChannelId)
    const connection = joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: guildId,
      group: worker.user!.id,
      adapterCreator: worker.guilds.cache.get(guildId)!.voiceAdapterCreator,
    })
    connection.once('disconnect', () => {
      debug__ConnectionContext('vc disconnected')
      this.get(readChannelId)!.readQueue.purge()
      connection?.destroy()
      this.delete(readChannelId)
    })
    const connectionContext = new ConnectionContext({
      readChannelId,
      connection,
      client,
      skipUser,
    })
    this.set(readChannelId, connectionContext)
    return connectionContext
  }
  connectionLeave({
    voiceChannelId,
    cause = undefined,
  }: {
    voiceChannelId: VoiceBasedChannelId
    cause?: LeaveCause | undefined
  }) {
    const readChannelId = this.channelMap.get(voiceChannelId)
    if (readChannelId === undefined)
      throw new HandleInteractionError(
        HandleInteractionErrorType.userNotWithBot,
      )
    const connectionCtx = this.get(this.channelMap.get(voiceChannelId))
    const connection = connectionCtx?.connection
    if (connection === undefined) throw Error('connection is null')
    const workerId = connection.joinConfig.group
    connection.disconnect()
    this.channelMap.delete(voiceChannelId)
    this.delete(readChannelId)
    if (cause !== undefined) {
      connectionCtx!.client.rest
        .post(Routes.channelMessages(readChannelId), {
          body: {
            embeds: [
              {
                color: 0x00ff00,
                title: 'ボイスチャンネルから退出しました。',
                description: `${cause}`,
                footer: { text: 'またのご利用をお待ちしております。' },
              },
            ],
          },
        })
        .catch((err: DiscordErrorData) => {
          if (![50013, 10003].includes(err.code)) throw err
        })
    }
    deleteState({ voiceChannelId })
    return workerId
  }
}

import debug from 'debug'
const debug__ConnectionContext = debug('connectionCtx.js:ConnectionContext')
const debug__ErrorHandler = debug('connectionCtx.js:ErrorHandler')

import { AxiosError } from 'axios'
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
  VoiceChannel,
  Message,
  ChatInputCommandInteraction,
  type DiscordErrorData,
  type GuildTextBasedChannel,
} from 'discord.js'
import { Queue } from './utils.js'
import { fetchAudioStream } from './voiceRead.js'
import { getUserSetting } from './db.js'

class ConnectionContext {
  readChannel: GuildTextBasedChannel
  readQueue: any
  player: AudioPlayer | null = null
  connection: VoiceConnection

  constructor(readChannel: GuildTextBasedChannel, connection: VoiceConnection) {
    this.readChannel = readChannel
    this.readQueue = new Queue(this._readMessage.bind(this))
    this.connection = connection
  }

  private async _readMessage({ audioStream }) {
    this.player = createAudioPlayer()
    const resource = createAudioResource(audioStream, {
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
  ) {
    const userSetting = await getUserSetting(
      ctx instanceof Message ? ctx.author.id : ctx.user.id,
    )
    try {
      debug__ConnectionContext('fetching audio')
      const audioStream = await fetchAudioStream(
        text,
        userSetting?.speaker,
        userSetting?.pitch,
        userSetting?.speed,
      )

      debug__ConnectionContext('got response, adding to queue')
      this.readQueue.add({ audioStream })
    } catch (error) {
      if (error instanceof AxiosError) {
        debug__ConnectionContext(
          `Request error: ${error.response?.status}: ${error.response?.statusText}`,
        )
        if (ctx instanceof ChatInputCommandInteraction) {
          return ctx.followUp({
            embeds: [
              {
                color: 0xff0000,
                title: 'APIリクエストエラー',
                description: `${error.response?.status}: ${error.response?.statusText}`,
              },
            ],
          })
        } else {
          return ctx
            .reply({
              embeds: [
                {
                  color: 0xff0000,
                  title: 'APIリクエストエラー',
                  description: `${error.response?.status}: ${error.response?.statusText}`,
                },
              ],
            })
            .catch((err: DiscordErrorData) => {
              if (err.code !== 50013) throw err
              debug__ErrorHandler(
                `Error code ${err.code}: Missing send messages permission.`,
              )
            })
        }
      }
    }
  }
}

export class ConnectionCtxManager extends Map<
  GuildTextBasedChannel,
  ConnectionContext
> {
  channelMap: Map<VoiceChannel, GuildTextBasedChannel>
  constructor() {
    super()
    this.channelMap = new Map()
  }

  connectionJoin(
    voiceChannel: VoiceChannel,
    guildId: string,
    readChannel: GuildTextBasedChannel,
    worker: Client,
  ) {
    if (this.channelMap.get(voiceChannel) !== undefined)
      throw new Error('Already joined')
    this.channelMap.set(voiceChannel, readChannel)
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guildId,
      group: worker.user!.id,
      adapterCreator: worker.guilds.cache.get(guildId)!.voiceAdapterCreator,
    })
    connection.once('disconnect', () => {
      debug__ConnectionContext('vc disconnected')
      this.get(readChannel)!.readQueue.purge()
      connection?.destroy()
      this.delete(readChannel)
    })
    this.set(readChannel, new ConnectionContext(readChannel, connection))
  }
  connectionLeave(voiceChannel: VoiceChannel) {
    const readChannel = this.channelMap.get(voiceChannel)
    if (readChannel == null) throw Error()
    const connection = this.get(readChannel)?.connection
    if (connection == null) return ''
    const workerId = connection.joinConfig.group
    connection.disconnect()
    this.channelMap.delete(voiceChannel)
    this.delete(readChannel)
    return workerId
  }
}

import debug from 'debug'
const debug__GuildContext = debug('voiceRead.js:GuildContext')
const debug__ErrorHandler = debug('voiceRead.js:ErrorHandler')

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
  VoiceConnectionStatus,
} from '@discordjs/voice'

import {
  Client,
  TextChannel,
  type Guild,
  type GuildBasedChannel,
  VoiceChannel,
  Message,
  ChatInputCommandInteraction,
  type DiscordErrorData,
} from 'discord.js'
import { Queue } from './utils.js'
import { fetchAudioStream } from './voiceRead.js'
import { getUserSetting } from './db.js'

class GuildContext {
  guild: Guild
  readQueue: any
  player: AudioPlayer | null = null
  textChannel: GuildBasedChannel | null = null
  voiceChannel: GuildBasedChannel | null = null
  connection: VoiceConnection | null = null

  constructor(guild: Guild) {
    this.guild = guild
    this.readQueue = new Queue(this._readMessage.bind(this))
    this.cleanChannels()
  }

  async _readMessage({ audioStream }) {
    if (this.connection === null) return
    this.player = createAudioPlayer()
    const resource = createAudioResource(audioStream, {
      inputType: StreamType.Arbitrary,
    })
    this.connection.subscribe(this.player)
    this.player.play(resource)
    await entersState(this.player, AudioPlayerStatus.Playing, 5e3)
    debug__GuildContext('read started')
    await entersState(this.player, AudioPlayerStatus.Idle, 2 ** 31 - 1)
    debug__GuildContext('read finished')
  }

  cleanChannels() {
    this.textChannel = null
    this.voiceChannel = null
    this.connection = null
  }

  isJoined() {
    return (
      this.textChannel !== null &&
      this.voiceChannel !== null &&
      this.connection !== null &&
      ![
        VoiceConnectionStatus.Destroyed,
        VoiceConnectionStatus.Disconnected,
      ].includes(this.connection.state.status)
    )
  }

  async join(textChannel: TextChannel, voiceChannel: VoiceChannel) {
    if (this.isJoined()) return
    this.textChannel = this.guild.channels.resolve(textChannel)
    this.voiceChannel = this.guild.channels.resolve(voiceChannel)
    this.connection = await joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
    })
    this.connection.once('disconnect', () => {
      this.leave()
    })
  }

  leave() {
    this.readQueue.purge()
    this.connection?.destroy()
    this.cleanChannels()
  }

  async addMessage(text: string, ctx: Message | ChatInputCommandInteraction) {
    if (!this.isJoined()) return false

    const userSetting = await getUserSetting(
      ctx instanceof Message ? ctx.author.id : ctx.user.id,
    )
    try {
      debug__GuildContext('fetching audio')
      const audioStream = await fetchAudioStream(
        text,
        userSetting?.speaker,
        userSetting?.pitch,
        userSetting?.speed,
      )

      debug__GuildContext('got response, adding to queue')
      this.readQueue.add({ audioStream })
    } catch (error) {
      if (error instanceof AxiosError) {
        debug__GuildContext(
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

export class GuildCtxManager extends Map {
  client: Client
  constructor(client: Client) {
    super()
    this.client = client
  }
  override get(guild: Guild) {
    guild = this.client.guilds.resolve(guild)
    if (this.has(guild.id)) return super.get(guild.id)

    const guildContext = new GuildContext(guild)
    if (!guildContext.guild) return
    this.set(guild.id, guildContext)
    return guildContext
  }
}

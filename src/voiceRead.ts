import debug from 'debug'
const debug__GuildContext = debug('voiceRead.js:GuildContext')
const debug__ErrorHandler = debug('voiceRead.js:ErrorHandler')

import axios, { AxiosError } from 'axios'
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

import { createPool, type PoolConnection } from 'mariadb'

import {
  Client,
  TextChannel,
  type Guild,
  type GuildBasedChannel,
  VoiceChannel,
  Message,
  ChatInputCommandInteraction,
} from 'discord.js'
import { Queue, getProperty } from './utils.js'

export interface UserSetting {
  id?: bigint
  speaker: 'show' | 'haruka' | 'hikari' | 'takeru' | 'santa' | 'bear'
  pitch: number
  speed: number
  isDontRead: 0 | 1
}

const pool = createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
})
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

  async _getUserSetting(id: string) {
    let conn: PoolConnection | undefined = undefined
    try {
      conn = await pool.getConnection()
      const rows: Array<UserSetting | undefined> = await conn.query(
        'SELECT * FROM userSetting WHERE id = ?',
        [id],
      )
      if (rows[0] === undefined) {
        await this._randomizeUserSetting(id)
        return (
          await conn.query('SELECT * FROM userSetting WHERE id = ?', [id])
        )[0] as UserSetting
      }
      return rows[0]
    } catch (err) {
      throw err
    } finally {
      if (conn) conn.release()
    }
  }

  async _randomizeUserSetting(id: string) {
    let conn: PoolConnection | undefined = undefined,
      rows: Array<UserSetting> | undefined = undefined
    const voiceList = ['show', 'haruka', 'hikari', 'takeru', 'santa', 'bear']
    try {
      conn = await pool.getConnection()
      await conn.query(
        `INSERT IGNORE INTO userSetting VALUES (?, ?, ?, ?, ?)`,
        [id, 0, 0, 0, 0],
      )
      await conn.query(
        `UPDATE userSetting SET
                          speaker='${
                            voiceList[
                              Math.floor(Math.random() * voiceList.length)
                            ]
                          }',
                          pitch=${
                            Math.floor(Math.random() * (200 + 1 - 50)) + 50
                          },
                          speed=${
                            Math.floor(Math.random() * (400 + 1 - 50)) + 50
                          }
                        WHERE id = ?`,
        [id],
      )
      rows = await conn.query('SELECT * FROM userSetting WHERE id = ?', [id])
    } catch (err) {
      throw err
    } finally {
      if (conn) conn.release()
      if (rows![0]) delete rows![0].id
      return rows![0]
    }
  }

  async _setUserSetting(id: bigint, key: string, value: string | number) {
    let conn: PoolConnection | undefined = undefined
    try {
      conn = await pool.getConnection()
      await conn.query(
        `UPDATE userSetting SET ${key}=${
          typeof value === 'string' ? value : Number(value)
        } WHERE id = ?`,
        [id],
      )
    } catch (err) {
      throw err
    } finally {
      if (conn) conn.release()
    }
  }

  async addMessage(text: string, ctx: Message | ChatInputCommandInteraction) {
    if (!this.isJoined()) return false

    const userSetting = await this._getUserSetting(
      ctx instanceof Message ? ctx.author.id : ctx.user.id,
    )
    try {
      debug__GuildContext('fetching audio')
      const audioStream = await this._fetchAudioStream(
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
            .catch((err) => {
              if (err.code !== 50013) throw err
              debug__ErrorHandler(
                `Error code ${err.code}: Missing send messages permission.`,
              )
            })
        }
      }
    }
  }

  async _fetchAudioStream(
    text: string,
    speaker: string,
    pitch: number,
    speed: number,
  ) {
    return await axios
      .post(
        'https://api.voicetext.jp/v1/tts',
        new URLSearchParams({
          text: text,
          speaker: speaker,
          pitch: pitch.toString(),
          speed: speed.toString(),
          format: 'mp3',
        }),
        {
          auth: { username: process.env.VOICETEXT_API_KEY, password: '' },
          responseType: 'stream',
        },
      )
      .then(getProperty('data'))
      .catch((err) => {
        debug__ErrorHandler(
          `Error while requesting audio: ${err.response.status} ${err.response.statusText}`,
        )
        throw err
      })
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

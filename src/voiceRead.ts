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

import mariadb from 'mariadb'
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
})

import { Client, type Guild, type GuildBasedChannel } from 'discord.js'
import { Queue, getProperty } from './utils.js'

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

  async join(textChannel, voiceChannel) {
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
    let conn, rows
    try {
      conn = await pool.getConnection()
      rows = await conn.query('SELECT * FROM userSetting WHERE id = ?', [id])
      if (rows[0] === undefined) {
        await this._randomizeUserSetting(id)
        rows = await conn.query('SELECT * FROM userSetting WHERE id = ?', [id])
      }
    } catch (err) {
      throw err
    } finally {
      if (conn) conn.release()
      return rows[0]
    }
  }

  async _randomizeUserSetting(id: string) {
    let conn, rows
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
      if (rows[0]) delete rows[0].id
      return rows[0]
    }
  }

  async _setUserSetting(id, key, value) {
    let conn
    try {
      conn = await pool.getConnection()
      await conn.query(
        `UPDATE userSetting SET ${key}=${
          isNaN(value) ? value : Number(value)
        } WHERE id = ?`,
        [id],
      )
    } catch (err) {
      throw err
    } finally {
      if (conn) conn.release()
    }
  }

  async addMessage(text, ctx) {
    if (!this.isJoined()) return false

    const userSetting = await this._getUserSetting(
      ctx.content ? ctx.author.id : ctx.user.id,
    )
    try {
      debug__GuildContext('fetching audio')
      const audioStream = await this._fetchAudioStream({
        text: text,
        ...userSetting,
      })

      debug__GuildContext('got response, adding to queue')
      this.readQueue.add({ audioStream })
    } catch (error) {
      if (error instanceof AxiosError) {
        debug__GuildContext(
          `Request error: ${error.response?.status}: ${error.response?.statusText}`,
        )
        if (ctx.replied) {
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

  async _fetchAudioStream(params) {
    return await axios
      .post(
        'https://api.voicetext.jp/v1/tts',
        new URLSearchParams({ ...params, format: 'mp3' }),
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
  constructor(client) {
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

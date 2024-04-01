import { createPool, SqlError, type PoolConnection } from 'mariadb'
import { DBError } from './errors/index.js'
import type { VoiceBasedChannel } from 'discord.js'
import type { ConnectionContext } from './connectionCtx.js'

export interface UserSetting {
  id: bigint
  speaker: 'show' | 'haruka' | 'hikari' | 'takeru' | 'santa' | 'bear'
  pitch: number
  speed: number
  isDontRead: 0 | 1
}

export interface ConnectionState {
  voiceChannel: bigint
  guild: bigint
  readChannel: bigint
  skipUser: string
}

const toConnectionState = (
  connectionContext: ConnectionContext,
): ConnectionState => {
  return {
    voiceChannel: BigInt(connectionContext.connection.joinConfig.channelId!),
    guild: BigInt(connectionContext.connection.joinConfig.guildId),
    readChannel: BigInt(connectionContext.readChannelId),
    skipUser: [...connectionContext.skipUser].join(),
  }
}

const userSettings = new Map<string, UserSetting>()

const pool = createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  compress: true,
})

export async function getUserSetting(id: string): Promise<UserSetting> {
  if (userSettings.has(id)) return userSettings.get(id)!
  let conn: PoolConnection | undefined = undefined
  try {
    conn = await pool.getConnection()
    const rows: UserSetting[] = await conn.query(
      'SELECT * FROM userSetting WHERE id = ?',
      [id],
    )
    if (rows[0] === undefined) {
      return await randomizeUserSetting(id)
    }
    userSettings.set(id, rows[0])
    return rows[0]
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError('ユーザー設定の取得に失敗しました。', { cause: err })
    }
    throw err
  } finally {
    if (conn) void conn.release()
  }
}

export async function randomizeUserSetting(id: string): Promise<UserSetting> {
  userSettings.delete(id)
  let conn: PoolConnection | undefined = undefined
  const voiceList: UserSetting['speaker'][] = [
    'show',
    'haruka',
    'hikari',
    'takeru',
    'santa',
    'bear',
  ]
  const speaker = voiceList[Math.floor(Math.random() * voiceList.length)]!
  const pitch = Math.floor(Math.random() * (200 + 1 - 50)) + 50
  const speed = Math.floor(Math.random() * (400 + 1 - 50)) + 50
  const isDontRead = 0
  try {
    conn = await pool.getConnection()
    await conn.query(
      'INSERT INTO userSetting SET id=?, speaker=?, pitch=?, speed=?, isDontRead=?' +
        ' ON DUPLICATE KEY UPDATE speaker=VALUE(speaker), pitch=VALUE(pitch), speed=VALUE(speed), isDontRead=VALUE(isDontRead)',
      [id, speaker, pitch, speed, isDontRead],
    )
    return { id: BigInt(id), speaker, pitch, speed, isDontRead }
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError('ランダム値の設定に失敗しました。', {
        cause: err,
      })
    }
    throw err
  } finally {
    if (conn) void conn.release()
  }
}

export async function setUserSetting(
  id: string,
  key: string,
  value: string | number,
) {
  userSettings.delete(id)
  let conn: PoolConnection | undefined = undefined
  try {
    conn = await pool.getConnection()
    await conn.query(`UPDATE userSetting SET ${key}=? WHERE id = ?`, [
      value,
      id,
    ])
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError(`${key}の設定に失敗しました。`, {
        cause: err,
      })
    }
    throw err
  } finally {
    if (conn) void conn.release()
  }
}

export function deleteUserCache(id: string) {
  userSettings.delete(id)
}

export async function loadStates() {
  let conn: PoolConnection | undefined = undefined
  try {
    conn = await pool.getConnection()
    await conn.query(
      'CREATE TABLE IF NOT EXISTS connectionStates (voiceChannel BIGINT UNSIGNED NOT NULL PRIMARY KEY, guild BIGINT UNSIGNED NOT NULL, readChannel BIGINT UNSIGNED NOT NULL, skipUser TEXT)',
    )
    const rows: ConnectionState[] = await conn.query(
      'SELECT * FROM connectionStates',
    )
    return rows
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError(err.message, { cause: err })
    }
    throw err
  } finally {
    if (conn) void conn.release()
  }
}

export async function setState(connectionContext: ConnectionContext) {
  const connectionState = toConnectionState(connectionContext)
  let conn: PoolConnection | undefined = undefined
  try {
    conn = await pool.getConnection()
    await conn.query(
      'INSERT IGNORE INTO connectionStates SET voiceChannel=?, guild=?, readChannel=?, skipUser=? ON DUPLICATE KEY UPDATE guild=VALUE(guild), readChannel=VALUE(readChannel), skipUser=VALUE(skipUser)',
      [
        connectionState.voiceChannel,
        connectionState.guild,
        connectionState.readChannel,
        connectionState.skipUser,
        connectionState.voiceChannel,
      ],
    )
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError(err.message, { cause: err })
    }
    throw err
  } finally {
    if (conn) void conn.release()
  }
}

export async function deleteState({
  voiceChannel,
  voiceChannelId,
}: {
  voiceChannel?: VoiceBasedChannel
  voiceChannelId?: string
}) {
  let conn: PoolConnection | undefined = undefined
  try {
    conn = await pool.getConnection()
    await conn.query('DELETE FROM connectionStates WHERE voiceChannel=?', [
      voiceChannel?.id ?? voiceChannelId,
    ])
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError(err.message, { cause: err })
    }
    throw err
  } finally {
    if (conn) void conn.release()
  }
}

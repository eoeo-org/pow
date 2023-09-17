import { createPool, SqlError, type PoolConnection } from 'mariadb'
import { DBError } from './errors/index.js'

export interface UserSetting {
  id: bigint
  speaker: 'show' | 'haruka' | 'hikari' | 'takeru' | 'santa' | 'bear'
  pitch: number
  speed: number
  isDontRead: 0 | 1
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

export async function getUserSetting(id: string) {
  if (userSettings.has(id)) return userSettings.get(id)!
  let conn: PoolConnection | undefined = undefined
  try {
    conn = await pool.getConnection()
    const rows: Array<UserSetting | undefined> = await conn.query(
      'SELECT * FROM userSetting WHERE id = ?',
      [id],
    )
    if (rows[0] === undefined) {
      await randomizeUserSetting(id)
      return (
        await conn.query('SELECT * FROM userSetting WHERE id = ?', [id])
      )[0] as UserSetting
    }
    userSettings.set(id, rows[0])
    return rows[0]
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError('ユーザー設定の取得に失敗しました。', { cause: err })
    }
    throw err
  } finally {
    if (conn) conn.release()
  }
}

export async function randomizeUserSetting(id: string) {
  userSettings.delete(id)
  let conn: PoolConnection | undefined = undefined,
    rows: Array<UserSetting> | undefined = undefined
  const voiceList = ['show', 'haruka', 'hikari', 'takeru', 'santa', 'bear']
  const speaker = voiceList[Math.floor(Math.random() * voiceList.length)]
  const pitch = Math.floor(Math.random() * (200 + 1 - 50)) + 50
  const speed = Math.floor(Math.random() * (400 + 1 - 50)) + 50
  try {
    conn = await pool.getConnection()
    await conn.query('INSERT IGNORE INTO userSetting VALUES (?, ?, ?, ?, ?)', [
      id,
      0,
      0,
      0,
      0,
    ])
    await conn.query(
      'UPDATE userSetting SET speaker=?, pitch=?, speed=? WHERE id = ?',
      [speaker, pitch, speed, id],
    )
    rows = await conn.query('SELECT * FROM userSetting WHERE id = ?', [id])
    return rows![0]!
  } catch (err) {
    if (err instanceof SqlError) {
      throw new DBError('ランダム値の設定に失敗しました。', {
        cause: err,
      })
    }
    throw err
  } finally {
    if (conn) conn.release()
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
    if (conn) conn.release()
  }
}

export function deleteUserCache(id: string) {
  userSettings.delete(id)
}

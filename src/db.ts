import { createPool, type PoolConnection } from 'mariadb'

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

export async function getUserSetting(id: string) {
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
    return rows[0]
  } catch (err) {
    throw err
  } finally {
    if (conn) conn.release()
  }
}

async function randomizeUserSetting(id: string) {
  let conn: PoolConnection | undefined = undefined,
    rows: Array<UserSetting> | undefined = undefined
  const voiceList = ['show', 'haruka', 'hikari', 'takeru', 'santa', 'bear']
  try {
    conn = await pool.getConnection()
    await conn.query(`INSERT IGNORE INTO userSetting VALUES (?, ?, ?, ?, ?)`, [
      id,
      0,
      0,
      0,
      0,
    ])
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

export async function setUserSetting(
  id: string,
  key: string,
  value: string | number,
) {
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

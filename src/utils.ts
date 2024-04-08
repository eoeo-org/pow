import debug from 'debug'
const debug__Queue = debug('utils.js:Queue')
import { EventEmitter } from 'events'
import type { UserSetting } from './db.js'
import type { InteractionReplyOptions } from 'discord.js'
import { PowError } from './errors/PowError.js'

export function getProperty<T, K extends keyof T>(property: K) {
  return (object: T) => object[property]
}

const awaitEvent = (
  eventEmitter: EventEmitter,
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate = (...args: unknown[]) => true,
) =>
  new Promise((resolve) => {
    const callback = (...args: unknown[]) => {
      if (validate(...args)) {
        eventEmitter.off(event, callback)
        resolve({ event, ...args })
      }
    }
    eventEmitter.on(event, callback)
  })

export class Queue<T> extends EventEmitter {
  items: T[] = []

  constructor(private consumer: (item: T) => Promise<unknown>) {
    super()
    void (async () => {
      debug__Queue('starting event loop')
      for (;;) {
        debug__Queue(`items.length: ${this.items.length}`)
        if (this.items.length === 0) {
          debug__Queue('awaiting new_item')
          await awaitEvent(this, 'new_item')
          debug__Queue('new_item resolved')
        }
        debug__Queue('awaiting consumer')
        await Promise.race([
          awaitEvent(this, 'purge').then(() => {
            debug__Queue('queue purged, continuing')
          }),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.consumer(this.items.shift()!),
        ])
        debug__Queue('consumer resolved')
      }
    })()
  }

  add(item: T) {
    this.items.push(item)
    this.emit('new_item')
  }

  purge() {
    this.items.splice(0, this.items.length)
    this.emit('purge')
  }
}

export function userSettingToString(userSetting: UserSetting): string {
  return [
    `speaker: ${userSetting.speaker}`,
    `pitch: ${userSetting.pitch}`,
    `speed: ${userSetting.speed}`,
    `isDontRead: ${userSetting.isDontRead}`,
  ].join('\n')
}

export const userSettingToDiff = (
  oldUserSetting: UserSetting,
  newUserSetting: UserSetting,
) => {
  return `speaker: ${
    oldUserSetting.speaker === newUserSetting.speaker
      ? newUserSetting.speaker
      : `\x1B[31m${oldUserSetting.speaker}\x1B[0m -> \x1B[32m${newUserSetting.speaker}\x1B[0m`
  }\npitch: ${
    oldUserSetting.pitch === newUserSetting.pitch
      ? `${newUserSetting.pitch}`
      : `\x1B[31m${oldUserSetting.pitch}\x1B[0m -> \x1B[32m${newUserSetting.pitch}\x1B[0m`
  }\nspeed: ${
    oldUserSetting.speed === newUserSetting.speed
      ? `${newUserSetting.speed}`
      : `\x1B[31m${oldUserSetting.speed}\x1B[0m -> \x1B[32m${newUserSetting.speed}\x1B[0m`
  }`
}

export const getErrorReply = (error: unknown): InteractionReplyOptions => {
  if (error instanceof PowError) {
    return error.toInteractionReplyOptions()
  } else {
    throw error
  }
}

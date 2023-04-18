import debug from 'debug'
const debug__Queue = debug('utils.js:Queue')
import { EventEmitter } from 'events'

export function getProperty<T, K extends keyof T>(property: K) {
  return (object: T) => object[property]
}

const awaitEvent = (
  eventEmitter: EventEmitter,
  event: string,
  validate = (...args: any[]) => true,
) =>
  new Promise((resolve) => {
    const callback = (...args) => {
      if (validate(...args)) {
        eventEmitter.off(event, callback)
        resolve({ event, ...args })
      }
    }
    eventEmitter.on(event, callback)
  })

export class Queue extends EventEmitter {
  consumer: any
  items: any

  constructor(consumer) {
    super()

    if (typeof consumer !== 'function') throw new RangeError()
    this.consumer = consumer
    this.items = []
    ;(async () => {
      debug__Queue('starting event loop')
      while (true) {
        debug__Queue(`items.length: ${this.items.length}`)
        if (this.items.length === 0) {
          debug__Queue('awaiting new_item')
          await awaitEvent(this, 'new_item')
          debug__Queue('new_item resolved')
        }
        debug__Queue('awaiting consumer')
        await Promise.race([
          awaitEvent(this, 'purge').then(() =>
            debug__Queue('queue purged, continuing'),
          ),
          this.consumer(this.items.shift()),
        ])
        debug__Queue('consumer resolved')
      }
    })()
  }

  add(item) {
    this.items.push(item)
    this.emit('new_item')
  }

  purge() {
    this.items.splice(0, this.items.length)
    this.emit('purge')
  }
}

export function objToList(obj) {
  return Object.keys(obj)
    .map((a) => `${a}: ${obj[a]}`)
    .join('\n')
}

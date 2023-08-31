import {
  Events,
  Message,
  Options,
  type GuildTextBasedChannel,
} from 'discord.js'
import { SapphireClient } from '@sapphire/framework'
import { GuildCtxManager } from './guildCtx.js'
import type { SignalConstants } from 'os'
import { WorkerClientMap } from './worker.js'
import { readyEvent } from './events/index.js'

import { createRequire } from 'node:module'
const packageJson = createRequire(import.meta.url)('../package.json')

let isCalledDestroy = false

const client = new SapphireClient({
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildVoiceStates',
    'GuildMessages',
    'MessageContent',
  ],
  makeCache: Options.cacheWithLimits({
    BaseGuildEmojiManager: 0,
    GuildEmojiManager: 0,
    GuildForumThreadManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    GuildTextThreadManager: 0,
    MessageManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
  }),
  loadMessageCommandListeners: true,
})

export const guildCtxManager = new GuildCtxManager(client)

export let workerClientMap: WorkerClientMap
export let workerReady = false
console.log(`pow - v${packageJson.version}`)

client.on(Events.ClientReady, async (c) => {
  readyEvent(c, packageJson)
  workerClientMap = await new WorkerClientMap().init(
    process.env.WORKER_TOKENS,
    c,
  )
  workerReady = true
})

const destroy = async () => {
  if (!isCalledDestroy) {
    isCalledDestroy = true

    const promises: Promise<Message<true>>[] = []

    guildCtxManager.forEach((guildContext) => {
      guildContext.connectionManager.forEach(async (connectionContext) => {
        const channel = connectionContext.readChannel as GuildTextBasedChannel
        const promise = channel.send({
          embeds: [
            {
              color: 0xffff00,
              title: '再起動を行うためボイスチャンネルから退出します。',
              description: '起動完了までしばらくお待ちください。',
            },
          ],
        })
        promises.push(promise)
      })
    })
    await Promise.allSettled(promises)
  }

  await client.destroy()
  for (const worker of workerClientMap.values()) {
    await worker.destroy()
  }
}

async function handle(signal: SignalConstants) {
  console.log(`Received ${signal}`)
  await destroy()
  process.exit()
}

process.on('SIGINT', handle)
process.on('SIGTERM', handle)
process.on('uncaughtException', async (err) => {
  await destroy()
  console.error('uncaughtException:\n%o', err)
  process.exit(1)
})

client.login()

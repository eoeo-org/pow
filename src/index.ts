import type typings = require('discord.js')

import packageJson from '../package.json' assert { type: 'json', integrity: 'sha384-ABC123' }

import {
  Message,
  MessageType,
  Options,
  type VoiceBasedChannel,
} from 'discord.js'
import { SapphireClient } from '@sapphire/framework'
import { convertContent } from './contentConverter.js'
import { GuildCtxManager } from './guildCtx.js'
import debug from 'debug'
import type { SignalConstants } from 'os'
import { getUserSetting } from './db.js'
import { WorkerClientMap } from './worker.js'
import { joinMessageRun } from './joinMessage.js'
import { ChannelType } from 'discord.js'
const debug__ErrorHandler = debug('index.js:ErrorHandler')

let isCalledDestroy = false

export const client = new SapphireClient({
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
console.log(`pow - v${packageJson.version}`)

client.on('ready', () => {
  process.title = `${client.user?.tag} - pow v${packageJson.version}`
  console.log(`Logged in as ${client.user?.tag}!`)
  console.log(`Servers: (${client.guilds.cache.size})`)
  client.user?.setPresence({
    activities: [{ name: `pow - v${packageJson.version}` }],
  })
  client.guilds.cache.forEach(async (guild: typings.Guild) => {
    console.log(
      `  - ${guild.name} (${guild.memberCount}) Owner: ${await guild
        .fetchOwner()
        .then((owner) => owner.user.tag)}`,
    )
  })
  workerClientMap = new WorkerClientMap(process.env.WORKER_TOKENS, client)
  workerClientMap.set(client.user!.id, client)
})

client.on('messageCreate', async (message: typings.Message) => {
  if (message.content === `${client.user} join`) {
    joinMessageRun(message)
  }
  if (message.content === '') return
  if (message.author.bot || !message.inGuild()) return
  if (![MessageType.Default, MessageType.Reply].includes(message.type)) return
  if (message.content.startsWith('_')) return
  if (message.content.includes('```')) return
  if (message.member?.voice.selfDeaf) return
  if (message.member?.voice.suppress) return

  const connectionManager = guildCtxManager.get(message.guild).connectionManager
  if (!connectionManager.has(message.channel)) return
  const userSetting = await getUserSetting(message.author.id)
  if (userSetting.isDontRead) return

  const convertedMessage = convertContent(
    message.content,
    message.guildId,
    client,
  )
    .trim()
    .replace('\n', '')
  if (convertedMessage.length === 0) return
  if (
    message.member?.voice.channel === null ||
    message.member?.voice.channel.id !==
      connectionManager.get(message.channel)?.connection.joinConfig.channelId
  )
    return
  connectionManager.get(message.channel)!.addMessage(convertedMessage, message)
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (
    newState.channel?.type === ChannelType.GuildStageVoice &&
    newState.member?.id === client.user?.id &&
    newState.suppress
  ) {
    await newState.setSuppressed(false)
    return
  }
  if (oldState.channel === null) return
  const guildCtx = guildCtxManager.get(newState.guild)
  if (
    (newState.channelId == null &&
      (await guildCtx.bots).includes(newState.id) &&
      [...guildCtx.connectionManager.values()].find(
        (connectionCtx) =>
          connectionCtx.connection.joinConfig.channelId ===
            oldState.channelId &&
          connectionCtx.connection.joinConfig.group === oldState.id,
      )) ||
    (guildCtx.connectionManager.channelMap.has(oldState.channel) &&
      oldState.channel.members.size === 1 &&
      oldState.channel.members.every((member) =>
        [...guildCtx.connectionManager.values()].find(
          (connectionCtx) =>
            connectionCtx.connection.joinConfig.channelId ===
              oldState.channelId &&
            connectionCtx.connection.joinConfig.group === member.id,
        ),
      ))
  ) {
    guildCtx.connectionManager.channelMap
      .get(oldState.channel)!
      .send({
        embeds: [
          {
            color: 0x00ff00,
            title: 'ボイスチャンネルから退出しました。',
            description: 'またのご利用をお待ちしております。',
          },
        ],
      })
      .catch((err: typings.DiscordErrorData) => {
        if (err.code !== 50013) throw err
        debug__ErrorHandler(
          `Error code ${err.code}: Missing send messages permission.`,
        )
        debug__ErrorHandler(
          `Guild ID: ${oldState.guild.id} Guild Name: ${
            oldState.guild.name
          } Channel ID: ${
            guildCtx.connectionManager.channelMap.get(
              oldState.channel as VoiceBasedChannel,
            )?.id
          } Channel Name: ${
            guildCtx.connectionManager.channelMap.get(
              oldState.channel as VoiceBasedChannel,
            )?.name
          }`,
        )
      })
      .finally(() => {
        guildCtx.leave(oldState.channel as VoiceBasedChannel)
      })
  }
})

client.on('guildMemberAdd', async (member) => {
  if (workerClientMap.has(member.id)) {
    await guildCtxManager.get(member.guild).addBot(member.id)
  }
})
client.on('guildMemberRemove', (member) => {
  if (workerClientMap.has(member.id)) {
    guildCtxManager.get(member.guild).resetBots(workerClientMap)
  }
})

const destroy = async () => {
  if (!isCalledDestroy) {
    isCalledDestroy = true

    const promises: Promise<Message<true>>[] = []

    guildCtxManager.forEach((guildContext) => {
      guildContext.connectionManager.forEach(async (connectionContext) => {
        const channel =
          connectionContext.readChannel as typings.GuildTextBasedChannel
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

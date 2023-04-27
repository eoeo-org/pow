import type typings = require('discord.js')

import packageJson from '../package.json' assert { type: 'json', integrity: 'sha384-ABC123' }

import { MessageType, VoiceChannel } from 'discord.js'
import { SapphireClient } from '@sapphire/framework'
import { convertContent } from './contentConverter.js'
import { GuildCtxManager } from './guildCtx.js'
import debug from 'debug'
import type { SignalConstants } from 'os'
import { getUserSetting } from './db.js'
import { WorkerClientMap } from './worker.js'
const debug__ErrorHandler = debug('index.js:ErrorHandler')

export const client = new SapphireClient({
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildVoiceStates',
    'GuildMessages',
    'MessageContent',
  ],
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
        .then(
          (owner) => `${owner.user.username}#${owner.user.discriminator}`,
        )}`,
    )
  })
  workerClientMap = new WorkerClientMap(process.env.WORKER_TOKENS, client)
  workerClientMap.set(client.user!.id, client)
})

client.on('messageCreate', async (message: typings.Message) => {
  if (message.content === '') return
  if (message.author.bot || !message.inGuild()) return
  if (![MessageType.Default, MessageType.Reply].includes(message.type)) return
  if (message.content.startsWith('_')) return
  if (message.content.includes('```')) return
  if (message.member?.voice.selfDeaf) return

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

client.on('voiceStateUpdate', (oldState, newState) => {
  const guildCtx = guildCtxManager.get(newState.guild)

  if (
    (newState.channelId == null &&
      newState.id === client.user?.id &&
      oldState.channel instanceof VoiceChannel &&
      guildCtx.connectionManager.channelMap.has(oldState.channel)) ||
    (oldState.channel instanceof VoiceChannel &&
      guildCtx.connectionManager.channelMap.has(oldState.channel) &&
      oldState.channel.members.size === 1)
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
              oldState.channel as VoiceChannel,
            )?.id
          } Channel Name: ${
            guildCtx.connectionManager.channelMap.get(
              oldState.channel as VoiceChannel,
            )?.name
          }`,
        )
      })
      .finally(async () => {
        await guildCtx.leave(oldState.channel as VoiceChannel)
      })
  }
})

client.on('guildMemberAdd', async (member) => {
  if (workerClientMap.has(member.id)) {
    await guildCtxManager.get(member.guild).addBot(member.id)
  }
})
client.on('guildMemberRemove', async (member) => {
  if (workerClientMap.has(member.id)) {
    await guildCtxManager.get(member.guild).resetBots(workerClientMap)
  }
})

function handle(signal: SignalConstants) {
  console.log(`Received ${signal}`)
  client.destroy()
  process.exit()
}

process.on('SIGINT', handle)
process.on('SIGTERM', handle)
process.on('uncaughtException', (err) => {
  client.destroy()
  throw err
})

client.login()

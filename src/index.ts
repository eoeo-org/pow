import type typings = require('discord.js')

import packageJson from '../package.json' assert { type: 'json', integrity: 'sha384-ABC123' }

import { Collection, MessageType } from 'discord.js'
import { SapphireClient } from '@sapphire/framework'
import { convertContent } from './contentConverter.js'
import { GuildCtxManager } from './guildCtx.js'
import debug from 'debug'
import type { SignalConstants } from 'os'
import { getUserSetting } from './db.js'
const debug__ErrorHandler = debug('index.js:ErrorHandler')
class PowClient extends SapphireClient {
  commands: any
  constructor(options: typings.ClientOptions) {
    super(options)
    this.commands = new Collection()
  }
}
export const client = new PowClient({
  intents: ['Guilds', 'GuildVoiceStates', 'GuildMessages', 'MessageContent'],
  loadMessageCommandListeners: true,
})

export const guildCtxManager = new GuildCtxManager(client)

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
})

client.on('messageCreate', async (message: typings.Message) => {
  if (message.author.bot || !message.inGuild()) return
  if (![MessageType.Default, MessageType.Reply].includes(message.type)) return
  if (message.content.startsWith('_')) return
  if (message.content.includes('```')) return
  if (message.member?.voice.selfDeaf) return

  const ctx = guildCtxManager.get(message.guild)
  if (ctx.textChannel !== message.channel) return
  if (message.content === '') return
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
    message.member?.voice.channel !== ctx.voiceChannel
  )
    return
  ctx.addMessage(convertedMessage, message)
})

client.on('interactionCreate', async (interaction: typings.Interaction) => {
  if (!(interaction.inCachedGuild() && interaction.isChatInputCommand())) return
  const command = client.commands.get(interaction.commandName)
  if (!command) return
  try {
    await command.execute(interaction, client)
  } catch (error) {
    console.error(error)
    await interaction.reply({
      content: 'コマンドの実行中にエラーが発生しました。',
      ephemeral: true,
    })
  }
})

client.on('voiceStateUpdate', (oldState, newState) => {
  const ctx = guildCtxManager.get(newState.guild)
  if (newState.channelId == null && newState.id === client.user?.id) {
    ctx.readQueue.purge()
    ctx.cleanChannels()
    return
  }
  if (ctx.voiceChannel && ctx.voiceChannel.members.size === 1) {
    ctx.textChannel
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
          `Guild ID: ${ctx.guild.id} Guild Name: ${ctx.guild.name} Channel ID: ${ctx.textChannel.id} Channel Name: ${ctx.textChannel.name}`,
        )
      })
      .finally(async () => {
        await ctx.leave()
      })
  }
})

function handle(signal: SignalConstants) {
  console.log(`Received ${signal}`)
  client.destroy()
  process.exit()
}

process.on('SIGINT', handle)
process.on('SIGTERM', handle)

client.login()

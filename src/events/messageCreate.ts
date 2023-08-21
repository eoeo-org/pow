import { MessageType, type Message } from 'discord.js'
import { joinMessageRun } from '../joinMessage.js'
import { guildCtxManager } from '../index.js'
import { convertContent } from '../contentConverter.js'

export const messageCreateEvent = async (message: Message) => {
  if (message.content === `${message.client.user} join`) {
    joinMessageRun(message)
  }

  if (message.content === '' && message.stickers.size === 0) return
  if (message.author.bot || !message.inGuild()) return
  if (![MessageType.Default, MessageType.Reply].includes(message.type)) return
  if (message.content.startsWith('_')) return
  if (message.content.includes('```')) return
  if (message.member?.voice.selfDeaf) return
  if (message.member?.voice.suppress) return

  const connectionManager = guildCtxManager.get(message.guild).connectionManager
  if (!connectionManager.has(message.channel)) return
  const connectionCtx = connectionManager.get(message.channel)
  if (connectionCtx === undefined) return

  if (connectionCtx.skipUser.has(message.author)) return

  const convertedMessage = convertContent(
    message.content,
    message.embeds,
    message.stickers,
    message.guildId,
    message.client,
  )
    .trim()
    .replace('\n', '')
  if (convertedMessage.length === 0) return
  if (
    message.member?.voice.channel === null ||
    message.member?.voice.channel.id !==
      connectionCtx.connection.joinConfig.channelId
  )
    return
  connectionCtx.addMessage(convertedMessage, message)
}

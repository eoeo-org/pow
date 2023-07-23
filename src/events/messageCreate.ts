import { MessageType, type Message } from 'discord.js'
import { joinMessageRun } from '../joinMessage.js'
import { guildCtxManager } from '../index.js'
import { getUserSetting } from '../db.js'
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
  const userSetting = await getUserSetting(message.author.id)
  if (userSetting.isDontRead) return

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
      connectionManager.get(message.channel)?.connection.joinConfig.channelId
  )
    return
  connectionManager.get(message.channel)!.addMessage(convertedMessage, message)
}

import { Client, Message, VoiceChannel } from 'discord.js'
import { client, guildCtxManager, workerClientMap } from './index.js'

export const joinMessageRun = async (message: Message) => {
  if (!message.author.bot) {
    return message.reply({
      content: `</join:${(await client.application?.commands.fetch())?.findKey(
        (applicationCommand) => applicationCommand.name === 'join',
      )}> をお使いください。（コマンドメンションを押すとチャット欄に自動挿入されます。）`,
    })
  }
  if (
    !(message.channel instanceof VoiceChannel) ||
    !message.channel.joinable ||
    workerClientMap.size !== process.env.WORKER_TOKENS.split(',').length + 1
  )
    return
  const guildCtx = guildCtxManager.get(message.channel.guild)
  if (
    guildCtx.connectionManager.channelMap.has(message.channel) ||
    guildCtx.connectionManager.get(message.channel!) !== undefined
  )
    return

  let worker: Client | null = null

  try {
    worker = await guildCtx.join(message.channel, message.channel)
  } catch (err) {
    if (err instanceof Error && err.message === 'No worker') return
    throw err
  }

  return message.reply({
    embeds: [
      {
        color: 0x00ff00,
        title: `ボイスチャンネルに参加しました。`,
        description: `担当BOT: ${
          worker.user
        }\nテキストチャンネル: ${guildCtx.guild.channels.cache.get(
          message.channelId,
        )}\nボイスチャンネル: ${message.channel}`,
      },
    ],
  })
}

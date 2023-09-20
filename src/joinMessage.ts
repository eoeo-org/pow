import { ChannelType, Client, Message } from 'discord.js'
import { guildCtxManager, workerReady } from './index.js'
import { newGuildTextBasedChannelId, newVoiceBasedChannelId } from './id.js'

export const joinMessageRun = async (message: Message) => {
  if (!message.author.bot) {
    return message.reply({
      content: `</join:${(
        await message.client.application?.commands.fetch()
      )?.findKey(
        (applicationCommand) => applicationCommand.name === 'join',
      )}> をお使いください。（コマンドメンションを押すとチャット欄に自動挿入されます。）`,
    })
  }
  if (
    !(
      message.channel.type === ChannelType.GuildVoice ||
      message.channel.type === ChannelType.GuildStageVoice
    ) ||
    !workerReady
  )
    return
  const guildCtx = guildCtxManager.get(message.channel.guild)
  if (
    guildCtx.connectionManager.channelMap.has(
      newVoiceBasedChannelId(message.channel),
    ) ||
    guildCtx.connectionManager.get(
      newGuildTextBasedChannelId(message.channel),
    ) !== undefined
  )
    return

  let worker: Client | null = null

  try {
    worker = await guildCtx.join({
      voiceChannelId: newVoiceBasedChannelId(message.channel),
      readChannelId: newGuildTextBasedChannelId(message.channel),
    })
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

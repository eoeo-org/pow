import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import {
  InteractionContextType,
  type InteractionReplyOptions,
} from 'discord.js'
import { checkCanJoin, checkUserAlreadyJoined } from '../components/preCheck.js'
import { newGuildTextBasedChannelId, newVoiceBasedChannelId } from '../id.js'
import { deferredReplyOrEdit, getErrorReply } from '../utils.js'

export class JoinCommand extends Command {
  public constructor(
    context: ChatInputCommand.LoaderContext,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'ボイスチャンネルに参加します。',
    })
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setContexts([InteractionContextType.Guild]),
    )
  }
  public override async chatInputRun(
    interaction: ChatInputCommand.Interaction,
  ) {
    if (!(interaction.inCachedGuild() && interaction.channel)) return
    const user = await interaction.member.fetch()

    let interactionReplyOptions: InteractionReplyOptions = {
      embeds: [
        {
          color: 0xff0000,
          title: '予期せぬエラーが発生しました。',
        },
      ],
      ephemeral: true,
    }

    try {
      const voiceChannel = user.voice.channel
      checkUserAlreadyJoined(voiceChannel)
      checkCanJoin(voiceChannel)

      const guildCtx = guildCtxManager.get(interaction.member.guild)
      const readChannelId = newGuildTextBasedChannelId(interaction.channel)
      const voiceChannelId = newVoiceBasedChannelId(voiceChannel)

      guildCtx.checkAlreadyJoined(voiceChannelId)
      guildCtx.connectionManager.checkAlreadyUsedChannel(readChannelId)

      await interaction.deferReply()

      const worker = await guildCtx.join({
        voiceChannelId,
        readChannelId,
      })

      interactionReplyOptions = {
        embeds: [
          {
            color: 0x00ff00,
            title: `ボイスチャンネルに参加しました。`,
            description: [
              `担当BOT: ${worker.user?.toString()}`,
              `テキストチャンネル: ${guildCtx.guild.channels.cache.get(
                interaction.channelId,
              )}`,
              `ボイスチャンネル: ${interaction.member.voice.channel}`,
            ].join('\n'),
          },
        ],
      }
    } catch (error) {
      interactionReplyOptions = getErrorReply(error)
      console.error(error)
    } finally {
      void deferredReplyOrEdit(interaction, interactionReplyOptions)
    }
  }
}

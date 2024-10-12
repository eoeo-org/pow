import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import { checkUserAlreadyJoined } from '../components/preCheck.js'
import {
  InteractionContextType,
  type InteractionReplyOptions,
} from 'discord.js'
import { LeaveCause } from '../connectionCtx.js'
import { newGuildTextBasedChannelId, newVoiceBasedChannelId } from '../id.js'
import { deferredReplyOrEdit, getErrorReply } from '../utils.js'
import {
  HandleInteractionError,
  HandleInteractionErrorType,
} from '../errors/index.js'

export class LeaveCommand extends Command {
  public constructor(
    context: ChatInputCommand.LoaderContext,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'ボイスチャンネルから退出します。',
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
    if (!interaction.inCachedGuild() || interaction.channel == null) return
    const user = await interaction.member.fetch()
    const voiceChannel = user.voice.channel

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
      checkUserAlreadyJoined(voiceChannel)

      const ctx = guildCtxManager.get(interaction.member.guild)
      const readChannelId = ctx.connectionManager.channelMap.get(
        newVoiceBasedChannelId(voiceChannel),
      )
      if (readChannelId === undefined)
        throw new HandleInteractionError(
          HandleInteractionErrorType.userNotWithBot,
        )

      await interaction.deferReply()

      const cause =
        newGuildTextBasedChannelId(interaction.channel) === readChannelId
          ? undefined
          : LeaveCause.command
      const workerId = await ctx.leave({
        voiceChannelId: newVoiceBasedChannelId(voiceChannel),
        cause,
      })

      interactionReplyOptions = {
        embeds: [
          {
            color: 0x00ff00,
            title: 'ボイスチャンネルから退出しました。',
            description: [
              `担当BOT: <@${workerId}>`,
              `テキストチャンネル: <#${readChannelId}>`,
              `ボイスチャンネル: ${voiceChannel}`,
              'またのご利用をお待ちしております。',
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

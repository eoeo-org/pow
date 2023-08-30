import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import type { InteractionReplyOptions } from 'discord.js'
import {
  AlreadyUsedChannelError,
  HandleInteractionError,
  HandleInteractionErrorType,
  PowError,
} from '../errors/index.js'
import { checkCanJoin, checkUserAlreadyJoined } from '../components/preCheck.js'

export class RejoinCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'ボイスチャンネルに再接続します。',
    })
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDMPermission(false),
    )
  }
  public override async chatInputRun(
    interaction: ChatInputCommand.Interaction,
  ) {
    if (!(interaction.inCachedGuild() && interaction.channel)) return
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
      checkCanJoin(voiceChannel)

      const guildCtx = guildCtxManager.get(interaction.member.guild)

      if (
        guildCtx.connectionManager.getWithVoiceChannel(voiceChannel) ===
        undefined
      )
        throw new HandleInteractionError(
          HandleInteractionErrorType.userNotWithBot,
        )
      const existingJoinConfig = guildCtx.connectionManager.get(
        interaction.channel,
      )?.connection.joinConfig
      if (
        guildCtx.connectionManager.channelMap.get(voiceChannel) !==
          interaction.channel &&
        existingJoinConfig !== undefined
      )
        throw new AlreadyUsedChannelError(
          existingJoinConfig.guildId,
          existingJoinConfig.channelId ?? '',
        )

      guildCtx.leave(voiceChannel)

      const worker = await guildCtx.join(voiceChannel, interaction.channel)

      interactionReplyOptions = {
        embeds: [
          {
            color: 0x00ff00,
            title: 'ボイスチャンネルに再接続しました。',
            description: [
              `担当BOT: ${worker.user?.toString()}`,
              `テキストチャンネル: ${interaction.channel.toString()}`,
              `ボイスチャンネル: ${voiceChannel.toString()}`,
            ].join('\n'),
          },
        ],
      }
    } catch (error) {
      if (error instanceof PowError) {
        interactionReplyOptions = error.toInteractionReplyOptions
      } else {
        throw error
      }
    } finally {
      return interaction.reply(interactionReplyOptions)
    }
  }
}

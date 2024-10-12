import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import {
  HandleInteractionError,
  HandleInteractionErrorType,
} from '../errors/index.js'
import {
  InteractionContextType,
  type InteractionReplyOptions,
} from 'discord.js'
import { checkUserAlreadyJoined } from '../components/preCheck.js'
import { newVoiceBasedChannelId } from '../id.js'
import { getErrorReply } from '../utils.js'

export class SkipCommand extends Command {
  public constructor(
    context: ChatInputCommand.LoaderContext,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: '今読み上げている内容をスキップします。',
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
    if (!interaction.inCachedGuild()) return
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

      const connectionCtx = guildCtxManager
        .get(interaction.member.guild)
        .connectionManager.getWithVoiceChannelId(
          newVoiceBasedChannelId(voiceChannel),
        )
      if (connectionCtx === undefined)
        throw new HandleInteractionError(
          HandleInteractionErrorType.userNotWithBot,
        )

      connectionCtx.player?.stop()
      const workerId = connectionCtx.connection.joinConfig.group

      interactionReplyOptions = {
        embeds: [
          {
            color: 0x00ff00,
            title: '読み上げをスキップしました。',
            description: [
              `担当BOT: <@${workerId}>`,
              `テキストチャンネル: <#${connectionCtx.readChannelId.toString()}>`,
              `ボイスチャンネル: ${voiceChannel}`,
            ].join('\n'),
          },
        ],
      }
    } catch (error) {
      interactionReplyOptions = getErrorReply(error)
      console.error(error)
    } finally {
      void interaction.reply(interactionReplyOptions)
    }
  }
}

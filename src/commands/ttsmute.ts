import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import {
  InteractionContextType,
  type InteractionReplyOptions,
} from 'discord.js'
import {
  HandleInteractionError,
  HandleInteractionErrorType,
} from '../errors/index.js'
import { checkUserAlreadyJoined } from '../components/preCheck.js'
import { newUserId, newVoiceBasedChannelId } from '../id.js'
import { getErrorReply } from '../utils.js'

export class TtsmuteCommand extends Command {
  public constructor(
    context: ChatInputCommand.LoaderContext,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'メッセージを一時的に読み上げないようにします。',
    })
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setContexts([InteractionContextType.Guild])
        .addBooleanOption((option) =>
          option
            .setName('enable')
            .setDescription(
              '有効にするかを指定してください。（未指定の場合、トグルします。）',
            )
            .setRequired(false),
        ),
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

      const enable =
        interaction.options.getBoolean('enable') ??
        !connectionCtx.skipUser.has(newUserId(interaction.user))
      await connectionCtx.updateSkipUser(interaction.user, enable)
      interactionReplyOptions = {
        embeds: [
          {
            color: 0x00ff00,
            description: `${interaction.user}のメッセージを読み上げ${
              enable ? 'ない' : 'る'
            }ようにしました。`,
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

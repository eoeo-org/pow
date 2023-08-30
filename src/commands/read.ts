import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import { convertContent } from '../contentConverter.js'
import {
  Collection,
  type InteractionReplyOptions,
  type Sticker,
} from 'discord.js'
import {
  HandleInteractionError,
  HandleInteractionErrorType,
  PowError,
} from '../errors/index.js'
import { checkUserAlreadyJoined } from '../components/preCheck.js'

export class ReadCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: '引数に渡されたメッセージを読み上げます。',
    })
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDMPermission(false)
        .addStringOption((option) =>
          option
            .setName('text')
            .setDescription('喋らせたい内容')
            .setRequired(true),
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
      const text = interaction.options.getString('text', true)

      const connectionCtx = guildCtxManager
        .get(interaction.member.guild)
        .connectionManager.getWithVoiceChannel(voiceChannel)
      if (connectionCtx === undefined)
        throw new HandleInteractionError(
          HandleInteractionErrorType.userNotWithBot,
        )

      const convertedMessage = convertContent(
        text,
        [],
        new Collection<string, Sticker>(),
        interaction.guild.id,
        interaction.client,
      )
        .trim()
        .replace('\n', '')
      if (convertedMessage.length === 0) return
      connectionCtx.addMessage(convertedMessage, interaction)
      interactionReplyOptions = {
        content: 'メッセージを読み上げキューに追加しました。',
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

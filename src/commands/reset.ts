import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager, workerClientMap } from '../index.js'
import { PermissionFlagsBits, type InteractionReplyOptions } from 'discord.js'
import { PowError } from '../errors/index.js'

export class ResetCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description:
        'このサーバーでの参加状態を初期化します。(⚠VCからBOTが退出します。)',
    })
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .setDMPermission(false),
    )
  }
  public override chatInputRun(interaction: ChatInputCommand.Interaction) {
    if (!interaction.inCachedGuild()) return

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
      guildCtxManager.get(interaction.guild).resetBots(workerClientMap)
      interactionReplyOptions = {
        embeds: [
          {
            color: 0x00ff00,
            title: `参加状態を初期化しました。`,
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

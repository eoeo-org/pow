import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager, workerClientMap } from '../index.js'
import { PermissionFlagsBits } from 'discord.js'

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
  public override async chatInputRun(
    interaction: ChatInputCommand.Interaction,
  ) {
    if (!interaction.inCachedGuild()) return
    await guildCtxManager.get(interaction.guild).resetBots(workerClientMap)
    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: `参加状態を初期化しました。`,
        },
      ],
    })
  }
}

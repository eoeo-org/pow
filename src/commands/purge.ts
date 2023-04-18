import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'

export class JoinCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: '読み上げのキューリストを空にして、読み上げを中断します。',
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
    if (!interaction.inCachedGuild()) return
    const ctx = guildCtxManager.get(interaction.member.guild)
    if (!ctx.isJoined()) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: 'BOTがVCに参加している必要があります。',
          },
        ],
        ephemeral: true,
      })
    }

    ctx.readQueue.purge()
    ctx.player.stop()

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: '読み上げを中断しました。',
          description: '読み上げキューを空にして、読み上げを中断しました。',
        },
      ],
    })
  }
}

import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'

export class LeaveCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
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
    } else if (ctx.voiceChannel !== interaction.member.voice.channel) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: 'BOTと同じVCに参加している必要があります。',
          },
        ],
        ephemeral: true,
      })
    }

    await ctx.leave()

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: 'ボイスチャンネルから退出しました。',
          description: 'またのご利用をお待ちしております。',
        },
      ],
    })
  }
}

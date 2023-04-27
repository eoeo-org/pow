import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import { StageChannel } from 'discord.js'

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
    const user = await interaction.member.fetch()
    const voiceChannel = user.voice.channel
    if (voiceChannel == null) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description:
              'このコマンドを実行するには、VCに参加している必要があります。',
          },
        ],
        ephemeral: true,
      })
    }
    if (voiceChannel instanceof StageChannel) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: 'ステージチャンネルは現在サポートしていません。',
          },
        ],
        ephemeral: true,
      })
    }
    const ctx = guildCtxManager.get(interaction.member.guild)
    if (!ctx.connectionManager.channelMap.has(voiceChannel)) {
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

    const textChannel = ctx.connectionManager.channelMap.get(voiceChannel)
    const workerId = await ctx.leave(voiceChannel)

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: 'ボイスチャンネルから退出しました。',
          description: `担当BOT: <@${workerId}>\nテキストチャンネル: ${textChannel}\nボイスチャンネル: ${voiceChannel}\nまたのご利用をお待ちしております。`,
        },
      ],
    })
  }
}

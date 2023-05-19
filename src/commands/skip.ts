import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import { StageChannel } from 'discord.js'

export class SkipCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
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
    const connectionManager = guildCtxManager.get(
      interaction.member.guild,
    ).connectionManager
    if (!connectionManager.channelMap.has(voiceChannel)) {
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

    const connectionCtx = connectionManager.get(
      connectionManager.channelMap.get(voiceChannel)!,
    )
    connectionCtx?.player?.stop()
    const workerId = connectionCtx?.connection.joinConfig.group

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: '読み上げをスキップしました。',
          description: `担当BOT: <@${workerId}>\nテキストチャンネル: ${connectionManager.channelMap
            .get(voiceChannel)
            ?.toString()}\nボイスチャンネル: ${voiceChannel}`,
        },
      ],
    })
  }
}

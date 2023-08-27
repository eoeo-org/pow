import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager, workerReady } from '../index.js'
import { Client } from 'discord.js'

export class JoinCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'ボイスチャンネルに参加します。',
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
    if (!voiceChannel) {
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

    if (!voiceChannel.joinable) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: 'このVCに参加する権限がありません。',
          },
        ],
        ephemeral: true,
      })
    }

    if (!workerReady) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description:
              'worker の準備が整っていません。十数秒後に再試行してください。',
          },
        ],
        ephemeral: true,
      })
    }

    const guildCtx = guildCtxManager.get(interaction.member.guild)

    if (guildCtx.connectionManager.channelMap.has(voiceChannel)) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: 'BOTはすでにVCに参加しています。',
          },
        ],
        ephemeral: true,
      })
    }

    const connectionVoiceJoinConfig = guildCtx.connectionManager.get(
      interaction.channel!,
    )?.connection.joinConfig
    if (connectionVoiceJoinConfig !== undefined) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: `このテキストチャンネルは https://discord.com/channels/${connectionVoiceJoinConfig?.guildId}/${connectionVoiceJoinConfig?.channelId} で既に使われています。`,
          },
        ],
        ephemeral: true,
      })
    }

    let worker: Client | null = null

    try {
      worker = await guildCtx.join(voiceChannel, interaction.channel!)
    } catch (err) {
      if (err instanceof Error && err.message === 'No worker') {
        return interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: 'エラー',
              description: '参加させられるBotが居ません。',
            },
          ],
          ephemeral: true,
        })
      }
      throw err
    }

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: `ボイスチャンネルに参加しました。`,
          description: [
            `担当BOT: ${worker.user?.toString()}`,
            `テキストチャンネル: ${guildCtx.guild.channels.cache.get(
              interaction.channelId,
            )}`,
            `ボイスチャンネル: ${interaction.member.voice.channel}`,
          ].join('\n'),
        },
      ],
    })
  }
}

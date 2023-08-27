import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import type { Client } from 'discord.js'

export class RejoinCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'ボイスチャンネルに再接続します。',
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

    const guildCtx = guildCtxManager.get(interaction.member.guild)

    if (!guildCtx.connectionManager.channelMap.has(voiceChannel)) {
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

    const connectionVoiceJoinConfig = guildCtx.connectionManager.get(
      interaction.channel!,
    )?.connection.joinConfig
    if (
      guildCtx.connectionManager.channelMap.get(voiceChannel) !==
        interaction.channel &&
      connectionVoiceJoinConfig !== undefined
    ) {
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

    guildCtx.leave(voiceChannel)

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
          title: 'ボイスチャンネルに再接続しました。',
          description: [
            `担当BOT: ${worker.user?.toString()}`,
            `テキストチャンネル: ${interaction.channel?.toString()}`,
            `ボイスチャンネル: ${voiceChannel.toString()}`,
          ].join('\n'),
        },
      ],
    })
  }
}

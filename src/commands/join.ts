import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import { StageChannel } from 'discord.js'

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
            description: 'VCに参加してからコマンドを実行してください。',
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

    if (ctx.connectionManager.channelMap.has(voiceChannel)) {
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

    try {
      await ctx.join(voiceChannel, interaction.channel!)
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
      } else {
        throw err
      }
    }

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: 'ボイスチャンネルに参加しました。',
          description: `テキストチャンネル: ${ctx.guild.channels.cache.get(
            interaction.channelId,
          )}\nボイスチャンネル: ${interaction.member.voice.channel}`,
        },
      ],
    })
  }
}

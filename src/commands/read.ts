import { Command, type ChatInputCommand } from '@sapphire/framework'
import { client, guildCtxManager } from '../index.js'
import { convertContent } from '../contentConverter.js'
import { StageChannel } from 'discord.js'

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

    const text = interaction.options.getString('text', true)
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
    const convertedMessage = convertContent(text, interaction.guild.id, client)
      .trim()
      .replace('\n', '')
    if (convertedMessage.length === 0) return
    connectionManager
      .get(connectionManager.channelMap.get(voiceChannel)!)
      ?.addMessage(convertedMessage, interaction)
    return interaction.reply('メッセージを読み上げキューに追加しました。')
  }
}

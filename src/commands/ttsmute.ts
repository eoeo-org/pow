import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'

export class TtsmuteCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'メッセージを一時的に読み上げないようにします。',
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
        .addBooleanOption((option) =>
          option
            .setName('enable')
            .setDescription(
              '有効にするかを指定してください。（未指定の場合、トグルします。）',
            )
            .setRequired(false),
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
    if (connectionCtx === null) return
    const enable =
      interaction.options.getBoolean('enable') ??
      !connectionCtx?.skipUser.has(interaction.user)
    connectionCtx?.updateSkipUser(interaction.user, enable)
    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          description: `${interaction.user}のメッセージを読み上げ${
            enable ? 'ない' : 'る'
          }ようにしました。`,
        },
      ],
    })
  }
}

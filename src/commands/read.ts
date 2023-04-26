import { Command, type ChatInputCommand } from '@sapphire/framework'
import { client, guildCtxManager } from '../index.js'
import { convertContent } from '../contentConverter.js'

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
    const text = interaction.options.getString('text', true)
    const ctx = guildCtxManager.get(interaction.member.guild)
    if (!ctx.isJoined()) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: 'BOTはこのサーバーのVCに参加していません。',
          },
        ],
        ephemeral: true,
      })
    }
    const convertedMessage = convertContent(text, interaction.guild.id, client)
      .trim()
      .replace('\n', '')
    if (convertedMessage.length === 0) return
    ctx.addMessage(convertedMessage, interaction)
    return interaction.reply('メッセージを読み上げキューに追加しました。')
  }
}

import { Command, type ChatInputCommand } from '@sapphire/framework'
import { MessageFlags, type Message } from 'discord.js'

import packageJson from '../../package.json' assert { type: 'json', integrity: 'sha384-ABC123' }

const helpUrl = `https://gh.kazu123.net/pow/tree/v${packageJson.version}#使い方`

export class HelpCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'help',
      aliases: ['へるぷ', 'ヘルプ', '使い方', '使いかた', 'つかいかた'],
      description: 'ヘルプページへのリンクを表示します。',
    })
  }

  public override async messageRun(message: Message) {
    await message.reply({
      content: helpUrl,
      flags: MessageFlags.SuppressEmbeds,
    })
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    )
  }
  public override async chatInputRun(
    interaction: ChatInputCommand.Interaction,
  ) {
    return interaction.reply({
      content: `[${helpUrl}](${helpUrl})`,
      ephemeral: true,
    })
  }
}

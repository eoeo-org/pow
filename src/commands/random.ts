import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import { objToList } from '../utils.js'

export class RandomCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: '声の設定をランダムにします。',
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
    const userSetting = await guildCtxManager
      .get(interaction.member.guild)
      ._randomizeUserSetting(interaction.member.id)

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: '声の設定をランダムにしました。',
          description: '```\n' + objToList(userSetting) + '\n```',
        },
      ],
      ephemeral: true,
    })
  }
}

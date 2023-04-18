import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'

export class JoinCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: 'メッセージを読み上げるかどうかを切り替えます。',
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
      ._getUserSetting(interaction.member.id)
    if (userSetting.isDontRead) {
      await guildCtxManager
        .get(interaction.member.guild)
        ._setUserSetting(interaction.member.id, 'isDontRead', 0)
      return interaction.reply({
        embeds: [
          {
            color: 0x00ff00,
            title: 'メッセージを読み上げるようにしました。',
          },
        ],
        ephemeral: true,
      })
    } else {
      await guildCtxManager
        .get(interaction.member.guild)
        ._setUserSetting(interaction.member.id, 'isDontRead', 1)
      return interaction.reply({
        embeds: [
          {
            color: 0x00ff00,
            title: 'メッセージを読み上げないようにしました。',
          },
        ],
        ephemeral: true,
      })
    }
  }
}

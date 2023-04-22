import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'
import { objToList } from '../utils.js'

export class JoinCommand extends Command {
  public constructor(
    context: ChatInputCommand.Context,
    options: ChatInputCommand.Options,
  ) {
    super(context, {
      ...options,
      description: '声の設定を変更します。',
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
            .setName('speaker')
            .setDescription('声の話者を変更できます。')
            .setRequired(false)
            .addChoices(
              { name: 'show', value: 'show' },
              { name: 'haruka', value: 'haruka' },
              { name: 'hikari', value: 'hikari' },
              { name: 'takeru', value: 'takeru' },
              { name: 'santa', value: 'santa' },
              { name: 'bear', value: 'bear' },
            ),
        )
        .addIntegerOption((option) =>
          option
            .setName('pitch')
            .setDescription('声の高さを変更できます。(指定できる範囲: 50〜200)')
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName('speed')
            .setDescription('声の速度を変更できます。(指定できる範囲: 50〜400)')
            .setRequired(false),
        ),
    )
  }
  public override async chatInputRun(
    interaction: ChatInputCommand.Interaction,
  ) {
    if (!interaction.inCachedGuild()) return
    const allowedVoiceList = [
      'show',
      'haruka',
      'hikari',
      'takeru',
      'santa',
      'bear',
    ]
    const { options } = interaction
    const speaker = options.getString('speaker')
    const pitch = options.getInteger('pitch')
    const speed = options.getInteger('speed')

    if (speaker !== null) {
      if (allowedVoiceList.includes(speaker)) {
        await guildCtxManager
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'speaker', `"${speaker}"`)
        const userSetting = await guildCtxManager
          .get(interaction.member.guild)
          ._getUserSetting(interaction.member.id)
        return interaction.reply({
          embeds: [
            {
              color: 0x00ff00,
              title: '声の設定を更新しました。',
              description: '```\n' + objToList(userSetting) + '\n```',
            },
          ],
          ephemeral: true,
        })
      } else {
        return interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: 'エラー',
              description: `その声(${speaker})は指定できません。指定できる声のリストは、こちらです。\n\`\`\`${allowedVoiceList}\`\`\``,
            },
          ],
          ephemeral: true,
        })
      }
    }

    if (pitch !== null) {
      if (pitch > 49 && pitch < 201) {
        await guildCtxManager
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'pitch', `"${pitch}"`)
        const userSetting = await guildCtxManager
          .get(interaction.member.guild)
          ._getUserSetting(interaction.member.id)
        return interaction.reply({
          embeds: [
            {
              color: 0x00ff00,
              title: '声の設定を更新しました。',
              description: '```\n' + objToList(userSetting) + '\n```',
            },
          ],
          ephemeral: true,
        })
      } else {
        return interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: 'エラー',
              description: `その声の高さ(${pitch}%)は指定できません。指定できる声の高さは、50%~200%です。`,
            },
          ],
          ephemeral: true,
        })
      }
    }

    if (speed !== null) {
      if (speed > 49 && speed < 401) {
        await guildCtxManager
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'speed', `"${speed}"`)
        const userSetting = await guildCtxManager
          .get(interaction.member.guild)
          ._getUserSetting(interaction.member.id)
        return interaction.reply({
          embeds: [
            {
              color: 0x00ff00,
              title: '声の設定を更新しました。',
              description: '```\n' + objToList(userSetting) + '\n```',
            },
          ],
          ephemeral: true,
        })
      } else {
        return interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: 'エラー',
              description: `その速度(${speed}%)は指定できません。指定できる声の速度は、50%~400%です。`,
            },
          ],
          ephemeral: true,
        })
      }
    }
    return
  }
}

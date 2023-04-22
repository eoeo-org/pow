import { Command, type ChatInputCommand } from '@sapphire/framework'
import { guildCtxManager } from '../index.js'

const userSettingToDiff = (oldUserSetting, newUserSetting) => {
  return `${
    oldUserSetting.speaker === newUserSetting.speaker
      ? `speaker: ${newUserSetting.speaker}`
      : `-speaker: ${oldUserSetting.speaker}\n+speaker: ${newUserSetting.speaker}`
  }\n${
    oldUserSetting.pitch === newUserSetting.pitch
      ? `pitch: ${newUserSetting.pitch}`
      : `-pitch: ${oldUserSetting.pitch}\n+pitch: ${newUserSetting.pitch}`
  }\n${
    oldUserSetting.speed === newUserSetting.speed
      ? `speed: ${newUserSetting.speed}`
      : `-speed: ${oldUserSetting.speed}\n+speed: ${newUserSetting.speed}`
  }`
}

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

    const userSetting_old = await guildCtxManager
      .get(interaction.member.guild)
      ._getUserSetting(interaction.member.id)

    let errorMsg: string[] = []

    const { options } = interaction
    const speaker = options.getString('speaker')
    const pitch = options.getInteger('pitch')
    const speed = options.getInteger('speed')

    if (speaker !== null) {
      if (allowedVoiceList.includes(speaker)) {
        await guildCtxManager
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'speaker', `"${speaker}"`)
      } else {
        errorMsg.push(
          `その声(${speaker})は指定できません。指定できる声のリストは、こちらです。\n\${allowedVoiceList.map(voice => "- " + voice).join('\n')}`,
        )
      }
    }

    if (pitch !== null) {
      if (pitch > 49 && pitch < 201) {
        await guildCtxManager
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'pitch', `"${pitch}"`)
      } else {
        errorMsg.push(
          `その声の高さ(${pitch}%)は指定できません。指定できる声の高さは、50%~200%です。`,
        )
      }
    }

    if (speed !== null) {
      if (speed > 49 && speed < 401) {
        await guildCtxManager
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'speed', `"${speed}"`)
      } else {
        errorMsg.push(
          `その速度(${speed}%)は指定できません。指定できる声の速度は、50%~400%です。`,
        )
      }
    }
    const userSetting = await guildCtxManager
      .get(interaction.member.guild)
      ._getUserSetting(interaction.member.id)

    if (errorMsg.length === 0) {
      interaction.reply({
        embeds: [
          {
            color: 0x00ff00,
            title: '声の設定を更新しました。',
            description:
              '```diff\n' +
              userSettingToDiff(userSetting_old, userSetting) +
              '\n```',
          },
        ],
        ephemeral: true,
      })
    } else {
      interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: `設定変更中にエラーが発生しました。\n詳細情報:\n${errorMsg.join(
              '\n',
            )}`,
          },
          {
            color: 0x00ff00,
            title: '声の設定を更新しました。',
            description:
              '```diff\n' +
              userSettingToDiff(userSetting_old, userSetting) +
              '\n```',
          },
        ],
        ephemeral: true,
      })
    }
    return
  }
}

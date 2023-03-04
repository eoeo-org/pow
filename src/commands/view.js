// @ts-check
const { SlashCommandBuilder } = require('discord.js')
const { objToList } = require('../utils.js')
const voiceRead = require('../voiceRead')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('現在の声の設定を確認します。')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('ユーザーの声の設定を確認できます。')
        .setRequired(false),
    )
    .setDMPermission(false),

  async execute(interaction) {
    const { options } = interaction
    const user = options.getUser('user')
    const userSetting = await voiceRead.guilds
      .get(interaction.member.guild)
      ._getUserSetting(user ? user.id : interaction.member.id)
    const userNameText = user
      ? `${user.username}#${user.discriminator}`
      : '現在'

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: `${userNameText}の声の設定`,
          description:
            '```\n' +
            objToList(userSetting).split('\n').slice(1).join('\n') +
            '\n```',
        },
      ],
      ephemeral: true,
    })
  },
}

const { SlashCommandBuilder } = require('@discordjs/builders')
const { objToList } = require('../utils.js')
const voiceRead = require('../voiceRead')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('現在の声の設定を確認します。'),

  async execute(interaction) {
    const userSetting = await voiceRead.guilds
      .get(interaction.member.guild)
      ._getUserSetting(interaction.member.id)

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: '現在の声の設定',
          description: '```\n' + objToList(userSetting) + '\n```',
        },
      ],
      ephemeral: true,
    })
  },
}

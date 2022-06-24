const { SlashCommandBuilder } = require('@discordjs/builders')
const { objToList } = require('../utils.js')
const voiceRead = require('../voiceRead')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('声の設定をランダムにします。')
    .setDMPermission(false),

  async execute(interaction) {
    const userSetting = await voiceRead.guilds
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
  },
}

const { SlashCommandBuilder } = require('@discordjs/builders')
const { objToList } = require('../utils.js')
const voiceRead = require('../voiceRead')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('声の設定を変更します。')
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
          { name: 'bear', value: 'bear' }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName('pitch')
        .setDescription('声の高さを変更できます。')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('speed')
        .setDescription('声の速度を変更できます。')
        .setRequired(false)
    ),

  async execute(interaction) {
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
        await voiceRead.guilds
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'speaker', `"${speaker}"`)
        const userSetting = await voiceRead.guilds
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
        })
      }
    }

    if (pitch !== null) {
      if (pitch > 49 && pitch < 201) {
        await voiceRead.guilds
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'pitch', `"${pitch}"`)
        const userSetting = await voiceRead.guilds
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
        })
      }
    }

    if (speed !== null) {
      if (speed > 49 && speed < 401) {
        await voiceRead.guilds
          .get(interaction.member.guild)
          ._setUserSetting(interaction.member.id, 'speed', `"${speed}"`)
        const userSetting = await voiceRead.guilds
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
        })
      }
    }
  },
}

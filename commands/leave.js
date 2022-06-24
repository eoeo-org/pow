const { SlashCommandBuilder } = require('@discordjs/builders')
const voiceRead = require('../voiceRead')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('ボイスチャンネルから退出します。')
    .setDMPermission(false),

  async execute(interaction) {
    const ctx = voiceRead.guilds.get(interaction.member.guild)
    if (!ctx.isJoined()) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: 'エラー',
            description: 'BOTがVCに参加している必要があります。',
          },
        ],
        ephemeral: true,
      })
    }

    await ctx.leave()

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: 'ボイスチャンネルから退出しました。',
          description: 'またのご利用をお待ちしております。',
        },
      ],
    })
  },
}

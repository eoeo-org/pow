const { SlashCommandBuilder } = require("@discordjs/builders");
const { objToList } = require("../utils.js");
const voiceRead = require("../voiceRead");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("声の設定をランダムにします。"),

  async execute(interaction) {
    const userSetting = await voiceRead.guilds.get(interaction.member.guild)._randomUserSetting(interaction.member.id);

    return interaction.reply({
      embeds: [{
        color: 0x00FF00,
        title: "声の設定をランダムにしました。",
        description: "```\n" + objToList(userSetting) + "\n```"
      }]
    });
  }
};

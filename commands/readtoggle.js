const { SlashCommandBuilder } = require("@discordjs/builders");
const { objToList } = require("../utils.js");
const voiceRead = require("../voiceRead");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("readtoggle")
    .setDescription("メッセージを読み上げるかどうかを切り替えます。"),

  async execute(interaction) {
    const userSetting = await voiceRead.guilds.get(interaction.member.guild)._getUserSetting(interaction.member.id);
    if (userSetting.isDontRead) {
      await voiceRead.guilds.get(interaction.member.guild)._setUserSetting(interaction.member.id, "isDontRead", 0);
      return interaction.reply({
        embeds: [{
          color: 0x00FF00,
          title: "メッセージを読み上げるようにしました。",
        }]
      });
    } else {
      await voiceRead.guilds.get(interaction.member.guild)._setUserSetting(interaction.member.id, "isDontRead", 1);
      return interaction.reply({
        embeds: [{
          color: 0x00FF00,
          title: "メッセージを読み上げないようにしました。",
        }]
      });
    }
  }
};

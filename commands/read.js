const { SlashCommandBuilder } = require("@discordjs/builders");
const { objToList } = require("../utils.js");
const convertContent = require("../contentConverter");
const voiceRead = require("../voiceRead");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("read")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("喋らせたい内容")
        .setRequired(false))

    .setDescription("引数に渡されたメッセージを読み上げます。"),

  async execute(interaction, client) {
    const { options } = interaction;
    const text = options.getString("text");
    const ctx = voiceRead.guilds.get(interaction.guild);
    const convertedMessage = convertContent(text, interaction.guild.id, client).trim().replace("\n", "");
    if (convertedMessage.length === 0) return;
    ctx.addMessage(convertedMessage, interaction);
    if (!ctx.isJoined()) {
      return interaction.reply({
        embeds: [{
          color: 0xFF0000,
          title: "エラー",
          description: "BOTがVCに参加している必要があります。"
        }]
      });
    }
    else return interaction.reply("メッセージを読み上げキューに追加しました。")
  }
};

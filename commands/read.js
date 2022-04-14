const { SlashCommandBuilder } = require("@discordjs/builders");
const voiceRead = require("../voiceRead");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("read")
    .setDescription("引数に渡されたメッセージを読み上げます。")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("喋らせたい内容")
        .setRequired(false)),

  async execute(interaction) {
    const ctx = voiceRead.guilds.get(interaction.member.guild);
    const { options } = interaction;
    const text = options.getString("text");
    const convertedMessage = convertContent(text).trim().replace("\n", "");

    ctx.addMessage(text, convertedMessage);
    return interaction.reply("メッセージを読み上げキューに追加しました。");
  }
};

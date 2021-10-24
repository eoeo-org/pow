const { Command } = require("discord.js-commando");
const messageReader = require("../../voiceRead");

console.log(messageReader);

module.exports = class VCCommand extends Command {
  constructor(client) {
    super(client, {
      name: "join",
      group: "vc",
      description: "Join VC.",
      memberName: "join",
      guildOnly: true
    });
  }

  async run(message) {
    if (!message.member.voice.channel) {
      return message.channel.send(
        {embed: {
          color: 0xFF0000,
          title: "エラー",
          description: "VCに参加してからコマンドを実行してください。"
        }}
      );
    }

    const ctx = messageReader.guilds.get(message.guild);

    if (ctx.isJoined()) {
      return message.channel.send(
        {embed: {
          color: 0xFF0000,
          title: "エラー",
          description: "BOTはすでにVCに参加しています。"
        }}
      );
    }

    await ctx.join(message.channel, message.member.voice.channel);
    message.channel.send(
      {embed: {
        color: 0x00FF00,
        title: "ボイスチャンネルに参加しました。",
        description: `テキストチャンネル: ${message.channel}\nボイスチャンネル: ${message.member.voice.channel}`
      }}
    );
  }
};

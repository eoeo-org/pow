const { Command } = require("discord.js-commando");
const messageReader = require("../../voiceRead");

module.exports = class VCCommand extends Command {
  constructor(client) {
    super(client, {
      name: "leave",
      group: "vc",
      description: "Leave from VC.",
      memberName: "leave",
      guildOnly: true
    });
  }

  run(message) {
    const ctx = messageReader.guilds.get(message.guild);

    if (!ctx.isJoined()) {
      return message.channel.send(
        {embed: {
          color: 0xFF0000,
          title: "エラー",
          description: "BOTがVCに参加している必要があります。"
        }}
      );

    }

    ctx.leave();
    message.channel.send(
      {embed: {
        color: 0x00FF00,
        title: "ボイスチャンネルから退出しました。",
        description: "またのご利用をお待ちしております。"
      }}
    );
  }
};

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
      return message.channel.send("VCに参加してからコマンドを実行してください。");
    }

    const ctx = messageReader.guilds.get(message.guild);

    if (ctx.isJoined()) {
      return message.channel.send("BOTはすでにVCに参加しています。");
    }

    await ctx.join(message.channel, message.member.voice.channel);
  }
};

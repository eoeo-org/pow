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
      return message.channel.send("BOTがVCに参加している必要があります。");
    }

    ctx.leave();
  }
};

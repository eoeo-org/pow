const { Command } = require("discord.js-commando");
const messageReader = require("../../voiceRead");

module.exports = class VCCommand extends Command {
  constructor(client) {
    super(client, {
      name: "purge",
      group: "vc",
      description: "Purge queue",
      memberName: "purge",
      guildOnly: true
    });
  }

  run(message) {
    const ctx = messageReader.guilds.get(message.guild);

    ctx.readQueue.purge();

    message.react("😂");
  }
};


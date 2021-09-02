const { Command } = require("discord.js-commando");
const messageReader = require("../../voiceRead");

module.exports = class VCCommand extends Command {
  constructor(client) {
    super(client, {
      name: "debug",
      group: "vc",
      description: "debug",
      memberName: "debug",
      guildOnly: true
    });
  }

  async run(message) {
    console.log(messageReader.guilds);
    console.log(messageReader.guilds.get(message.guild).messageQueue.items.length);
  }
};


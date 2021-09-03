const { Command } = require("discord.js-commando");
const messageReader = require("../../voiceRead");

module.exports = class SettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "view",
      group: "settings",
      description: "View current voice setting.",
      memberName: "view",
      guildOnly: true
    });
  }

  run(message) {
    message.channel.send("Under construct");
    ctx.leave();
  }
};

const { Command } = require("discord.js-commando");
const messageReader = require("../../voiceRead");

module.exports = class VCCommand extends Command {
  constructor(client) {
    super(client, {
      name: "settings",
      group: "vc",
      description: "Change bot setting.",
      memberName: "settings",
      guildOnly: true
    });
  }

  run() {
    messageReader.sendSettingMenu();
  }
};

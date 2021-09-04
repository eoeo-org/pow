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

  run(message, args) {
    const allowedVoiceList = ["show", "haruka", "hikari", "takeru", "santa", "bear"];
    const userSetting = messageReader.guilds.get(message.guild)._getUserSetting(message.author.id);
    if (args.split(" ")[0] == "help") {
      message.channel.send("pow!settings speaker - 設定可能な話者リストを確認します。\npow!settings speaker <speaker> - 話者を<speaker>に設定します。\npow!settings view - 現在の声の設定を確認します。");
    }
    if (args.split(" ")[0] == "speaker") {
      if (!args.split(" ")[1]) return message.channel.send(`指定できる声のリストは、こちらです。\n\`\`\`${allowedVoiceList}\`\`\`\n現在の声の設定は、こちらです。\n\`\`\`${userSetting.speaker}\`\`\``);
      if (!allowedVoiceList.includes(args.split(" ")[1])) return message.channel.send(`その声(${args.split(" ")[1]})は指定できません。指定できる声のリストは、こちらです。\n\`\`\`${allowedVoiceList}\`\`\``)
      messageReader.guilds.get(message.guild)._setUserSetting(message.author.id, "speaker", args.split(" ")[1]);
      message.channel.send(`話者を${args.split(" ")[1]}に設定しました。`);
      return;
    }
    if (args.split(" ")[0] == "view") {
      message.channel.send(`現在の設定は、こちらです。\n\`\`\`${JSON.stringify(userSetting)}\`\`\``);
    }
    if (args.split(" ")[0] == "") {
      message.channel.send("ヘルプを見るには、`pow!settings help`を実行してください。");
    }
  }
};

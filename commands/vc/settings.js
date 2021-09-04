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
    args = args.split(" ");
    const allowedVoiceList = ["show", "haruka", "hikari", "takeru", "santa", "bear"];
    const userSetting = messageReader.guilds.get(message.guild)._getUserSetting(message.author.id);
    if (args[0] == "help") {
      message.channel.send("pow!settings speaker - 設定可能な話者リストを確認します。\npow!settings speaker <speaker> - 話者を<speaker>に設定します。\npow!settings speed - 設定可能な声の速度を確認します。\npow!settings speed <speed> - 声の速度を<speed>に設定します。\npow!settings view - 現在の声の設定を確認します。");
    }

    if (args[0] == "speaker") {
      if (!args[1]) return message.channel.send(`指定できる声のリストは、こちらです。\n\`\`\`${allowedVoiceList}\`\`\`\n現在の声の設定は、${userSetting.speaker}です。`);
      if (!allowedVoiceList.includes(args[1])) return message.channel.send(`その声(${args[1]})は指定できません。指定できる声のリストは、こちらです。\n\`\`\`${allowedVoiceList}\`\`\``)
      messageReader.guilds.get(message.guild)._setUserSetting(message.author.id, "speaker", args[1]);
      message.channel.send(`話者を${args[1]}に設定しました。`);
      return;
    }

    if (args[0] == "speed") {
      if (!args[1]) return message.channel.send(`指定できる声の速度は、50%~400%です。\n現在の声の速度は、${userSetting.speed}%です。`);
      if (args[1] < 50 || args[1] > 400) return message.channel.send(`その速度(${args[1]}%)は指定できません。指定できる声の速度は、50%~400%です。`)
      messageReader.guilds.get(message.guild)._setUserSetting(message.author.id, "speed", args[1]);
      message.channel.send(`声の速度を${args[1]}%に設定しました。`);
      return;
    }

    if (args[0] == "view") {
      message.channel.send(`現在の設定は、こちらです。\n\`\`\`${JSON.stringify(userSetting)}\`\`\``);
    }

    if (args[0] == "") {
      message.channel.send("ヘルプを見るには、`pow!settings help`を実行してください。");
    }
  }
};

const { Command } = require("discord.js-commando");
const messageReader = require("../../voiceRead");
const { objToList } = require("../../utils.js");
const { readFileSync } = require("fs");

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

  async run(message, args) {
    args = args.split(" ");
    const allowedVoiceList = ["show", "haruka", "hikari", "takeru", "santa", "bear"];

    if (args[0] == "") {
      message.channel.send({
        embed: {
          title: "設定コマンド一覧",
          description: "```\n" + readFileSync("./vc-help.txt").toString() + "\n```"
        }
      });
      return;
    }

    if (args[0] == "random") {
      const userSetting = await messageReader.guilds.get(message.guild)._randomUserSetting(message.author.id);
      message.channel.send({
        embed: {
          title: "声の設定をランダムにしました。",
          description: "```\n" + objToList(userSetting) + "\n```"
        }
      });
      return;
    }
  
    if (args[0] == "speaker") {
      const userSetting = await messageReader.guilds.get(message.guild)._getUserSetting(message.author.id);
      if (!args[1]) return message.channel.send(`指定できる声のリストは、こちらです。\n\`\`\`${allowedVoiceList}\`\`\`\n現在の声の設定は、${userSetting.speaker}です。`);
      if (!allowedVoiceList.includes(args[1])) return message.channel.send({
        embed: {
          title: "エラー",
          description: `その声(${args[1]})は指定できません。指定できる声のリストは、こちらです。\n\`\`\`${allowedVoiceList}\`\`\``
        }
      })
      messageReader.guilds.get(message.guild)._setUserSetting(message.author.id, "speaker", args[1]);
      message.channel.send({
        embed: {
          title: `話者を${args[1]}に設定しました。`
        }
      });
      return;
    }

    if (args[0] == "pitch") {
      if (!args[1]) return message.channel.send({
        embed: {
          color: 0xFF0000,
          title: "エラー",
          description: `指定できる声の高さ、50%~200%です。\n現在の声の高さは、${userSetting.pitch}%です。`
        }
      });
      if (args[1] < 50 || args[1] > 200 || !args[1].match(/^[0-9]*$/g)) return message.channel.send(`その高さ(${args[1]}%)は指定できません。指定できる声の高さは、50%~200%です。`)
      messageReader.guilds.get(message.guild)._setUserSetting(message.author.id, "pitch", args[1]);
      message.channel.send({
        embed: {
          title: `声の高さを${parseInt(args[1])}%に設定しました。`
        }
      });
      return;
    }

    if (args[0] == "speed") {
      const userSetting = await messageReader.guilds.get(message.guild)._getUserSetting(message.author.id);
      if (!args[1]) return message.channel.send(`指定できる声の速度は、50%~400%です。\n現在の声の速度は、${userSetting.speed}%です。`);
      if (args[1] < 50 || args[1] > 400 || !args[1].match(/^[0-9]*$/g)) return message.channel.send(
        {embed: {
          color: 0xFF0000,
          title: "エラー",
          description: `その速度(${args[1]}%)は指定できません。指定できる声の速度は、50%~400%です。`
        }}
      messageReader.guilds.get(message.guild)._setUserSetting(message.author.id, "speed", args[1]);
      message.channel.send({
        embed: {
          title: `声の速度を${parseInt(args[1])}%に設定しました。`
        }
      });
      return;
    }

    if (args[0] == "view") {
      const userSetting = await messageReader.guilds.get(message.guild)._getUserSetting(message.author.id);
      message.channel.send({
        embed: {
          title: "現在の設定",
          description: "```\n" + objToList(userSetting) + "\n```"
        }
      });
    }
  }
};

require("dotenv").config();

const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const client = new Client({ intents: Object.values(Intents.FLAGS) });
const convertContent = require("./contentConverter");
const messageReader = require("./voiceRead.js");

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

messageReader.initialize(client);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Servers: (${client.guilds.cache.size})`);
  client.guilds.cache.forEach(async guild => {
    console.log(`  - ${guild.name} (${guild.memberCount}) Owner: ${await guild.fetchOwner().then(owner => `${owner.user.username}#${owner.user.discriminator}`)}`);
  });
});

client.on("messageCreate", message => {
  if (message.author.bot) return;
  if (!['DEFAULT', 'REPLY'].includes(message.type)) return;
  if (message.content.startsWith("_")) return;
  if (message.content.includes("```")) return;

  const ctx = messageReader.guilds.get(message.guild);
  if (!ctx.isJoined()) return;
  if (ctx.textChannel !== message.channel) return;

  const convertedMessage = convertContent(message).trim().replace("\n", "");
  if (convertedMessage.length === 0) return;
  if (message.member.voice.channel === null) return;
  ctx.addMessage(message, convertedMessage);
});

client.on("interactionCreate", async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "コマンドの実行中にエラーが発生しました。", ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);

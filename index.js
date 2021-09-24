require("dotenv").config();

const Commando = require("discord.js-commando");
const path = require("path");
const convertContent = require("./contentConverter");
const messageReader = require("./voiceRead");

const client = new Commando.Client({
  owner: ["615059426369339392", "855599077542723604", "474413012120502304"],
  commandPrefix: "pow!"
});

messageReader.initialize(client);

client.on("ready", () => {
  console.log(`Servers: (${client.guilds.cache.size})`);
  client.guilds.cache.forEach(guild => {
    console.log(`  - ${guild.name} (${guild.memberCount}) Owner: ${guild.owner.user.tag}`);
  });
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  if (message.author.bot) return;
  if (message.channel.type !== "text") return;
  if (message.content.startsWith(client.commandPrefix)) return;
  if (message.content.startsWith(`<@!${client.user.id}>`)) return;

  const ctx = messageReader.guilds.get(message.guild);
  if (!ctx.isJoined()) return;
  if (ctx.textChannel !== message.channel) return;

  const convertedMessage = convertContent(message).trim().replace("\n", "");
  if (convertedMessage.length === 0) return;

  ctx.addMessage(message, convertedMessage);
});

client.on('voiceStateUpdate', (newState) => {
  let newUserChannel = newState.voiceChannel
  if (newUserChannel === undefined) {
    //client.channels.resolve("790677529227689994").send("a");
    if (client.channels.resolve("790151812366729217").members.size == 0) {
      //client.channels.resolve("790677529227689994").send("a");
    }
  }
});

client.registry
  .registerGroups([
    ["vc", "VC commands"]
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.login(process.env.TOKEN);

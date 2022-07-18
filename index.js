require('dotenv').config()

const fs = require('fs')
const {
  Client,
  Collection,
  GatewayIntentBits,
  InteractionType,
} = require('discord.js')
const { MessageType } = require('discord-api-types/v10')
const client = new Client({ intents: Object.values(GatewayIntentBits) })
const convertContent = require('./contentConverter')
const voiceRead = require('./voiceRead.js')

client.commands = new Collection()
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

voiceRead.initialize(client)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  console.log(`Servers: (${client.guilds.cache.size})`)
  client.guilds.cache.forEach(async (guild) => {
    console.log(
      `  - ${guild.name} (${guild.memberCount}) Owner: ${await guild
        .fetchOwner()
        .then(
          (owner) => `${owner.user.username}#${owner.user.discriminator}`,
        )}`,
    )
  })
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  if (![MessageType.Default, MessageType.Reply].includes(message.type)) return
  if (message.content.startsWith('_')) return
  if (message.content.includes('```')) return

  const ctx = voiceRead.guilds.get(message.guild)
  if (ctx.textChannel !== message.channel) return
  if (message.content === '') return
  const userSetting = await voiceRead.guilds
    .get(message.guild)
    ._getUserSetting(message.author.id)
  if (userSetting.isDontRead) return

  const convertedMessage = convertContent(
    message.content,
    message.guildId,
    client,
  )
    .trim()
    .replace('\n', '')
  if (convertedMessage.length === 0) return
  if (message.member.voice.channel === null) return
  ctx.addMessage(convertedMessage, message)
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    try {
      await command.execute(interaction, client)
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: 'コマンドの実行中にエラーが発生しました。',
        ephemeral: true,
      })
    }
  }
})

client.login(process.env.TOKEN)

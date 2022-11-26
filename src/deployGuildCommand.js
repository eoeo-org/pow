require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord.js')
const commands = []
const commandFiles = fs
  .readdirSync(path.resolve(__dirname, './commands'))
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)
console.log(
  `[Guild: (${process.env.GUILD_ID})] Started refreshing application (/) commands.`,
)

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID,
    ),
    { body: commands },
  )
  .then(() => {
    console.log(
      `[Guild: (${process.env.GUILD_ID})] Successfully reloaded application (/) commands.`,
    )
    process.exit()
  })
  .catch(console.error)

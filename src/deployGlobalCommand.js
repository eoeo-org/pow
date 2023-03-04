// @ts-check
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

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_TOKEN ?? '',
)
console.log('[Global] Started refreshing global (/) commands.')

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID ?? ''), {
    body: commands,
  })
  .then(() => {
    console.log('[Global] Successfully reloaded global (/) commands.')
    process.exit()
  })
  .catch(console.error)

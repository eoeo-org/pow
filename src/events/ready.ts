import type { Client, Guild } from 'discord.js'

export const readyEvent = (client: Client, packageJson) => {
  process.title = `${client.user?.tag} - pow v${packageJson.version}`
  console.log(`Logged in as ${client.user?.tag}!`)
  console.log(`Servers: (${client.guilds.cache.size})`)
  client.user?.setPresence({
    activities: [{ name: `pow - v${packageJson.version}` }],
  })
  client.guilds.cache.forEach(async (guild: Guild) => {
    console.log(
      `  - ${guild.name} (${guild.memberCount}) Owner: ${await guild
        .fetchOwner()
        .then((owner) => owner.user.tag)}`,
    )
  })
}

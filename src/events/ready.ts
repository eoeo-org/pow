import { ActivityType, type Client, type Guild } from 'discord.js'

export const readyEvent = (client: Client) => {
  process.title = `${client.user?.tag} - pow v${process.env.npm_package_version}`
  console.log(`Logged in as ${client.user?.tag}!`)
  console.log(`Servers: (${client.guilds.cache.size})`)
  client.user?.setPresence({
    activities: [
      {
        name: `pow - v${process.env.npm_package_version}`,
        type: ActivityType.Custom,
      },
    ],
  })
  void Promise.all(
    client.guilds.cache.map(async (guild: Guild) =>
      console.log(
        `  - ${guild.name} (${guild.memberCount}) Owner: ${await guild
          .fetchOwner()
          .then((owner) => owner.user.tag)}`,
      ),
    ),
  )
}

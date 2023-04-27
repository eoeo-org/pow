import { Client } from 'discord.js'

class WorkerClient extends Client {
  constructor(
    token: string,
    mainClient: Client,
    workerClientMap: WorkerClientMap,
  ) {
    super({ intents: ['Guilds', 'GuildVoiceStates'] })
    this.on('ready', () => this.onReady(mainClient, workerClientMap))
    this.login(token)
  }
  private onReady(mainClient: Client, workerClientMap: WorkerClientMap) {
    console.log(`Ready as ${this.user?.tag}`)
    workerClientMap.set(this.user!.id, this)
    this.user?.setPresence({
      activities: [{ name: `pow worker - ${mainClient.user?.tag}` }],
    })
  }
}

export class WorkerClientMap extends Map<string, Client> {
  constructor(tokens: string, mainClient: Client) {
    super()
    tokens.split(',').forEach((v) => {
      new WorkerClient(v, mainClient, this)
    })
  }
}

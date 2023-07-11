import { Client } from 'discord.js'

export class WorkerNullError extends Error {
  code = 'WORKER_USER_IS_NULL' as const
}

class WorkerClient extends Client {
  constructor(mainClient: Client) {
    super({ intents: ['Guilds', 'GuildVoiceStates'] })
    this.on('ready', () => this.onReady(mainClient))
  }
  private onReady(mainClient: Client) {
    console.log(`Ready as ${this.user?.tag}`)
    this.user?.setPresence({
      activities: [{ name: `${mainClient.user?.tag} - worker` }],
      status: 'dnd',
    })
  }
  public async start(token: string) {
    await this.login(token)
    return this
  }
}

export class WorkerClientMap extends Map<string, Client> {
  public async init(tokens: string, mainClient: Client) {
    await Promise.all(
      tokens.split(',').map(async (token) => {
        const workerClient = await new WorkerClient(mainClient).start(token)
        if (workerClient.user === null) throw new WorkerNullError()
        this.set(workerClient.user.id, workerClient)
      }),
    )
    return this
  }
}

import { ActivityType, Client, Events } from 'discord.js'

export class WorkerNullError extends Error {
  code = 'WORKER_USER_IS_NULL' as const
}

class WorkerClient<Ready extends boolean = boolean> extends Client<Ready> {
  constructor(readonly mainClient: Client<true>) {
    super({ intents: ['Guilds', 'GuildVoiceStates'] })
    this.on(Events.ClientReady, (client) => {
      this.#onReady(client)
    })
  }
  #onReady(client: Client<true>) {
    console.log(`Ready as ${client.user.tag}`)
    client.user.setPresence({
      activities: [
        {
          name: `${this.mainClient.user.tag} - worker`,
          type: ActivityType.Custom,
        },
      ],
      status: 'dnd',
    })
  }
  public async start(token: string) {
    await this.login(token)
    return this
  }
}

export class WorkerClientMap extends Map<string, Client> {
  public async init(tokens: string, mainClient: Client<true>) {
    await Promise.all(
      tokens.split(',').map(async (token) => {
        const workerClient = await new WorkerClient(mainClient).start(token)
        if (workerClient.user === null) throw new WorkerNullError()
        this.set(workerClient.user.id, workerClient)
      }),
    )
    this.set(mainClient.user.id, mainClient)
    return this
  }
}

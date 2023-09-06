declare namespace NodeJS {
  interface ProcessEnv {
    readonly DISCORD_TOKEN: string
    readonly WORKER_TOKENS: string
    readonly VOICETEXT_API_KEY: string
    readonly DB_HOST: string
    readonly DB_PORT: string
    readonly DB_USER: string
    readonly DB_PASSWORD: string
    readonly DB_DATABASE: string
  }
}

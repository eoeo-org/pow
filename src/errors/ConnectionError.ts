import { PowError } from './PowError.js'

export class ConnectionError extends PowError {
  override name = '接続エラー'
}

export class AlreadyJoinedError extends ConnectionError {
  override message = 'BOTはすでにVCに参加しています。'
}

export class AlreadyUsedChannelError extends ConnectionError {
  constructor(guildId: string, channelId: string) {
    const message = `このテキストチャンネルは https://discord.com/channels/${guildId}/${channelId} で既に使われています。`
    super(message)
  }
}

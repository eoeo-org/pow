import type { APIEmbed } from 'discord.js'
import { PowError } from './PowError.js'

export class FetchResponseError extends PowError {
  override name = 'APIリクエストエラー'
  override get embed(): APIEmbed {
    return {
      color: 0xff0000,
      title: this.name,
      description: `${this.response.status}: ${this.response.statusText}`,
    }
  }
  constructor(
    message: string,
    public response: Response,
  ) {
    super(message)
  }
}

export class FetchAudioStreamError extends FetchResponseError {
  static message = 'Error while requesting audio.'
  constructor(response: Response) {
    super(FetchAudioStreamError.message, response)
  }
}

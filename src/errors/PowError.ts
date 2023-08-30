import type {
  APIEmbed,
  InteractionReplyOptions,
  MessageReplyOptions,
} from 'discord.js'

export class PowError extends Error {
  static getEmbed(e: PowError): APIEmbed {
    return {
      color: 0xff0000,
      title: e.name,
      description: e.message,
    }
  }
  get toInteractionReplyOptions(): InteractionReplyOptions {
    return {
      embeds: [PowError.getEmbed(this)],
      ephemeral: true,
    }
  }
  get toMessageReplyOptions(): MessageReplyOptions {
    return {
      embeds: [PowError.getEmbed(this)],
    }
  }
}

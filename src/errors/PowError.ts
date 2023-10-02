import type {
  APIEmbed,
  InteractionReplyOptions,
  MessageReplyOptions,
} from 'discord.js'

export class PowError extends Error {
  get embed(): APIEmbed {
    return {
      color: 0xff0000,
      title: this.name,
      description: this.message,
    }
  }
  toInteractionReplyOptions(): InteractionReplyOptions {
    return {
      embeds: [this.embed],
      ephemeral: true,
    }
  }
  toMessageReplyOptions(): MessageReplyOptions {
    return {
      embeds: [this.embed],
    }
  }
}

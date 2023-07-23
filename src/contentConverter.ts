const URLPattern = /(https?|vrchat):\/\/[^\s>]+/g
import emojiRegExp from 'emoji-regex'
import {
  activity,
  flags,
  food,
  nature,
  objects,
  people,
  symbols,
  travel,
} from 'discord-emoji'
import type { Client, Collection, Embed, Sticker } from 'discord.js'

const emojiRegex = emojiRegExp()

const dismoji = new Map(
  Object.entries({
    ...activity,
    ...flags,
    ...food,
    ...nature,
    ...objects,
    ...people,
    ...symbols,
    ...travel,
  })
    .map(([key, value]) => [key, (value as string).replace(/\u{FE0F}$/u, '')])
    .reverse()
    .map(([key, value]) => [value, key]),
)

function getShortcodes(emoji: string) {
  return ` ${dismoji.get(emoji.replace(/(\u{FE0E}|\u{FE0F})$/u, ''))} `
}

export const convertContent = (
  text: string,
  embeds: Embed[],
  stickers: Collection<string, Sticker>,
  guildId: string,
  client: Client,
) => {
  if (!guildId) throw new Error('There is no guildId.')

  function parseContent(a, b, c) {
    const gm = client.guilds.resolve(guildId)!.members
    const gr = client.guilds.resolve(guildId)!.roles
    const gc = client.guilds.resolve(guildId)!.channels

    //console.log(a, b, c)

    switch (b) {
      case '@':
      case '@!':
        return gm.resolve(c) ? gm.resolve(c).displayName : ''
      case '@&':
        return gr.resolve(c) ? gr.resolve(c).name : ''
      case '#':
        return gc.resolve(c) ? gc.resolve(c).name : ''
      default:
        return ''
    }
  }

  function resolveURL(matchedStr: string, group1: string) {
    if (group1 === 'vrchat') return 'VRChatへのリンク'
    const matchedUrl = matchedStr.replace(/\/\/[^\/]+(\s|$)/, '$&/')
    return `${
      embeds.find((data) => data.url === matchedUrl)?.data.title ??
      matchedUrl.replace(/.+?\/\/(?:www.)?(.+?)\/.*/, '$1')
    }へのリンク`
  }

  const result =
    text
      .replaceAll(/<(@[!&]?|#)!?([\d]+)>/g, parseContent)
      .replaceAll(URLPattern, resolveURL)
      .replaceAll(/\|\|.+?\|\|/gs, '')
      .replaceAll(/<a?:(\w{2,32}):\d{17,19}>/g, '$1')
      .replaceAll(
        /<\/([-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}):\d{1,20}>/gu,
        '$1',
      )
      .replaceAll(/~/g, '')
      .replaceAll(/\*/g, '')
      .replaceAll(emojiRegex, getShortcodes) +
    '\n' +
    stickers.map((sticker) => sticker.name).join('\n')

  return result
}

// .replace(/<(@[!&]?|#)!?([\d]+)>/g, contentParser);
/*
  require: Discord.js message(v12) or messageCreate(v13) event argument

  example:
    const contentParser = require("./contentParser.js");
    contentParser(message);

  url: https://google.com
  user: @ced#0180
  channel: #1
  role: @ぽット
*/

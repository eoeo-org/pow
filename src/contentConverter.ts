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
import type { Client } from 'discord.js'

const emojiRegex = emojiRegExp()

const dismoji = new Map(
  Object.entries(
    Object.assign(
      activity,
      flags,
      food,
      nature,
      objects,
      people,
      symbols,
      travel,
    ),
  )
    .reverse()
    .map(([key, value]) => [value, key]),
)

function getShortcodes(emoji: string) {
  return ` ${dismoji.get(emoji)} `
}

export const convertContent = (
  text: string,
  guildId: string,
  client: Client,
) => {
  if (!text) throw new Error('There is no first argument.')
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

  let result = text
    .replace(/<(@[!&]?|#)!?([\d]+)>/g, parseContent)
    .replaceAll(URLPattern, '')
    .replaceAll(/\|\|.+?\|\|/gs, '')
    .replaceAll(/<a?:(\w{2,32}):\d{17,19}>/g, '$1')
    .replaceAll(
      /<\/([-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}):\d{1,20}>/gu,
      '$1',
    )
    .replaceAll(/~/g, '')
    .replaceAll(/\*/g, '')
    .replaceAll(emojiRegex, function (x) {
      return getShortcodes(x)
    })

  return result.match(/(<a?)?:\w+:(\d{18}>)?/) ? '' : result
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

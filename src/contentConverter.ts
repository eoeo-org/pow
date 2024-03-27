const URLPattern =
  /(?<scheme>[a-zA-Z]([a-zA-Z0-9+.-])*):(?<hier_part>\/\/((?<userinfo>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:)*@)?(?<host>\[(?<ipv6address>(((?<h16_0>([0-9a-fA-F]{1,4})):){6}(?<ls32_0>((?<h16_1>([0-9a-fA-F]{1,4})):(?<h16_2>([0-9a-fA-F]{1,4}))|(?<ipv4address_0>((?<dec_octet_0>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_1>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_2>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_3>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|::((?<h16_3>([0-9a-fA-F]{1,4})):){5}(?<ls32_1>((?<h16_4>([0-9a-fA-F]{1,4})):(?<h16_5>([0-9a-fA-F]{1,4}))|(?<ipv4address_1>((?<dec_octet_4>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_5>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_6>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_7>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|((?<h16_6>([0-9a-fA-F]{1,4})))?::((?<h16_7>([0-9a-fA-F]{1,4})):){4}(?<ls32_2>((?<h16_8>([0-9a-fA-F]{1,4})):(?<h16_9>([0-9a-fA-F]{1,4}))|(?<ipv4address_2>((?<dec_octet_8>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_9>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_10>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_11>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_10>([0-9a-fA-F]{1,4})):){0,1}(?<h16_11>([0-9a-fA-F]{1,4})))?::((?<h16_12>([0-9a-fA-F]{1,4})):){3}(?<ls32_3>((?<h16_13>([0-9a-fA-F]{1,4})):(?<h16_14>([0-9a-fA-F]{1,4}))|(?<ipv4address_3>((?<dec_octet_12>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_13>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_14>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_15>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_15>([0-9a-fA-F]{1,4})):){0,2}(?<h16_16>([0-9a-fA-F]{1,4})))?::((?<h16_17>([0-9a-fA-F]{1,4})):){2}(?<ls32_4>((?<h16_18>([0-9a-fA-F]{1,4})):(?<h16_19>([0-9a-fA-F]{1,4}))|(?<ipv4address_4>((?<dec_octet_16>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_17>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_18>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_19>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_20>([0-9a-fA-F]{1,4})):){0,3}(?<h16_21>([0-9a-fA-F]{1,4})))?::(?<h16_22>([0-9a-fA-F]{1,4})):(?<ls32_5>((?<h16_23>([0-9a-fA-F]{1,4})):(?<h16_24>([0-9a-fA-F]{1,4}))|(?<ipv4address_5>((?<dec_octet_20>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_21>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_22>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_23>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_25>([0-9a-fA-F]{1,4})):){0,4}(?<h16_26>([0-9a-fA-F]{1,4})))?::(?<ls32_6>((?<h16_27>([0-9a-fA-F]{1,4})):(?<h16_28>([0-9a-fA-F]{1,4}))|(?<ipv4address_6>((?<dec_octet_24>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_25>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_26>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_27>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))))|(((?<h16_29>([0-9a-fA-F]{1,4})):){0,5}(?<h16_30>([0-9a-fA-F]{1,4})))?::(?<h16_31>([0-9a-fA-F]{1,4}))|(((?<h16_32>([0-9a-fA-F]{1,4})):){0,6}(?<h16_33>([0-9a-fA-F]{1,4})))?::))\]|(?<ipv4address_7>((?<dec_octet_28>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_29>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_30>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))\.(?<dec_octet_31>([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))))|(?<reg_name>([a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=])*))(:(?<port>[0-9]*))?(?<path>(?<path_abempty>(\/(?<segment_path_abempty>((?<pchar_segment_path_abempty>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))*)|(?<path_absolute>(\/(?<segment_nz_path_absolute>((?<pchar_segment_nz_path_absolute>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))+)(\/(?<segment_path_absolute>((?<pchar_segment_path_absolute>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))+?))|(?<path_noscheme>((?<segment_nz_nc_path_noscheme>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|@)(\/(?<segment_path_noscheme>((?<pchar_segment_path_noscheme>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))*))|(?<path_rootless>((?<segment_nz_path_rootless>((?<pchar_segment_nz_path_rootless>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))+)(\/(?<segment_path_rootless>((?<pchar_segment_path_rootless>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@))*))*))|(?:)))(\?(?<query>((?<pchar_query>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@)|\/|\?)*))?(#(?<fragment>((?<pchar_fragment>[a-zA-Z0-9._~-]|%[0-9a-fA-F]{2}|[!$&'()*+,;=]|:|@)|\/|\?)*))?/g
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

  function resolveURL(...args: unknown[]) {
    const groups = args.at(-1) as Record<string, string | null>
    switch (groups['scheme']) {
      case 'http':
      case 'https':
        return `${
          embeds.find((data) => data.url === args.shift())?.data.title ??
          (groups['ipv6address'] ? 'ipv6 アドレス' : groups['host'])
        }へのリンク`
      default:
        return `${groups['scheme']}へのリンク`
    }
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

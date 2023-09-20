import {
  Guild,
  User,
  type GuildTextBasedChannel,
  type VoiceBasedChannel,
} from 'discord.js'

declare const userIdNominality: unique symbol
declare const VoiceBasedChannelIdNominality: unique symbol
declare const guildIdNominality: unique symbol
declare const GuildTextBasedChannelIdNominality: unique symbol
export type UserId = string & { [userIdNominality]: never }
export type VoiceBasedChannelId = string & {
  [VoiceBasedChannelIdNominality]: never
}
export type GuildId = string & { [guildIdNominality]: never }
export type GuildTextBasedChannelId = string & {
  [GuildTextBasedChannelIdNominality]: never
}

export const newGuildId = (channel: Guild) => {
  return channel.id as VoiceBasedChannelId
}
export const newGuildTextBasedChannelId = (channel: GuildTextBasedChannel) => {
  return channel.id as GuildTextBasedChannelId
}

export const newUserId = (user: User): UserId => {
  return user.id as UserId
}
export const newVoiceBasedChannelId = (channel: VoiceBasedChannel) => {
  return channel.id as VoiceBasedChannelId
}

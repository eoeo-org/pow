import type { VoiceBasedChannel } from 'discord.js'
import {
  HandleInteractionError,
  HandleInteractionErrorType as ErrorType,
} from '../errors/index.js'

export const checkUserAlreadyJoined: (
  voiceChannel: VoiceBasedChannel | null,
) => asserts voiceChannel is VoiceBasedChannel = (voiceChannel) => {
  if (voiceChannel === null)
    throw new HandleInteractionError(ErrorType.userNotJoined)
}

export const checkCanJoin = (voiceChannel: VoiceBasedChannel): void => {
  if (!voiceChannel.joinable)
    throw new HandleInteractionError(ErrorType.cannotJoined)
}

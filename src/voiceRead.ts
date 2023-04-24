import debug from 'debug'
const debug__ErrorHandler = debug('voiceRead.js:ErrorHandler')

import axios, { AxiosError } from 'axios'
import { getProperty } from './utils.js'

export interface UserSetting {
  id?: bigint
  speaker: 'show' | 'haruka' | 'hikari' | 'takeru' | 'santa' | 'bear'
  pitch: number
  speed: number
  isDontRead: 0 | 1
}

export async function fetchAudioStream(
  text: string,
  speaker: string,
  pitch: number,
  speed: number,
) {
  return await axios
    .post(
      'https://api.voicetext.jp/v1/tts',
      new URLSearchParams({
        text: text,
        speaker: speaker,
        pitch: pitch.toString(),
        speed: speed.toString(),
        format: 'mp3',
      }),
      {
        auth: { username: process.env.VOICETEXT_API_KEY, password: '' },
        responseType: 'stream',
      },
    )
    .then(getProperty('data'))
    .catch((err: AxiosError) => {
      debug__ErrorHandler(
        `Error while requesting audio: ${err.response?.status} ${err.response?.statusText}`,
      )
      throw err
    })
}
